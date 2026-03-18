
import React, { useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole, AccountingSystem, OrderType, DeliveryTrackingStatus, TransactionType, CompanyTxType } from '../types';

// --- خوارزمية التقريب المخصصة ---
const customRound = (val: number): number => {
    if (!isFinite(val) || isNaN(val)) return 0;
    const integral = Math.floor(val);
    const fractional = parseFloat((val - integral).toFixed(2));
    if (fractional < 0.5) return integral;
    if (fractional >= 0.75) return integral + 1;
    return integral + 0.5; 
};

// --- Icons ---
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

const UserLedgerPage: React.FC = () => {
    const { userId } = ReactRouterDOM.useParams<{ userId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { users, orders, financialTransactions, companyTransactions, getExchangeRateForDate, systemSettings } = useAppContext();
    
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const user = users.find(u => String(u.id) === userId);
    const isStoreOwner = user?.role === UserRole.Store;
    const isEmployee = user?.role === UserRole.Employee;
    const hasFixedSalary = user?.fixedSalary && Number(user.fixedSalary) > 0;

    const ledgerData = useMemo(() => {
        if (!user) return null;

        const userStoreIds = user.storeIds || [];
        const entries: any[] = [];
        
        // 1. معالجة المستحقات (الراتب أو العمولات أو المبيعات)
        if (isStoreOwner) {
            const myOrders = orders.filter(o => (userStoreIds.includes(o.storeId)) && o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered && !o.isDeleted);
            myOrders.forEach(o => {
                const isInstant = o.orderType === OrderType.InstantDelivery;
                const pieces = (o.items || []).reduce((q, i) => q + Number(i.quantity), 0);
                const rateToUse = user.customExchangeRate || Number(o.exchangeRateSnapshot) || getExchangeRateForDate(o.date);
                
                // حساب التكلفة بناءً على نوع الطلب
                let costLYD = 0;
                if (isInstant) {
                    // في التوصيل الفوري، التكلفة هي سعر العرض الأصلي في النظام (basePriceSnapshot)
                    // إذا لم يتوفر السناب شوت (للطلبيات القديمة)، نعتبر التكلفة 0 لضمان تطابق الأرصدة مع القائمة الخارجية
                    costLYD = (o.items || []).reduce((sum, item) => sum + (Number(item.basePriceSnapshot || 0) * item.quantity), 0);
                } else {
                    // في الطلبات الدولية، التكلفة تعتمد على التكلفة بالدولار وسعر الصرف
                    costLYD = (Number(o.costInUSD || 0) * rateToUse);
                }

                const commissionPercentage = user.isCommissionExempt ? 0 : (systemSettings?.purchaseCommissionPercentage ?? 5);
                const companyCommission = isInstant ? 0 : (costLYD * (commissionPercentage / 100));

                entries.push({ id: `REV-${o.id}`, date: o.date, type: 'إيراد مبيعات', notes: `مبيعات الزبون ${o.customerName} (${pieces} قطعة)`, credit: o.total, debit: 0 });
                
                if (costLYD > 0) {
                    entries.push({ 
                        id: `COST-${o.id}`, 
                        date: o.date, 
                        type: isInstant ? 'تكلفة المنتج (سعر النظام)' : 'تكلفة بضاعة', 
                        notes: isInstant ? `القيمة الأصلية للمنتج في النظام` : `قيمة الشراء ($${o.costInUSD}) ${user.customExchangeRate ? '[سعر خاص]' : ''}`, 
                        credit: 0, 
                        debit: customRound(costLYD) 
                    });
                }
                
                if (companyCommission > 0) {
                    entries.push({ id: `COMM-${o.id}`, date: o.date, type: 'عمولة شراء', notes: `عمولة خدمة الشراء (${commissionPercentage}%)`, credit: 0, debit: customRound(companyCommission) });
                }
            });
        }
 else if (isEmployee && hasFixedSalary) {
            entries.push({ id: `SAL-${user.id}`, date: new Date().toISOString(), type: 'مرتب شهري', notes: `المرتب الثابت المعتمد في بيانات الموظف`, credit: Number(user.fixedSalary), debit: 0 });
        } else if (isEmployee) {
            const myOrders = orders.filter(o => ((o.beneficiaryId === user.id) || (!o.beneficiaryId && userStoreIds.includes(o.storeId))) && o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered && !o.isDeleted);
            myOrders.forEach(o => {
                const pieces = (o.items || []).reduce((q, i) => q + Number(i.quantity), 0);
                const rate = getExchangeRateForDate(o.date);
                const costLYD = (Number(o.costInUSD || 0) * rate);
                const margin = o.total - costLYD;
                
                let profit = 0;
                if (o.orderType === OrderType.InstantDelivery) {
                    const extraMarkup = (o.items || []).reduce((sum, item) => {
                        const basePrice = item.basePriceSnapshot || item.price;
                        return sum + (Math.max(0, item.price - basePrice) * item.quantity);
                    }, 0);
                    profit = extraMarkup + (pieces * 10);
                } else {
                    if (user.accountingSystem === AccountingSystem.Commission) {
                        profit = pieces * 10;
                    } else {
                        profit = margin * 0.4;
                    }
                }
                
                entries.push({ id: `ORD-${o.id}`, date: o.date, type: 'عمولة مبيعات', notes: `بيع ${pieces} قطعة لـ ${o.customerName}`, credit: customRound(profit), debit: 0 });
            });
        }

        // 2. الحركات المالية اليدوية (المسحوبات الشخصية)
        financialTransactions.filter(tx => tx.userId === user.id).forEach(tx => {
            if (tx.type === TransactionType.SubscriptionFee && user.isSubscriptionExempt) return;
            entries.push({
                id: `FIN-${tx.id}`,
                date: tx.date,
                type: tx.type === TransactionType.Withdrawal ? 'سحب رصيد' : (tx.type === TransactionType.SubscriptionFee ? 'رسوم اشتراك' : 'إيداع/سداد رصيد'),
                notes: tx.notes || tx.type,
                credit: tx.type === TransactionType.Payment ? tx.amount : 0,
                debit: (tx.type === TransactionType.Withdrawal || tx.type === TransactionType.SubscriptionFee) ? tx.amount : 0
            });
        });

        // 3. الخصومات الإدارية والمصاريف
        // تم تصحيح الفلتر هنا ليشمل فقط "المصاريف" و"الخصومات" ويستبعد "التحصيلات"
        companyTransactions.filter(tx => {
            const isTargetedToThisUser = tx.targetUserId === user.id;
            const isGeneralStoreDeduction = !tx.targetUserId && isStoreOwner && userStoreIds.includes(tx.storeId || 0);
            const isRelevantType = tx.type === CompanyTxType.Expense || tx.type === CompanyTxType.StoreDeduction;
            return (isTargetedToThisUser || isGeneralStoreDeduction) && isRelevantType;
        }).forEach(tx => {
            entries.push({ 
                id: `COM-${tx.id}`, 
                date: tx.date || new Date().toISOString(), 
                type: tx.type === CompanyTxType.StoreDeduction ? 'خصم مالي' : 'مصروف إداري', 
                notes: `${tx.description} (${tx.expenseCategory || 'عام'})`, 
                credit: 0, 
                debit: tx.amount 
            });
        });

        const sorted = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const filtered = sorted.filter(tx => {
            if (selectedMonth === 'all') return true;
            const txDate = new Date(tx.date);
            return txDate.getMonth().toString() === selectedMonth && txDate.getFullYear().toString() === selectedYear;
        });

        const totalCredit = filtered.reduce((sum, tx) => sum + tx.credit, 0);
        const totalDebit = filtered.reduce((sum, tx) => sum + tx.debit, 0);
        const balance = totalCredit - totalDebit;

        return { entries: filtered, totalCredit, totalDebit, balance, isCustomRateUsed: !!user.customExchangeRate };
    }, [user, orders, financialTransactions, companyTransactions, getExchangeRateForDate, systemSettings, selectedMonth, selectedYear, isStoreOwner, isEmployee, hasFixedSalary]);

    const handlePrint = () => {
        const printContent = document.getElementById('ledger-printable-area');
        if (!printContent) return;
        const printWindow = window.open('', '', 'height=1000,width=1200');
        if (!printWindow) return;
        printWindow.document.write('<html><head><title>كشف حساب مالي</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"><style>body { font-family: "Cairo", sans-serif; direction: rtl; padding: 40px; background: white; } @media print { .no-print { display: none !important; } }</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 1000);
    };

    if (!user || !ledgerData) return null;

    return (
        <div className="max-w-[1600px] mx-auto p-3 md:p-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 no-print">
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-yellow-500 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-3xl text-white shadow-xl">{user.name.charAt(0)}</div>
                    <div className="flex-grow">
                        <h1 className="text-lg md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{user.name}</h1>
                        <p className="text-[9px] md:text-sm text-gray-500 font-bold">{isStoreOwner ? 'صاحب متجر شريك' : 'موظف'} | {user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handlePrint} className="flex-1 md:flex-none bg-gray-900 text-white px-4 md:px-6 py-2 rounded-xl font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 text-[10px] md:text-sm"><PrintIcon /> طباعة الكشف</button>
                    <button onClick={() => navigate(-1)} className="bg-gray-100 text-gray-700 px-4 md:px-6 py-2 rounded-xl font-bold text-[10px] md:text-sm">رجوع</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-lg border mb-6 md:mb-8 no-print flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
                <div className="flex items-center gap-2"><span className="font-black text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">تصفية الفترة:</span></div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="flex-1 md:flex-none p-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl font-bold text-[10px] md:text-sm">
                        <option value="all">كامل السجل</option>
                        {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="flex-1 md:flex-none p-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl font-bold text-[10px] md:text-sm">
                        {['2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                {ledgerData.isCustomRateUsed && (
                    <div className="w-full md:w-auto md:mr-auto px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[8px] font-black border border-blue-100 animate-pulse text-center">
                        يتم الحساب بسعر صرف خاص ومعتمد لهذا الحساب
                    </div>
                )}
            </div>

            <div id="ledger-printable-area">
                <div className="hidden print:block mb-10 pb-8 border-b-4 border-yellow-500">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-5xl font-black text-yellow-600 tracking-tighter">LibyPort</h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest mt-1">بوابة طرابلس العالمية للتجارة والشحن</p>
                        </div>
                        <div className="text-left">
                            <h2 className="text-3xl font-black text-gray-800">كشف حساب مالي مخصص</h2>
                            <p className="text-lg font-bold text-gray-500 mt-1">الاسم: {user.name}</p>
                            <p className="text-gray-400 font-bold">{selectedMonth === 'all' ? 'كامل السجل' : `${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][Number(selectedMonth)]} / ${selectedYear}`}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl mb-6 md:mb-10 border-b-4 md:border-b-8 border-yellow-500 flex flex-col md:flex-row justify-between items-center gap-5 md:gap-8 relative overflow-hidden print:bg-white print:text-black print:border print:rounded-3xl">
                     <div className="relative z-10 text-center md:text-right w-full md:w-auto flex flex-row md:flex-col items-baseline md:items-start justify-center md:justify-start gap-2 md:gap-0">
                        <p className="text-[9px] md:text-sm font-black text-yellow-500 uppercase tracking-widest mb-1">صافي الرصيد المستحق:</p>
                        <p className={`text-xl md:text-4xl font-black font-mono ${ledgerData.balance.toLocaleString().startsWith('-') ? 'text-red-500' : 'text-white'}`}>{ledgerData.balance.toLocaleString()} <span className="text-sm md:text-2xl font-normal opacity-50">د.ل</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-4 w-full md:w-auto">
                        <div className="bg-white/10 p-3 md:p-5 rounded-xl md:rounded-3xl border border-white/10 text-center backdrop-blur-sm print:bg-gray-100 print:text-black">
                            <p className="text-[7px] md:text-[10px] font-black text-white/50 print:text-gray-500 uppercase mb-1">إجمالي المستحقات (+)</p>
                            <p className="text-sm md:text-2xl font-black text-green-400 print:text-green-600">{ledgerData.totalCredit.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 p-3 md:p-5 rounded-xl md:rounded-3xl border border-white/10 text-center backdrop-blur-sm print:bg-gray-100 print:text-black">
                            <p className="text-[7px] md:text-[10px] font-black text-white/50 print:text-gray-500 uppercase mb-1">إجمالي المسحوبات (-)</p>
                            <p className="text-sm md:text-2xl font-black text-red-400 print:text-red-600">{ledgerData.totalDebit.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-2xl border dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] md:text-base text-right">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black text-[9px] md:text-[11px] uppercase tracking-widest border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4">التاريخ</th>
                                    <th className="px-2 md:px-4 py-3 md:py-4">نوع الحركة</th>
                                    <th className="px-2 md:px-4 py-3 md:py-4">البيان والوصف</th>
                                    <th className="px-2 md:px-4 py-3 md:py-4 text-center">دائن (+)</th>
                                    <th className="px-2 md:px-4 py-3 md:py-4 text-center">مدين (-)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {ledgerData.entries.map(tx => {
                                    const dateObj = new Date(tx.date);
                                    const dateStr = isNaN(dateObj.getTime()) ? '-' : dateObj.toLocaleDateString('ar-LY');
                                    return (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-3 md:px-6 py-3 md:py-4 font-mono text-gray-500 font-bold whitespace-nowrap">{dateStr}</td>
                                            <td className="px-2 md:px-4 py-3 md:py-4"><span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase border ${tx.credit > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{tx.type}</span></td>
                                            <td className="px-2 md:px-4 py-3 md:py-4 font-black text-gray-800 dark:text-white leading-tight min-w-[140px] md:min-w-[250px]">{tx.notes}</td>
                                            <td className="px-2 md:px-4 py-3 md:py-4 text-center font-black text-green-600 text-sm md:text-lg">{tx.credit > 0 ? tx.credit.toLocaleString() : '-'}</td>
                                            <td className="px-2 md:px-4 py-3 md:py-4 text-center font-black text-red-600 text-sm md:text-lg">{tx.debit > 0 ? tx.debit.toLocaleString() : '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="h-20 no-print"></div>
        </div>
    );
};

export default UserLedgerPage;
