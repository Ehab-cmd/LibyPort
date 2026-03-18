
import React, { useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole, OrderType, DeliveryTrackingStatus, CompanyTxType } from '../types';

const customRound = (val: number): number => {
    if (!isFinite(val) || isNaN(val)) return 0;
    const integral = Math.floor(val);
    const fractional = parseFloat((val - integral).toFixed(2));
    if (fractional < 0.5) return integral;
    if (fractional >= 0.75) return integral + 1;
    return integral + 0.5; 
};

const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

const UserSettlementReportPage: React.FC = () => {
    const { userId } = ReactRouterDOM.useParams<{ userId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { users, orders, companyTransactions, getExchangeRateForDate } = useAppContext();
    
    const [startDate, setStartDate] = useState<string>('2025-11-01');
    const [endDate, setEndDate] = useState<string>('2026-01-31');
    const [commissionRate, setCommissionRate] = useState<number>(45);

    const user = users.find(u => String(u.id) === userId);

    const reportData = useMemo(() => {
        if (!user) return null;

        const userStoreIds = user.storeIds || [];
        const entries: any[] = [];
        
        // 1. Filter orders for the user/store in the specified period
        const filteredOrders = orders.filter(o => {
            const orderDate = new Date(o.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            const isWithinDate = orderDate >= start && orderDate <= end;
            const isRelevantUser = (o.beneficiaryId === user.id) || (!o.beneficiaryId && userStoreIds.includes(o.storeId));
            const isDelivered = o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered;
            
            return isWithinDate && isRelevantUser && isDelivered && !o.isDeleted;
        });

        filteredOrders.forEach(o => {
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
                // For instant delivery, we use a specific logic or the margin
                profit = (extraMarkup + (pieces * 10)) * (commissionRate / 100);
            } else {
                profit = margin * (commissionRate / 100);
            }
            
            entries.push({ 
                id: `ORD-${o.id}`, 
                date: o.date, 
                type: 'عمولة مبيعات', 
                notes: `بيع ${pieces} قطعة لـ ${o.customerName}`, 
                margin: margin.toFixed(2),
                amount: customRound(profit) 
            });
        });

        // 2. Filter company transactions (deductions like Ads)
        const filteredTransactions = companyTransactions.filter(tx => {
            const txDate = new Date(tx.date || '');
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            const isWithinDate = txDate >= start && txDate <= end;
            const isTargetedToThisUser = tx.targetUserId === user.id;
            const isGeneralStoreDeduction = !tx.targetUserId && userStoreIds.includes(tx.storeId || 0);
            const isRelevantType = tx.type === CompanyTxType.Expense || tx.type === CompanyTxType.StoreDeduction;
            
            return isWithinDate && (isTargetedToThisUser || isGeneralStoreDeduction) && isRelevantType;
        });

        filteredTransactions.forEach(tx => {
            entries.push({ 
                id: `COM-${tx.id}`, 
                date: tx.date || new Date().toISOString(), 
                type: tx.type === CompanyTxType.StoreDeduction ? 'خصم مالي' : 'مصروف/إعلان', 
                notes: `${tx.description} (${tx.expenseCategory || 'عام'})`, 
                amount: -tx.amount 
            });
        });

        const sorted = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const totalProfit = sorted.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
        const totalDeductions = Math.abs(sorted.filter(e => e.amount < 0).reduce((sum, e) => sum + e.amount, 0));
        const netSettlement = totalProfit - totalDeductions;

        return { entries: sorted, totalProfit, totalDeductions, netSettlement };
    }, [user, orders, companyTransactions, getExchangeRateForDate, startDate, endDate, commissionRate]);

    const handlePrint = () => {
        window.print();
    };

    if (!user || !reportData) return <div className="p-8 text-center font-bold">المستخدم غير موجود</div>;

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 print:max-w-none print:p-0 print:m-0" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">تقرير تصفية مستحقات (عمولة)</h1>
                    <p className="text-gray-500 font-bold">للمستخدم: {user.name}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-black shadow-lg flex items-center gap-2"><PrintIcon /> طباعة التقرير</button>
                    <button onClick={() => navigate(-1)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold">رجوع</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border mb-8 no-print grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">تاريخ البداية:</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold" />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">تاريخ النهاية:</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold" />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">نسبة العمولة (%):</label>
                    <input type="number" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))} className="w-full p-3 bg-gray-50 border-none rounded-2xl font-bold" />
                </div>
            </div>

            <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-2xl border print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
                {/* Formal Header for Print */}
                <div className="flex justify-between items-start mb-12 border-b-8 border-yellow-500 pb-8 relative">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-6xl font-black text-yellow-600 tracking-tighter leading-none mb-2">LibyPort</h1>
                        <p className="text-gray-900 font-black text-xl">بوابة طرابلس العالمية</p>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">لخدمات الشحن والتجارة الإلكترونية والخدمات اللوجستية</p>
                        <div className="mt-4 text-[10px] text-gray-400 font-bold space-y-0.5">
                            <p>طرابلس - ليبيا</p>
                            <p>www.liby2port.com | info@liby2port.com</p>
                        </div>
                    </div>
                    <div className="text-left flex flex-col items-end">
                        <div className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-2xl mb-6 shadow-xl">كشف تصفية مالي</div>
                        <div className="flex gap-6">
                            <div className="space-y-1 text-[10px] font-bold text-gray-600">
                                <p className="text-gray-400 uppercase tracking-tighter">مرجع المستند:</p>
                                <p className="text-sm font-black text-gray-900">#SET-{userId?.slice(-4)}-{new Date().getTime().toString().slice(-6)}</p>
                                <p className="mt-2 text-gray-400 uppercase tracking-tighter">تاريخ الإصدار:</p>
                                <p className="text-sm font-black text-gray-900">{new Date().toLocaleDateString('ar-LY')}</p>
                            </div>
                            <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center overflow-hidden p-1">
                                {/* Placeholder for QR Code */}
                                <div className="grid grid-cols-4 gap-0.5 opacity-20">
                                    {Array.from({length: 16}).map((_, i) => (
                                        <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle Watermark for Print */}
                <div className="hidden print:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none -rotate-45 select-none z-0">
                    <h1 className="text-[15rem] font-black whitespace-nowrap">LIBYPORT OFFICIAL</h1>
                </div>

                {/* User Info Section */}
                <div className="mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">بيانات الموظف / الشريك:</p>
                        <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
                        <p className="text-sm font-bold text-gray-500">{user.email} | {user.phone}</p>
                    </div>
                    <div className="text-left no-print">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">حالة الحساب:</p>
                        <span className={`px-4 py-1 rounded-full text-xs font-black ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.isActive ? 'نشط' : 'غير نشط / منتهي'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-12">
                    <div className="bg-white p-6 rounded-3xl border-2 border-green-100 shadow-sm">
                        <p className="text-[10px] font-black text-green-700 uppercase mb-2 tracking-widest">إجمالي العمولات (+)</p>
                        <p className="text-3xl font-black text-green-600">{reportData.totalProfit.toLocaleString()} <span className="text-sm font-normal">د.ل</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border-2 border-red-100 shadow-sm">
                        <p className="text-[10px] font-black text-red-700 uppercase mb-2 tracking-widest">إجمالي الخصومات (-)</p>
                        <p className="text-3xl font-black text-red-600">{reportData.totalDeductions.toLocaleString()} <span className="text-sm font-normal">د.ل</span></p>
                    </div>
                    <div className="bg-yellow-500 p-6 rounded-3xl border-2 border-yellow-600 shadow-md text-gray-900">
                        <p className="text-[10px] font-black text-yellow-900 uppercase mb-2 tracking-widest">صافي المستحق النهائي</p>
                        <p className="text-4xl font-black">{reportData.netSettlement.toLocaleString()} <span className="text-sm font-normal opacity-60">د.ل</span></p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-100 mb-12">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-900 text-white">
                                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest">التاريخ</th>
                                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest">البيان والتفاصيل</th>
                                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-center">القيمة (د.ل)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reportData.entries.map((e, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="px-6 py-5 font-mono font-bold text-gray-500 text-sm">{new Date(e.date).toLocaleDateString('ar-LY')}</td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-gray-900 text-base">{e.type}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-gray-500 font-bold">{e.notes}</p>
                                            {e.margin && <span className="no-print text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-black">(هامش الربح: {e.margin})</span>}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-5 text-center font-black text-lg ${e.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {e.amount > 0 ? `+${e.amount.toLocaleString()}` : e.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {reportData.entries.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center text-gray-400 italic">لا توجد حركات مالية في هذه الفترة.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 mb-12 page-break-inside-avoid">
                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                        <span className="w-4 h-1 bg-yellow-500 rounded-full"></span>
                        طريقة احتساب العمولة والاعتماد المالي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-gray-700">
                        <div className="space-y-3">
                            <p className="flex justify-between border-b border-gray-200 pb-2"><span>1. حساب التكلفة:</span> <span className="text-gray-400">تكلفة الشراء ($) × سعر الصرف</span></p>
                            <p className="flex justify-between border-b border-gray-200 pb-2"><span>2. هامش الربح:</span> <span className="text-gray-400">سعر البيع النهائي - التكلفة الكلية</span></p>
                        </div>
                        <div className="space-y-3">
                            <p className="flex justify-between border-b border-gray-200 pb-2"><span>3. قيمة العمولة:</span> <span className="text-gray-400">هامش الربح × {commissionRate}%</span></p>
                            <p className="flex justify-between border-b border-gray-200 pb-2"><span>4. الصافي النهائي:</span> <span className="text-gray-400">إجمالي العمولات - الخصومات</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-12 border-t-4 border-double border-gray-200 page-break-inside-avoid">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-12 tracking-widest">توقيع الموظف / الشريك</p>
                        <div className="w-full border-b-2 border-gray-900 mb-2"></div>
                        <p className="text-sm font-black text-gray-900">{user.name}</p>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 border-4 border-gray-200 rounded-full flex items-center justify-center text-gray-200 font-black text-[10px] uppercase rotate-12">
                            ختم الشركة الرسمي
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-12 tracking-widest">اعتماد الإدارة المالية</p>
                        <div className="w-full border-b-2 border-gray-900 mb-2"></div>
                        <p className="text-sm font-black text-gray-900 tracking-tighter">LibyPort Financial Dept.</p>
                    </div>
                </div>

                <div className="mt-12 text-center text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em] hidden print:block">
                    هذا المستند صادر آلياً من منظومة LibyPort لإدارة الشحن والتجارة - {new Date().toLocaleString('ar-LY')}
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    html, body, #root, [class*="h-screen"], [class*="overflow-hidden"] {
                        height: auto !important;
                        min-height: initial !important;
                        overflow: visible !important;
                        position: static !important;
                    }
                    body { 
                        background: white !important; 
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-size: 12pt !important;
                    }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    
                    /* Scale down font sizes for print */
                    h1 { font-size: 24pt !important; }
                    h2 { font-size: 18pt !important; }
                    h3 { font-size: 14pt !important; }
                    .text-6xl { font-size: 32pt !important; }
                    .text-4xl { font-size: 24pt !important; }
                    .text-3xl { font-size: 18pt !important; }
                    .text-2xl { font-size: 16pt !important; }
                    .text-xl { font-size: 14pt !important; }
                    .text-lg { font-size: 12pt !important; }
                    .text-base { font-size: 10pt !important; }
                    .text-sm { font-size: 9pt !important; }
                    .text-xs { font-size: 8pt !important; }
                    .text-\[10px\] { font-size: 7pt !important; }
                    
                    /* Force background colors for print */
                    .bg-gray-900, .bg-yellow-500, .bg-gray-50, .bg-white, .bg-yellow-50, .bg-green-50, .bg-red-50 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .shadow-2xl, .shadow-lg, .shadow-sm, .shadow-md { 
                        box-shadow: none !important; 
                        border: 1px solid #eee !important; 
                    }
                    .rounded-\[2\.5rem\], .rounded-3xl, .rounded-xl, .rounded-2xl { 
                        border-radius: 4px !important; 
                    }
                    
                    /* Ensure the report container fills the page */
                    .print\:p-0 { padding: 0 !important; }
                    .print\:m-0 { margin: 0 !important; }
                    .print\:max-w-none { max-width: none !important; }
                    .print\:border-none { border: none !important; }
                    
                    [id="main-content"] > div { width: 100% !important; max-width: none !important; }
                    
                    table { 
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: auto !important;
                    }
                    tr { page-break-inside: avoid !important; page-break-after: auto !important; }
                    thead { display: table-header-group !important; }
                    
                    .page-break-inside-avoid { page-break-inside: avoid !important; }
                    
                    /* Fix for scrollbars appearing in some browsers during print */
                    * {
                        scrollbar-width: none !important;
                        -ms-overflow-style: none !important;
                    }
                    *::-webkit-scrollbar {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
};

export default UserSettlementReportPage;
