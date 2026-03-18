
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, TransactionType, DeliveryTrackingStatus, OrderType, AccountingSystem, CompanyTxType, TreasuryType, Order, FinancialTransaction, CompanyTransaction, PaymentStatus, PaymentMethod } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

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
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

const FinancialsPage: React.FC = () => {
    const { 
        currentUser, financialTransactions, users, companyTransactions, 
        orders, getExchangeRateForDate, stores, systemSettings, 
        treasuries, addCompanyTransaction, treasuryBalances 
    } = useAppContext();
    const [activeTab, setActiveTab] = useState<'settlements' | 'treasuries'>('settlements');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferData, setTransferData] = useState({ fromId: '', toId: '', amount: 0, notes: '' });
    const navigate = ReactRouterDOM.useNavigate();

    const isAdmin = useMemo(() => 
        currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role), 
    [currentUser]);

    const settlements = useMemo(() => {
        if (!currentUser) return [];

        let targetUsers = users.filter(u => !u.isDeleted && u.isActive && (u.role === UserRole.Store || u.role === UserRole.Employee));
        if (!isAdmin) targetUsers = targetUsers.filter(u => u.id === currentUser.id);

        // تحسين الأداء: تجميع البيانات مسبقاً لتقليل عدد التكرارات
        const ordersByBeneficiary = new Map<number, Order[]>();
        const ordersByStore = new Map<number, Order[]>();
        
        orders.forEach(o => {
            if (o.isDeleted || o.deliveryTrackingStatus !== DeliveryTrackingStatus.Delivered) return;
            
            if (o.beneficiaryId) {
                if (!ordersByBeneficiary.has(o.beneficiaryId)) ordersByBeneficiary.set(o.beneficiaryId, []);
                ordersByBeneficiary.get(o.beneficiaryId)!.push(o);
            } else {
                if (!ordersByStore.has(o.storeId)) ordersByStore.set(o.storeId, []);
                ordersByStore.get(o.storeId)!.push(o);
            }
        });

        const txsByUser = new Map<number, FinancialTransaction[]>();
        financialTransactions.forEach(tx => {
            if (!txsByUser.has(tx.userId)) txsByUser.set(tx.userId, []);
            txsByUser.get(tx.userId)!.push(tx);
        });

        const companyTxsByTarget = new Map<number, CompanyTransaction[]>();
        const companyTxsByStore = new Map<number, CompanyTransaction[]>();
        companyTransactions.forEach(tx => {
            if (tx.targetUserId) {
                if (!companyTxsByTarget.has(tx.targetUserId)) companyTxsByTarget.set(tx.targetUserId, []);
                companyTxsByTarget.get(tx.targetUserId)!.push(tx);
            }
            if (tx.storeId) {
                if (!companyTxsByStore.has(tx.storeId)) companyTxsByStore.set(tx.storeId, []);
                companyTxsByStore.get(tx.storeId)!.push(tx);
            }
        });

        return targetUsers.map(user => {
            const userStoreIds = user.storeIds || [];
            const isStore = user.role === UserRole.Store;
            const hasFixedSalary = user.fixedSalary && Number(user.fixedSalary) > 0;
            
            let totalProfit = 0;
            let totalRevenue = 0; 
            let totalCosts = 0;   

            if (isStore || (user.role === UserRole.Employee && !hasFixedSalary)) {
                // جلب الطلبيات الخاصة بهذا المستخدم (سواء كان مستفيداً مباشراً أو مرتبطاً بمتجر والطلبية بدون مستفيد)
                const myOrdersFromBeneficiary = ordersByBeneficiary.get(user.id) || [];
                const myOrdersFromStores = userStoreIds.flatMap(sid => ordersByStore.get(sid) || []);
                
                const myOrders = [...new Set([...myOrdersFromBeneficiary, ...myOrdersFromStores])];

                myOrders.forEach(o => {
                    const isInstant = o.orderType === OrderType.InstantDelivery;
                    const pieces = (o.items || []).reduce((q, i) => q + Number(i.quantity), 0);
                    const rate = user.customExchangeRate || Number(o.exchangeRateSnapshot) || getExchangeRateForDate(o.date);
                    
                    let costLYD = 0;
                    if (isInstant) {
                        costLYD = (o.items || []).reduce((sum, item) => sum + (Number(item.basePriceSnapshot || 0) * item.quantity), 0);
                    } else {
                        costLYD = (Number(o.costInUSD || 0) * rate);
                    }

                    const commPercentage = user.isCommissionExempt ? 0 : (systemSettings?.purchaseCommissionPercentage ?? 5);
                    const companyFee = isInstant ? 0 : (costLYD * (commPercentage / 100));

                    totalRevenue += o.total;

                    if (isStore) {
                        totalCosts += (costLYD + companyFee);
                        totalProfit += (o.total - costLYD - companyFee);
                    } else {
                        let p = 0;
                        if (isInstant) {
                            const extraMarkup = (o.items || []).reduce((sum, item) => {
                                const basePrice = item.basePriceSnapshot || item.price;
                                return sum + (Math.max(0, item.price - basePrice) * item.quantity);
                            }, 0);
                            p = extraMarkup + (pieces * 10);
                        } else {
                            if (user.accountingSystem === AccountingSystem.Commission) {
                                p = pieces * 10;
                            } else {
                                const margin = o.total - costLYD;
                                p = margin * 0.4;
                            }
                        }
                        totalProfit += p;
                    }
                });
            }

            if (user.role === UserRole.Employee && hasFixedSalary) {
                totalProfit = Number(user.fixedSalary);
            }

            const deductionsByTarget = companyTxsByTarget.get(user.id) || [];
            const deductionsByStore = isStore ? userStoreIds.flatMap(sid => companyTxsByStore.get(sid) || []).filter(tx => !tx.targetUserId) : [];
            
            const deductions = [...new Set([...deductionsByTarget, ...deductionsByStore])]
                .filter(tx => tx.type === CompanyTxType.Expense || tx.type === CompanyTxType.StoreDeduction)
                .reduce((sum, tx) => sum + Number(tx.amount), 0);

            const userTxs = txsByUser.get(user.id) || [];
            const infusions = userTxs.filter(t => t.type === TransactionType.Payment).reduce((sum, t) => sum + Number(t.amount), 0);
            const withdrawals = userTxs.filter(t => {
                if (t.type === TransactionType.SubscriptionFee && user.isSubscriptionExempt) return false;
                return t.type === TransactionType.Withdrawal || t.type === TransactionType.SubscriptionFee;
            }).reduce((sum, t) => sum + Number(t.amount), 0);

            const finalNet = (totalProfit + infusions) - (deductions + withdrawals);

            return {
                userId: user.id,
                userName: user.name,
                role: user.role,
                system: isStore ? 'نظام تجاري' : (hasFixedSalary ? 'راتب ثابت' : (user.accountingSystem === AccountingSystem.Margin ? 'هامش ربح' : 'عمولة قطع')),
                revenue: customRound(totalRevenue),
                costs: isStore ? customRound(totalCosts) : 0,
                profit: customRound(totalProfit),
                deductions: customRound(deductions + withdrawals),
                netBalance: customRound(finalNet),
                hasFixedSalary,
                hasCustomConfig: !!(user.customExchangeRate || user.isSubscriptionExempt || user.isCommissionExempt)
            };
        });
    }, [users, orders, companyTransactions, financialTransactions, getExchangeRateForDate, currentUser, isAdmin, stores, systemSettings]);

    const handleTransfer = async () => {
        if (!transferData.fromId || !transferData.toId || transferData.amount <= 0) return;
        
        const from = treasuries.find(t => t.id === transferData.fromId);
        const to = treasuries.find(t => t.id === transferData.toId);
        
        if (!from || !to) return;

        await addCompanyTransaction({
            type: CompanyTxType.TreasuryTransfer,
            amount: transferData.amount,
            description: `تحويل مالي من ${from.name} إلى ${to.name}`,
            beneficiary: to.name,
            paymentStatus: PaymentStatus.Paid,
            fromTreasury: from.type,
            fromTreasuryId: from.id,
            toTreasury: to.type,
            toTreasuryId: to.id,
            notes: transferData.notes,
            processedBy: currentUser?.id,
            date: new Date().toISOString()
        });

        setIsTransferModalOpen(false);
        setTransferData({ fromId: '', toId: '', amount: 0, notes: '' });
    };

    return (
        <div className="container mx-auto px-2 py-4 md:p-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <div className="w-full md:w-auto">
                    <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">التصفية المالية النهائية</h1>
                    <p className="text-gray-500 text-[10px] md:text-sm font-bold mt-1">تصفية العمولات، الرواتب، وأرصدة المتاجر الشريكة.</p>
                </div>
                <div className="flex w-full md:w-auto bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border dark:border-gray-700">
                    <button onClick={() => setActiveTab('settlements')} className={`flex-1 md:flex-none py-2 px-4 md:px-8 rounded-xl font-black text-[10px] md:text-xs transition-all ${activeTab === 'settlements' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500'}`}>تصفية الشركاء</button>
                    {isAdmin && <button onClick={() => setActiveTab('treasuries')} className={`flex-1 md:flex-none py-2 px-4 md:px-8 rounded-xl font-black text-[10px] md:text-xs transition-all ${activeTab === 'treasuries' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500'}`}>العهد النقدية</button>}
                </div>
            </div>

            {activeTab === 'settlements' && (
                <div className="space-y-6">
                    {settlements.map(item => (
                        <div key={item.userId} className="bg-white dark:bg-gray-800 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                            <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 bg-gray-50/50 dark:bg-gray-900/30 border-b dark:border-gray-700">
                                <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-yellow-500 flex items-center justify-center font-black text-lg md:text-2xl text-white shadow-xl shadow-yellow-500/20">{item.userName.charAt(0)}</div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm md:text-lg font-black dark:text-white">{item.userName}</h3>
                                            {item.hasCustomConfig && <span className="bg-blue-100 text-blue-700 text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded uppercase">🛡️ مخصص</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            <span className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${item.role === UserRole.Store ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{item.role === UserRole.Store ? 'صاحب متجر شريك' : 'موظف بالشركة'}</span>
                                            <span className="text-[8px] md:text-[9px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.system}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                                    <div className="text-right md:text-left">
                                        <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">صافي الرصيد المتاح (Net)</p>
                                        <p className={`text-lg md:text-3xl font-black font-mono ${item.netBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>{item.netBalance.toLocaleString()} <span className="text-[10px] md:text-sm font-normal opacity-40">د.ل</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => navigate(`/financials/settlement/${item.userId}`)}
                                            className="p-2.5 md:p-4 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-md hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                                            title="تقرير التصفية المالية"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/financials/user/${item.userId}`)}
                                            className="p-2.5 md:p-4 bg-white dark:bg-gray-700 text-yellow-600 rounded-xl md:rounded-2xl border border-yellow-100 dark:border-yellow-900/30 shadow-md hover:bg-yellow-500 hover:text-white transition-all active:scale-90"
                                            title="كشف الحساب"
                                        >
                                            <PrintIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse dark:divide-gray-700">
                                <div className="p-2.5 md:p-6 text-center">
                                    <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase mb-1 md:mb-2">{item.role === UserRole.Store ? 'إجمالي المبيعات' : 'سجل تتبع المبيعات'}</p>
                                    <p className="text-xs md:text-lg font-black text-gray-800 dark:text-gray-200">{item.revenue.toLocaleString()} <span className="text-[7px] md:text-[10px] opacity-40">د.ل</span></p>
                                </div>
                                <div className="p-2.5 md:p-6 text-center bg-gray-50/20 dark:bg-gray-900/10">
                                    <p className="text-[7px] md:text-[10px] font-black text-red-400 uppercase mb-1 md:mb-2">{item.role === UserRole.Store ? 'تكاليف وعمولات شركة' : 'خصومات إدارية'}</p>
                                    <p className="text-xs md:text-lg font-black text-red-600">-{item.costs.toLocaleString()} <span className="text-[7px] md:text-[10px] opacity-40">د.ل</span></p>
                                </div>
                                <div className="p-2.5 md:p-6 text-center">
                                    <p className="text-[7px] md:text-[10px] font-black text-green-600 uppercase mb-1 md:mb-2">{item.hasFixedSalary ? 'المرتب الشهري' : 'إجمالي العمولات'}</p>
                                    <p className="text-xs md:text-lg font-black text-green-600">+{item.profit.toLocaleString()} <span className="text-[7px] md:text-[10px] opacity-40">د.ل</span></p>
                                </div>
                                <div className="p-2.5 md:p-6 text-center bg-gray-50/20 dark:bg-gray-900/10">
                                    <p className="text-[7px] md:text-[10px] font-black text-red-500 uppercase mb-1 md:mb-2">مسحوبات وخصومات</p>
                                    <p className="text-xs md:text-lg font-black text-red-600">-{item.deductions.toLocaleString()} <span className="text-[7px] md:text-[10px] opacity-40">د.ل</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {activeTab === 'treasuries' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsTransferModalOpen(true)}
                            className="bg-yellow-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-yellow-600 transition-all"
                        >
                            إجراء تحويل بين الخزائن
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {treasuryBalances.map(t => (
                            <div key={`${t.type}-${t.id}`} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 group hover:border-yellow-500 transition-all">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{t.type}</p>
                                <h3 className="text-lg font-black mb-4 dark:text-white">{t.name}</h3>
                                <p className="text-3xl font-black text-green-600 font-mono">{t.balance.toLocaleString()} <span className="text-sm font-normal opacity-40">د.ل</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isTransferModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl border dark:border-gray-700">
                        <h2 className="text-2xl font-black mb-6 dark:text-white">تحويل مالي داخلي</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">من خزينة</label>
                                <select 
                                    value={transferData.fromId}
                                    onChange={e => setTransferData({...transferData, fromId: e.target.value})}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none font-bold dark:text-white"
                                >
                                    <option value="">اختر الخزينة المصدر</option>
                                    {treasuryBalances.map(t => <option key={`from-${t.type}-${t.id}`} value={t.id}>{t.name} ({t.balance.toLocaleString()} د.ل)</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">إلى خزينة</label>
                                <select 
                                    value={transferData.toId}
                                    onChange={e => setTransferData({...transferData, toId: e.target.value})}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none font-bold dark:text-white"
                                >
                                    <option value="">اختر الخزينة الوجهة</option>
                                    {treasuryBalances.map(t => <option key={`to-${t.type}-${t.id}`} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">المبلغ (د.ل)</label>
                                <input 
                                    type="number"
                                    value={transferData.amount}
                                    onChange={e => setTransferData({...transferData, amount: Number(e.target.value)})}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none font-bold dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">ملاحظات</label>
                                <textarea 
                                    value={transferData.notes}
                                    onChange={e => setTransferData({...transferData, notes: e.target.value})}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none font-bold dark:text-white h-24"
                                    placeholder="سبب التحويل..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={handleTransfer}
                                className="flex-1 bg-yellow-500 text-white py-4 rounded-xl font-black shadow-lg hover:bg-yellow-600 transition-all"
                            >
                                تأكيد التحويل
                            </button>
                            <button 
                                onClick={() => setIsTransferModalOpen(false)}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-4 rounded-xl font-black"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="h-20"></div>
        </div>
    );
};

export default FinancialsPage;
