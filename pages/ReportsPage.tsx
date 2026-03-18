
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PurchaseTrackingStatus, UserRole, DeliveryTrackingStatus, OrderType } from '../types';

// --- Icons ---
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const CurrencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const LightningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;

const ReportsPage: React.FC = () => {
    const { currentUser, orders, products, stores } = useAppContext();
    
    const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>(() => 
        currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin ? 'all' : currentUser!.storeIds[0]!
    );

    const data = useMemo(() => {
        const activeOrders = orders.filter(o => !o.isDeleted);
        const relevantOrders = selectedStoreId === 'all' ? activeOrders : activeOrders.filter(o => o.storeId === selectedStoreId);
        
        // Basic Stats
        const purchasedOrders = relevantOrders.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased);
        const totalSales = purchasedOrders.reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = purchasedOrders.length > 0 ? totalSales / purchasedOrders.length : 0;

        // Top Products Logic
        const productSalesMap = new Map<number, { name: string; quantity: number; revenue: number }>();
        purchasedOrders.forEach(order => {
            order.items.forEach(item => {
                const existing = productSalesMap.get(item.productId) || { name: item.name, quantity: 0, revenue: 0 };
                existing.quantity += item.quantity;
                existing.revenue += item.price * item.quantity;
                productSalesMap.set(item.productId, existing);
            });
        });
        const topProducts = Array.from(productSalesMap.values()).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
        const maxProductRevenue = topProducts.length > 0 ? topProducts[0].revenue : 1;

        // Delivered Breakdown
        const deliveredOrders = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered);
        const instantOrders = deliveredOrders.filter(o => o.orderType === OrderType.InstantDelivery);
        const standardOrders = deliveredOrders.filter(o => o.orderType !== OrderType.InstantDelivery);

        const instantRevenue = instantOrders.reduce((acc, order) => {
            const totalQty = (order.items || []).reduce((qSum, item) => qSum + item.quantity, 0);
            return acc + (totalQty * 10);
        }, 0);
        const standardRevenue = standardOrders.reduce((acc, o) => acc + o.total, 0);

        // Store Performance
        const storesPerformance = stores
            .filter(s => selectedStoreId === 'all' || s.id === selectedStoreId)
            .map(store => {
                const sOrders = deliveredOrders.filter(o => o.storeId === store.id);
                const sInstant = sOrders.filter(o => o.orderType === OrderType.InstantDelivery);
                const sStandard = sOrders.filter(o => o.orderType !== OrderType.InstantDelivery);
                
                const sInstantRev = sInstant.reduce((acc, order) => acc + ((order.items || []).reduce((q, i) => q + i.quantity, 0) * 10), 0);
                const sStandardRev = sStandard.reduce((acc, o) => acc + o.total, 0);
                
                return {
                    id: store.id,
                    name: store.name,
                    instantCount: sInstant.length,
                    instantRevenue: sInstantRev,
                    standardCount: sStandard.length,
                    standardRevenue: sStandardRev,
                    total: sInstantRev + sStandardRev
                };
            }).sort((a, b) => b.total - a.total);

        return { 
            totalSales, 
            totalOrders: relevantOrders.length, 
            avgOrderValue, 
            topProducts, 
            maxProductRevenue,
            deliveredCount: deliveredOrders.length,
            instantCount: instantOrders.length,
            instantRevenue,
            standardRevenue,
            storesPerformance
        };
    }, [selectedStoreId, orders, stores]);

    const isAdmin = currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.SuperAdmin;

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6">
                <div className="animate-fade-in-up">
                    <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">تقارير وتحليلات الأداء</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 md:mt-2 text-[10px] md:text-sm font-medium">نظرة شاملة على المبيعات، عوائد المتاجر، والمنتجات الأكثر طلباً.</p>
                </div>
                
                {isAdmin && (
                    <div className="relative w-full md:w-auto">
                        <select
                            value={selectedStoreId}
                            onChange={(e) => setSelectedStoreId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="w-full md:w-64 appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 md:p-3 pr-10 rounded-xl md:rounded-2xl shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-gray-700 dark:text-gray-200 text-xs md:text-base"
                        >
                            <option value="all">📊 جميع المتاجر والنشاطات</option>
                            {stores.map(store => <option key={store.id} value={store.id}>🏢 {store.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-2.5 md:top-3.5 text-gray-400 pointer-events-none scale-75 md:scale-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl shadow-yellow-500/20 text-white relative overflow-hidden sm:col-span-2 lg:col-span-1">
                    <div className="absolute -right-6 -bottom-6 opacity-10 scale-150 rotate-12"><CurrencyIcon /></div>
                    <p className="text-[10px] md:text-sm font-bold opacity-80 uppercase tracking-widest">إجمالي المبيعات (المحققة)</p>
                    <h2 className="text-2xl md:text-4xl font-black mt-1 md:mt-2 font-mono">{data.totalSales.toLocaleString()} <span className="text-xs md:text-lg font-normal">د.ل</span></h2>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">عدد الطلبيات الكلي</p>
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mt-1">{data.totalOrders}</h2>
                        </div>
                        <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl md:rounded-2xl text-blue-600 dark:text-blue-400 scale-75 md:scale-100"><ShoppingBagIcon /></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">متوسط قيمة الفاتورة</p>
                            <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">{data.avgOrderValue.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-[10px] md:text-sm font-normal opacity-40">د.ل</span></h2>
                        </div>
                        <div className="p-2 md:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl md:rounded-2xl text-purple-600 dark:text-purple-400 scale-75 md:scale-100"><ChartBarIcon /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10">
                {/* Top Products with Progress Bars */}
                <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-base md:text-xl font-black text-gray-800 dark:text-white mb-6 md:mb-8 border-r-4 border-yellow-500 pr-3 md:pr-4">أفضل المنتجات أداءً (بالإيراد)</h3>
                    <div className="space-y-4 md:space-y-6">
                        {data.topProducts.map((p, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between text-xs md:text-sm mb-1.5 md:mb-2">
                                    <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-yellow-600 transition-colors truncate ml-2">{p.name}</span>
                                    <span className="font-black text-gray-900 dark:text-white whitespace-nowrap">{p.revenue.toLocaleString()} د.ل</span>
                                </div>
                                <div className="h-2 md:h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                        style={{ width: `${(p.revenue / data.maxProductRevenue) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 font-bold">تم بيع {p.quantity} قطعة</p>
                            </div>
                        ))}
                        {data.topProducts.length === 0 && <p className="text-center py-10 text-gray-400 italic text-xs">لا توجد بيانات مبيعات حالياً.</p>}
                    </div>
                </div>

                {/* Sales Mix Matrix */}
                <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-base md:text-xl font-black text-gray-800 dark:text-white mb-6 md:mb-8 border-r-4 border-blue-500 pr-3 md:pr-4">مزيج المبيعات (الفواتير المسلمة)</h3>
                    
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                        <div className="p-4 md:p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl md:rounded-3xl border border-green-100 dark:border-green-800 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-green-700 dark:text-green-400 mb-0.5 md:mb-1">
                                    <LightningIcon />
                                    <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">توصيل فوري (إيراد مباشر)</span>
                                </div>
                                <p className="text-lg md:text-2xl font-black text-gray-900 dark:text-white">{data.instantRevenue.toLocaleString()} <span className="text-[10px] md:text-sm font-normal opacity-40">د.ل</span></p>
                            </div>
                            <div className="text-left">
                                <span className="bg-green-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg shadow-sm whitespace-nowrap">{data.instantCount} فاتورة</span>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl md:rounded-3xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-blue-700 dark:text-blue-400 mb-0.5 md:mb-1">
                                    <ShoppingBagIcon />
                                    <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">طلبات شراء (إيراد مؤجل)</span>
                                </div>
                                <p className="text-lg md:text-2xl font-black text-gray-900 dark:text-white">{data.standardRevenue.toLocaleString()} <span className="text-[10px] md:text-sm font-normal opacity-40">د.ل</span></p>
                            </div>
                            <div className="text-left">
                                <span className="bg-blue-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg shadow-sm whitespace-nowrap">{data.deliveredCount - data.instantCount} فاتورة</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="mt-4 md:mt-6 text-[9px] md:text-[11px] text-gray-400 text-center leading-relaxed font-medium">
                        * يتم احتساب "إيراد الفوري" بواقع 10 د.ل لكل قطعة كربح مباشر يضاف للرصيد، بينما تعتمد "طلبات الشراء" على تصفية الحسابات المالية بعد خصم المصاريف.
                    </p>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 md:p-8 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                    <h3 className="text-base md:text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <StoreIcon /> تفاصيل أداء المتاجر
                    </h3>
                    <span className="text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">للفواتير المسلمة فقط</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest">
                            <tr>
                                <th className="px-5 md:px-8 py-4 md:py-5">المتجر</th>
                                <th className="px-3 md:px-6 py-4 md:py-5 text-center hidden sm:table-cell">عدد الفواتير</th>
                                <th className="px-3 md:px-6 py-4 md:py-5 text-center">إيراد الفوري (Net)</th>
                                <th className="px-3 md:px-6 py-4 md:py-5 text-center hidden sm:table-cell">مبيعات الطلبات (Gross)</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-left">إجمالي القيمة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {data.storesPerformance.map(store => (
                                <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-5 md:px-8 py-4 md:py-5">
                                        <div className="font-black text-gray-900 dark:text-white group-hover:text-yellow-600 transition-colors text-[10px] md:text-sm">{store.name}</div>
                                    </td>
                                    <td className="px-3 md:px-6 py-4 md:py-5 text-center hidden sm:table-cell">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg font-bold text-gray-600 dark:text-gray-300 text-[10px] md:text-xs">
                                            {store.instantCount + store.standardCount}
                                        </span>
                                    </td>
                                    <td className="px-3 md:px-6 py-4 md:py-5 text-center font-mono font-bold text-green-600 dark:text-green-400 text-[10px] md:text-sm">
                                        {store.instantRevenue.toLocaleString()}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 md:py-5 text-center hidden sm:table-cell font-mono font-bold text-blue-600 dark:text-blue-400 text-[10px] md:text-sm">
                                        {store.standardRevenue.toLocaleString()}
                                    </td>
                                    <td className="px-5 md:px-8 py-4 md:py-5 text-left">
                                        <div className="font-black text-gray-900 dark:text-white text-xs md:text-lg font-mono">
                                            {store.total.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
