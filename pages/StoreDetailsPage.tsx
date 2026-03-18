
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, PurchaseTrackingStatus, OrderType, DeliveryTrackingStatus, Store, AccountingSystem, CompanyTxType, Order, TransactionType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

// --- خوارزمية التقريب المخصصة ---
const customRound = (val: number): number => {
    const integral = Math.floor(val);
    const fractional = parseFloat((val - integral).toFixed(2));
    if (fractional < 0.5) return integral;
    if (fractional >= 0.75) return integral + 1;
    return integral + 0.5; 
};

// Icons
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const StoreDetailsPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { stores, orders, products, users, currentUser, companyTransactions, financialTransactions, getExchangeRateForDate, exchangeRate } = useAppContext();
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'financials'>('orders');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const storeId = Number(id);
    const store = stores.find(s => s.id === storeId);
    const owner = users.find(u => u.id === store?.ownerId);
    
    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);
    const isOwner = currentUser?.id === store?.ownerId;
    
    const storeOrders = useMemo(() => orders.filter(o => o.storeId === storeId && !o.isDeleted).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [orders, storeId]);
    const storeProducts = useMemo(() => products.filter(p => p.storeId === storeId && !p.isDeleted), [products, storeId]);
    
    // --- حساب قيمة المخزون الحالية (للمسؤولين فقط) ---
    const inventoryValueStats = useMemo(() => {
        if (!isAdmin) return null;
        let totalCostUSD = 0;
        let totalMarketValueLYD = 0;
        let totalItems = 0;

        storeProducts.forEach(p => {
            const stock = p.stock || 0;
            if (stock > 0) {
                totalCostUSD += (stock * (p.costInUSD || 0));
                totalMarketValueLYD += (stock * p.price);
                totalItems += stock;
            }
        });

        const totalCostLYD = totalCostUSD * exchangeRate;
        const potentialProfit = totalMarketValueLYD - totalCostLYD;

        return {
            totalItems,
            totalCostUSD: customRound(totalCostUSD),
            totalCostLYD: customRound(totalCostLYD),
            totalMarketValueLYD: customRound(totalMarketValueLYD),
            potentialProfit: customRound(potentialProfit)
        };
    }, [storeProducts, isAdmin, exchangeRate]);

    const ledgerData = useMemo(() => {
        if (!owner || !store) return null;
        const system = owner.accountingSystem || AccountingSystem.Margin;
        const isInternalStore = store.name === "LibyPort";
        const isSpecialOwnerStore = store.name === "La Perla Femme";
        
        let filteredOrders = storeOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered);
        if (startDate) filteredOrders = filteredOrders.filter(o => new Date(o.date) >= new Date(startDate));
        if (endDate) filteredOrders = filteredOrders.filter(o => new Date(o.date) <= new Date(endDate));

        let totalInstantProfit = 0;
        let totalNewOrderProfit = 0;
        let instantItemsCount = 0;
        let deliveredItemsCount = 0;

        const entries = filteredOrders.map(o => {
            const itemCount = (o.items || []).reduce((sum, i) => sum + i.quantity, 0);
            let rawProfit = 0;

            if (isInternalStore) {
                rawProfit = 0;
            } else {
                const rate = o.exchangeRateSnapshot || getExchangeRateForDate(o.date);
                const totalCostLYD = (o.costInUSD || 0) * rate;
                const margin = o.total - totalCostLYD;

                if (isSpecialOwnerStore) {
                    rawProfit = margin * 0.95;
                } else if (o.orderType === OrderType.InstantDelivery) {
                    const extraMarkup = (o.items || []).reduce((sum, item) => {
                        const basePrice = item.basePriceSnapshot || item.price;
                        return sum + (Math.max(0, item.price - basePrice) * item.quantity);
                    }, 0);
                    rawProfit = extraMarkup + (itemCount * 10);
                } else {
                    if (system === AccountingSystem.Commission) {
                        rawProfit = itemCount * 10;
                    } else {
                        rawProfit = margin * 0.4;
                    }
                }
            }

            const roundedProfit = customRound(rawProfit);

            if (o.orderType === OrderType.InstantDelivery) {
                totalInstantProfit += roundedProfit;
                instantItemsCount += itemCount;
            } else {
                totalNewOrderProfit += roundedProfit;
                deliveredItemsCount += itemCount;
            }

            return { id: o.id, date: o.date, type: o.orderType, itemCount, totalAmount: o.total, storeProfit: roundedProfit };
        });

        let storeDeductions = companyTransactions.filter(tx => tx.storeId === store.id);
        let manualTxs = financialTransactions.filter(tx => tx.userId === owner.id);

        if (startDate) {
            storeDeductions = storeDeductions.filter(tx => new Date(tx.date) >= new Date(startDate));
            manualTxs = manualTxs.filter(tx => new Date(tx.date) >= new Date(startDate));
        }
        if (endDate) {
            storeDeductions = storeDeductions.filter(tx => new Date(tx.date) <= new Date(endDate));
            manualTxs = manualTxs.filter(tx => new Date(tx.date) <= new Date(endDate));
        }

        const totalDeductions = storeDeductions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalInfusions = manualTxs.filter(tx => tx.type === TransactionType.Payment).reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawals = manualTxs.filter(tx => tx.type === TransactionType.Withdrawal).reduce((sum, t) => sum + t.amount, 0);

        const netFinalBalance = isInternalStore ? 0 : customRound((totalInstantProfit + totalNewOrderProfit + totalInfusions) - (totalDeductions + totalWithdrawals));

        return { entries, storeDeductions, manualTxs, totalInstantProfit, totalNewOrderProfit, instantItemsCount, deliveredItemsCount, totalDeductions, totalInfusions, totalWithdrawals, netFinalBalance, system, isInternalStore, isSpecialOwnerStore };
    }, [owner, store, storeOrders, companyTransactions, financialTransactions, getExchangeRateForDate, startDate, endDate]);

    if (!store || (!isAdmin && !isOwner)) return null;

    const handlePrintLedger = () => {
        const printContent = document.getElementById('ledger-print-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=1000');
            printWindow?.document.write('<html><head><title>كشف حساب مالي</title>');
            printWindow?.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
            printWindow?.document.write('<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">');
            printWindow?.document.write(`<style>body { font-family: 'Cairo', sans-serif; direction: rtl; } @media print { .no-print { display:none !important; } }</style>`);
            printWindow?.document.write('</head><body class="bg-white"><div class="p-10">');
            printWindow?.document.write(printContent.innerHTML);
            printWindow?.document.write('</div></body></html>');
            printWindow?.document.close();
            setTimeout(() => { printWindow?.print(); printWindow?.close(); }, 1000);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 no-print">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{store.name}</h1>
                    <p className="text-gray-500 mt-2 font-bold">المالك: {owner?.name || 'غير معروف'} | {owner?.email}</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'financials' && (
                        <button onClick={handlePrintLedger} className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg"><PrintIcon /> طباعة كشف الحساب</button>
                    )}
                    <button onClick={() => navigate('/stores')} className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all border dark:border-gray-700">العودة للمتاجر</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col animate-fade-in-up">
                <div className="flex border-b dark:border-gray-700 overflow-x-auto scrollbar-hide bg-gray-50/50 dark:bg-gray-900/50 no-print">
                    <button onClick={() => setActiveTab('orders')} className={`flex-1 py-5 px-6 font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-gray-800 text-yellow-600 border-b-4 border-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}><OrderIcon /> سجل الفواتير</button>
                    <button onClick={() => setActiveTab('products')} className={`flex-1 py-5 px-6 font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-800 text-yellow-600 border-b-4 border-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}><ProductIcon /> قائمة المنتجات</button>
                    <button onClick={() => setActiveTab('financials')} className={`flex-1 py-5 px-6 font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'financials' ? 'bg-white dark:bg-gray-800 text-yellow-600 border-b-4 border-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}><MoneyIcon /> كشف الحساب المالي</button>
                </div>

                <div className="flex-grow p-6">
                    {activeTab === 'orders' && (
                        <div className="overflow-x-auto rounded-3xl border dark:border-gray-700">
                             <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-gray-700">
                                    <tr><th className="px-6 py-5">رقم الفاتورة</th><th className="px-6 py-5">الزبون</th><th className="px-6 py-5">الإجمالي</th><th className="px-6 py-5">حالة التوصيل</th><th className="px-6 py-5 text-left">إجراء</th></tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {storeOrders.map(o => (
                                        <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-5 font-mono font-bold text-yellow-600">#{o.id}</td>
                                            <td className="px-6 py-5 font-bold text-gray-800 dark:text-white">{o.customerName}</td>
                                            <td className="px-6 py-5 font-black text-gray-900 dark:text-white">{o.total.toLocaleString()} د.ل</td>
                                            <td className="px-6 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">{o.deliveryTrackingStatus}</span></td>
                                            <td className="px-6 py-5 text-left"><button onClick={() => navigate(`/orders/${o.id}`)} className="text-blue-500 hover:underline font-bold text-xs">عرض</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {storeProducts.map(p => (
                                <div key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-700 text-center cursor-pointer hover:border-yellow-500 transition-all hover:shadow-lg group">
                                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-inner border dark:border-gray-800">
                                        {p.image ? <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="h-full flex items-center justify-center text-gray-300 font-bold">?</div>}
                                    </div>
                                    <p className="font-black text-xs truncate dark:text-white mb-1">{p.name}</p>
                                    <p className="text-yellow-600 font-black text-sm">{p.price.toLocaleString()} د.ل</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'financials' && ledgerData && (
                        <div id="ledger-print-area" className="animate-fade-in-up">
                            {/* --- قسيمة تقييم المخزون (للمسؤولين فقط - متجر الإدارة) --- */}
                            {isAdmin && inventoryValueStats && (
                                <div className="mb-10 no-print">
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-yellow-600">
                                        <ChartBarIcon /> تقييم القيمة المالية للمخزون الحالي
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-900 text-white p-6 rounded-3xl border-b-4 border-blue-500">
                                            <p className="text-[9px] font-black text-blue-400 uppercase mb-1">إجمالي التكلفة</p>
                                            <p className="text-2xl font-black font-mono">${inventoryValueStats.totalCostUSD.toLocaleString()}</p>
                                            <p className="text-[10px] opacity-60 mt-1">معادل: {inventoryValueStats.totalCostLYD.toLocaleString()} د.ل</p>
                                        </div>
                                        <div className="bg-gray-900 text-white p-6 rounded-3xl border-b-4 border-green-500">
                                            <p className="text-[9px] font-black text-green-400 uppercase mb-1">القيمة السوقية (البيع)</p>
                                            <p className="text-2xl font-black font-mono">{inventoryValueStats.totalMarketValueLYD.toLocaleString()} د.ل</p>
                                            <p className="text-[10px] opacity-60 mt-1">عند بيع {inventoryValueStats.totalItems} قطعة</p>
                                        </div>
                                        <div className="bg-gray-900 text-white p-6 rounded-3xl border-b-4 border-yellow-500">
                                            <p className="text-[9px] font-black text-yellow-400 uppercase mb-1">الربح الصافي المتوقع</p>
                                            <p className="text-2xl font-black font-mono">{inventoryValueStats.potentialProfit.toLocaleString()} د.ل</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                                            <p className="text-[10px] font-bold text-gray-400 leading-relaxed text-center italic">يتم حساب هذه القيم بناءً على الأرصدة المتوفرة حالياً في المخزن وأسعار التكلفة المسجلة.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="no-print bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl mb-10 border border-gray-100 dark:border-gray-700">
                                <div className="flex flex-wrap items-end gap-6">
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">من تاريخ</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-xl dark:bg-gray-800" />
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">إلى تاريخ</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-xl dark:bg-gray-800" />
                                    </div>
                                </div>
                            </div>

                            <div className="hidden print:block mb-8 border-b-2 border-yellow-500 pb-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h1 className="text-4xl font-black text-yellow-600">LibyPort</h1>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">بوابة طرابلس العالمية للتجارة والشحن</p>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-2xl font-black text-gray-800">كشف حساب مالي</h2>
                                        <p className="text-sm font-bold text-gray-500">المتجر: {store.name}</p>
                                        <p className="text-sm font-bold text-gray-500">الفترة: {startDate || 'بداية التعامل'} ⬅️ {endDate || 'تاريخ اليوم'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col justify-center items-center text-center">
                                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">إجمالي أرباح الفوري</p>
                                    <p className="text-2xl font-black text-gray-900">{ledgerData.totalInstantProfit.toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
                                    <p className="text-[9px] text-green-600 font-bold mt-1">يشمل (العمولة + فارق السعر)</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col justify-center items-center text-center">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">أرباح المبيعات المحققة</p>
                                    <p className="text-2xl font-black text-gray-900">{ledgerData.totalNewOrderProfit.toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
                                </div>
                                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex flex-col justify-center items-center text-center">
                                    <p className="text-[10px] font-black text-red-600 uppercase mb-1">إجمالي الرسوم والمصاريف</p>
                                    <p className="text-2xl font-black text-red-600">{(ledgerData.totalDeductions + ledgerData.totalWithdrawals).toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
                                </div>
                                <div className="bg-yellow-500 text-white p-6 rounded-3xl flex flex-col justify-center items-center text-center shadow-lg">
                                    <p className="text-[10px] font-black uppercase mb-1 opacity-80">الصافي المضاف لرصيد المالك</p>
                                    <p className="text-3xl font-black">{ledgerData.netFinalBalance.toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border dark:border-gray-700 overflow-hidden mb-10">
                                <div className="p-4 bg-gray-900 text-white font-black text-sm">حركات الإيراد (العمليات المسلّمة)</div>
                                <table className="w-full text-xs text-right">
                                    <thead className="bg-gray-100 text-gray-400 font-black uppercase tracking-widest border-b">
                                        <tr>
                                            <th className="px-6 py-4">التاريخ</th>
                                            <th className="px-6 py-4">رقم الفاتورة</th>
                                            <th className="px-6 py-4 text-center">القطع</th>
                                            <th className="px-6 py-4">إجمالي العملية</th>
                                            <th className="px-6 py-4 text-left">الربح المضاف للمالك</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {ledgerData.entries.map(entry => (
                                            <tr key={entry.id}>
                                                <td className="px-6 py-4 text-gray-500">{new Date(entry.date).toLocaleDateString('ar-LY')}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-yellow-600">#{entry.id}</td>
                                                <td className="px-6 py-4 text-center font-bold">{entry.itemCount}</td>
                                                <td className="px-6 py-4 text-gray-400">{entry.totalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-left font-black text-green-600">+{entry.storeProfit.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreDetailsPage;
