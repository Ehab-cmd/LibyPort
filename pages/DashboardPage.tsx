
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, PurchaseTrackingStatus, DeliveryTrackingStatus, Product, News, OrderType, AccountingSystem, TransactionType, CompanyTxType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

// --- خوارزمية التقريب المخصصة لضمان تطابق الأرقام مع الصفحة المالية ---
const customRound = (val: number): number => {
    const integral = Math.floor(val);
    const fractional = parseFloat((val - integral).toFixed(2));
    if (fractional < 0.5) return integral;
    if (fractional >= 0.75) return integral + 1;
    return integral + 0.5; 
};

// --- Professional Icons ---
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PurchasedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ProcessingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ProductsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.01" /></svg>;
const ShipmentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const DeliveredIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ReturnedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>;
const CancelledIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DepositAlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExchangeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const NewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h9M7 16h6M7 12h6M7 8h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const InternationalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V14L13 9V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
    </svg>
);

const LocalDeliveryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path strokeLinecap="round" d="M19 13h3l-1-4h-2" />
    </svg>
);

const WarehouseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const StatCard = React.memo(({ title, value, icon, color, linkTo, isPulse }: { title: string; value: string | number; icon: React.ReactNode; color: string; linkTo: string; isPulse?: boolean }) => (
    <ReactRouterDOM.Link to={linkTo} className="group relative bg-white dark:bg-gray-800 p-1.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col md:flex-row items-center justify-center overflow-hidden text-center gap-1 md:gap-4">
        {isPulse && <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>}
        
        <div className={`relative z-10 p-1 md:p-2.5 rounded-lg md:rounded-xl shadow-lg transition-transform group-hover:scale-110 duration-300 ${color}`}>
            <div className="scale-[0.65] md:scale-100">
                {icon}
            </div>
        </div>

        <div className="relative z-10 min-w-0">
            <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight md:tracking-wider mb-0.5 leading-tight min-h-[12px] md:min-h-0 flex items-center justify-center">{title}</p>
            <p className={`text-[10px] sm:text-sm md:text-lg font-black ${isPulse ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'} group-hover:text-yellow-600 transition-colors leading-none truncate`}>{value}</p>
        </div>
    </ReactRouterDOM.Link>
));

const DashboardPage: React.FC = () => {
    const { currentUser, orders, products, news, exchangeRate, stores, users, markNewsAsSeen, refreshData, resetData } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();

    const isAdmin = useMemo(() => currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role), [currentUser]);

    // --- منطق رسالة الترحيب الأنيقة ---
    const welcomeMessage = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return {
            greeting: "صباح الفرص الواعدة",
            desc: "يوم جديد لتوسيع آفاق تجارتك وربط متجرك بالعالم.",
            accent: "text-yellow-600"
        };
        if (hour < 17) return {
            greeting: "طاب يومك بنجاح",
            desc: "نحن هنا لندعم خطواتك نحو التميز العالمي، إليك آخر التحديثات.",
            accent: "text-blue-600"
        };
        return {
            greeting: "مساء الإنجازات المحققة",
            desc: "استعرض حصاد اليوم وخطط لغدٍ أكثر إشراقاً في عالم التجارة.",
            accent: "text-purple-600"
        };
    }, []);

    const data = useMemo(() => {
        const userStoreIds = currentUser?.storeIds || [];
        const activeOrders = orders.filter(o => !o.isDeleted);
        const relevantOrders = isAdmin ? activeOrders : activeOrders.filter(order => userStoreIds.includes(order.storeId));
        
        const totalSales = relevantOrders
            .filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased)
            .reduce((sum, o) => sum + o.total, 0);

        const activeUsersCount = users.filter(u => !u.isDeleted && u.isActive).length;

        const newOrdersCount = relevantOrders.filter(o => (o.purchaseTrackingStatus || PurchaseTrackingStatus.Pending) === PurchaseTrackingStatus.Pending).length;
        const processingOrdersCount = relevantOrders.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Processing).length;
        const purchasedOrdersCount = relevantOrders.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased).length;
        const onHoldOrdersCount = relevantOrders.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.OnHold).length;
        const collegiateOrdersCount = relevantOrders.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Cancelled).length;
        
        const awaitingDepositCount = relevantOrders.filter(o => 
            (o.orderType === OrderType.DepositPurchase || o.orderType === OrderType.Procurement) && 
            !o.isDepositPaid && 
            (o.purchaseTrackingStatus || PurchaseTrackingStatus.Pending) === PurchaseTrackingStatus.Pending
        ).length;

        const totalProductsCount = products.filter(p => !p.isDeleted && (isAdmin || userStoreIds.includes(p.storeId))).length;
        
        const internationalShippingCount = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.InternationalShipping).length;
        const arrivedShipmentsCount = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.Arrived).length;
        const localDeliveryCount = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.LocalShipping).length;

        const pendingShipmentsCount = relevantOrders.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased && o.deliveryTrackingStatus === DeliveryTrackingStatus.Pending).length;
        const deliveredShipmentsCount = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered).length;
        const returnedShipmentsCount = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.Returned).length;
        const returnedToCompanyCount = relevantOrders.filter(o => o.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany).length;

        const recentOrders = [...relevantOrders].sort((a, b) => String(b.id).localeCompare(String(a.id))).slice(0, 3);
        const recentNews = [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        
        const shipmentNews = [];
        relevantOrders.forEach(order => {
            if (order.shipmentComments && order.shipmentComments.length > 0) {
                order.shipmentComments.forEach(c => {
                    shipmentNews.push({ ...c, orderId: order.id });
                });
            }
        });
        const sortedShipmentNews = shipmentNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        
        return { totalSales, activeUsersCount, newOrdersCount, processingOrdersCount, purchasedOrdersCount, onHoldOrdersCount, collegiateOrdersCount, awaitingDepositCount, totalProductsCount, pendingShipmentsCount, deliveredShipmentsCount, returnedShipmentsCount, returnedToCompanyCount, internationalShippingCount, arrivedShipmentsCount, localDeliveryCount, recentOrders, recentNews, shipmentNews: sortedShipmentNews };
    }, [currentUser, orders, products, news, isAdmin, users]);

    const getStatusColor = (status: PurchaseTrackingStatus) => {
        switch(status) {
            case PurchaseTrackingStatus.Purchased: return 'bg-green-50 text-green-700 dark:bg-green-900/30';
            case PurchaseTrackingStatus.Processing: return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30';
            case PurchaseTrackingStatus.Pending: return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30';
            case PurchaseTrackingStatus.Cancelled: return 'bg-gray-100 text-gray-500 dark:bg-gray-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-[1600px] mx-auto p-2 md:p-4 relative min-h-full" dir="rtl">
            <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.015]">
                <img src="https://up6.cc/2025/10/176278012677161.jpg" alt="Logo Watermark" className="w-[800px] h-[800px] object-contain" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-row justify-between items-center mb-4 md:mb-8 gap-4">
                    <div className="animate-fade-in-up flex-1">
                        <div className="flex items-center gap-2 md:gap-4">
                            <h1 className="text-[10px] md:text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5 md:gap-3 whitespace-nowrap">
                                {welcomeMessage.greeting}، 
                                <span className="bg-clip-text text-transparent bg-gradient-to-l from-yellow-600 to-yellow-400">
                                    {currentUser.name.split(' ')[0]}
                                </span>
                            </h1>
                            <div className="flex items-center gap-1 md:gap-2">
                                <button 
                                    onClick={refreshData}
                                    className="p-1 md:p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                                    title="تحديث البيانات"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                {isAdmin && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات الأساسية؟ سيؤدي هذا إلى إعادة تحميل البيانات الأولية إذا كانت المجموعات فارغة.')) {
                                                resetData();
                                            }
                                        }}
                                        className="p-1 md:p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                                        title="إعادة تعيين البيانات"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-[8px] md:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 md:mt-1.5 font-bold max-w-lg leading-relaxed line-clamp-2 md:line-clamp-none">
                            {welcomeMessage.desc}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-1 md:p-2 px-1.5 md:px-4 rounded-xl md:rounded-[2rem] shadow-lg border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-1.5 md:gap-3 animate-fade-in-up flex-shrink-0">
                        <div className="p-1 md:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg md:rounded-xl text-yellow-600 shadow-inner scale-75 md:scale-100">
                            <ExchangeIcon />
                        </div>
                        <div className="text-right">
                            <p className="text-[6px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">سعر الصرف</p>
                            <p className="text-[7px] md:text-xs font-black text-gray-900 dark:text-white leading-none">
                                <span className="text-yellow-600">1$</span> = <span className="font-mono">{exchangeRate.toFixed(2)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 mb-10">
                    {isAdmin && (
                        <StatCard 
                            title="المستخدمين العاملين" 
                            value={`${data.activeUsersCount}`} 
                            icon={<UsersIcon />} 
                            color="bg-gradient-to-br from-blue-600 to-indigo-700" 
                            linkTo="/users" 
                        />
                    )}
                    
                    <StatCard 
                        title="إجمالي المنتجات" 
                        value={data.totalProductsCount} 
                        icon={<ProductsIcon />} 
                        color="bg-gradient-to-br from-purple-500 to-indigo-600" 
                        linkTo="/products" 
                    />
                    <StatCard 
                        title="فواتير جديدة" 
                        value={data.newOrdersCount} 
                        icon={<OrdersIcon />} 
                        color="bg-gradient-to-br from-blue-500 to-sky-600" 
                        linkTo={`/orders?status=${PurchaseTrackingStatus.Pending}`} 
                    />
                    <StatCard 
                        title="طلبيات قيد التجهيز" 
                        value={data.processingOrdersCount} 
                        icon={<ProcessingIcon />} 
                        color="bg-gradient-to-br from-orange-500 to-amber-600" 
                        linkTo={`/orders?status=${PurchaseTrackingStatus.Processing}`} 
                    />
                    <StatCard 
                        title="بانتظار تأكيد العربون" 
                        value={data.awaitingDepositCount} 
                        icon={<DepositAlertIcon />} 
                        color="bg-gradient-to-br from-red-500 to-rose-600" 
                        linkTo="/orders?deposit=pending" 
                        isPulse={data.awaitingDepositCount > 0} 
                    />
                    
                    <StatCard 
                        title="فواتير تم شراؤها" 
                        value={data.purchasedOrdersCount} 
                        icon={<PurchasedIcon />} 
                        color="bg-gradient-to-br from-teal-500 to-cyan-600" 
                        linkTo={`/orders?status=${PurchaseTrackingStatus.Purchased}`} 
                    />

                    <StatCard 
                        title="شحنات في الطريق (دولي)" 
                        value={data.internationalShippingCount} 
                        icon={<InternationalIcon />} 
                        color="bg-gradient-to-br from-indigo-500 to-blue-600" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.InternationalShipping}`} 
                    />

                    <StatCard 
                        title="وصلت في المخزن" 
                        value={data.arrivedShipmentsCount} 
                        icon={<WarehouseIcon />} 
                        color="bg-gradient-to-br from-blue-400 to-indigo-500" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.Arrived}`} 
                    />

                    <StatCard 
                        title="خارج للتوصيل (محلي)" 
                        value={data.localDeliveryCount} 
                        icon={<LocalDeliveryIcon />} 
                        color="bg-gradient-to-br from-amber-500 to-orange-600" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.LocalShipping}`} 
                    />

                    <StatCard 
                        title="طلبيات ملغية" 
                        value={data.collegiateOrdersCount} 
                        icon={<CancelledIcon />} 
                        color="bg-gradient-to-br from-slate-600 to-slate-800" 
                        linkTo={`/orders?status=${PurchaseTrackingStatus.Cancelled}`} 
                    />
                    <StatCard 
                        title="شحنات قيد التجهيز" 
                        value={data.pendingShipmentsCount} 
                        icon={<ShipmentsIcon />} 
                        color="bg-gradient-to-br from-indigo-600 to-blue-800" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.Pending}`} 
                    />
                    <StatCard 
                        title="شحنات تم تسليمها" 
                        value={data.deliveredShipmentsCount} 
                        icon={<DeliveredIcon />} 
                        color="bg-gradient-to-br from-emerald-600 to-green-700" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.Delivered}`} 
                    />
                    <StatCard 
                        title="شحنات مرتجعة" 
                        value={data.returnedShipmentsCount} 
                        icon={<ReturnedIcon />} 
                        color="bg-gradient-to-br from-rose-600 to-red-800" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.Returned}`} 
                    />
                    <StatCard 
                        title="مرتجع في شركة التوصيل" 
                        value={data.returnedToCompanyCount} 
                        icon={<ReturnedIcon />} 
                        color="bg-gradient-to-br from-orange-600 to-red-600" 
                        linkTo={`/shipments?status=${DeliveryTrackingStatus.ReturnedToCompany}`} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    {/* Shipment News Section - Only shows if there are comments */}
                    {data.shipmentNews.length > 0 && (
                        <div className="lg:col-span-2 bg-gradient-to-l from-yellow-500/10 to-transparent border-r-4 border-yellow-500 p-3 md:p-6 rounded-2xl md:rounded-[3rem] shadow-sm animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-yellow-500 text-white rounded-xl shadow-lg shadow-yellow-500/20">
                                    <NewsIcon />
                                </div>
                                <div>
                                    <h2 className="text-xs md:text-base font-black text-gray-800 dark:text-white">أخبار وتحديثات الشحنات</h2>
                                    <p className="text-[8px] md:text-xs text-gray-400 font-bold">آخر الملاحظات المرسلة من الإدارة حول شحناتك</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.shipmentNews.map((news, idx) => (
                                    <ReactRouterDOM.Link 
                                        key={`${news.orderId}-${idx}`} 
                                        to={`/orders/${news.orderId}`}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[8px] font-black text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">#{news.orderId}</span>
                                            <span className="text-[8px] font-bold text-gray-400">{new Date(news.date).toLocaleDateString('ar-LY')}</span>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-gray-700 dark:text-gray-300 font-bold leading-relaxed line-clamp-2 group-hover:text-yellow-600 transition-colors">{news.comment}</p>
                                    </ReactRouterDOM.Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                        <div className="p-3 md:p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-row justify-between items-center gap-2">
                            <h2 className="text-[10px] md:text-sm font-black text-gray-800 dark:text-white">أحدث الفواتير</h2>
                            <ReactRouterDOM.Link to="/orders" className="text-[9px] md:text-[11px] font-black bg-yellow-500 text-white px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">عرض الكل</ReactRouterDOM.Link>
                        </div>
                        
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">رقم الفاتورة</th>
                                        <th className="px-4 py-4">الزبون</th>
                                        <th className="px-4 py-4">المتجر</th>
                                        <th className="px-4 py-4">الإجمالي</th>
                                        <th className="px-6 py-4">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {data.recentOrders.map((order, idx) => (
                                        <tr key={`${order.id}-${idx}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <ReactRouterDOM.Link to={`/orders/${order.id}`} className="font-mono font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors text-xs whitespace-nowrap">#{order.id}</ReactRouterDOM.Link>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-gray-800 dark:text-gray-100 text-xs">{order.customerName}</td>
                                            <td className="px-4 py-4 text-gray-600 dark:text-gray-400 font-medium text-xs">{stores.find(s => s.id === order.storeId)?.name}</td>
                                            <td className="px-4 py-4 font-black text-gray-900 dark:text-white whitespace-nowrap text-xs">{order.total.toLocaleString()} د.ل</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide shadow-sm ${getStatusColor(order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending)}`}>
                                                    {order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
 
                        {/* Mobile List View for Recent Orders - Limited to 5 */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                            {data.recentOrders.map((order, idx) => (
                                <ReactRouterDOM.Link 
                                    key={`${order.id}-${idx}`} 
                                    to={`/orders/${order.id}`}
                                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono font-bold text-yellow-600 text-[9px]">#{order.id}</span>
                                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight whitespace-nowrap ${getStatusColor(order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending)}`}>
                                                {order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-0.5">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-[10px] truncate max-w-[160px]">{order.customerName}</h3>
                                                <span className="text-[8px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[130px]">{stores.find(s => s.id === order.storeId)?.name}</span>
                                            </div>
                                            <span className="font-black text-gray-900 dark:text-white text-[11px]">{order.total.toLocaleString()} د.ل</span>
                                        </div>
                                    </div>
                                </ReactRouterDOM.Link>
                            ))}
                        </div>
 
                        {data.recentOrders.length === 0 && <div className="py-10 md:py-20 text-center text-gray-400 font-bold text-[10px] md:text-sm">لا توجد فواتير حديثة</div>}
                    </div>
 
                    {/* Latest News Section */}
                    {(data.recentNews.length > 0 || isAdmin) && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col animate-fade-in-up">
                            <div className="p-3 md:p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-row justify-between items-center gap-2">
                                <h2 className="text-[10px] md:text-sm font-black text-gray-800 dark:text-white">آخر التنبيهات</h2>
                                <ReactRouterDOM.Link to="/news" className="text-[9px] md:text-[11px] font-black bg-yellow-500 text-white px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">عرض الكل</ReactRouterDOM.Link>
                            </div>
                            <div className="p-2 md:p-4 space-y-2 md:space-y-3 overflow-y-auto custom-scrollbar flex-grow max-h-[500px] md:max-h-[600px]">
                                {data.recentNews.slice(0, 7).map((item, index) => (
                                    <div key={`${item.id}-${index}`} className={`p-2 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl md:rounded-2xl border border-transparent hover:border-yellow-200 dark:hover:border-yellow-900/30 transition-all cursor-default ${index >= 4 ? 'hidden md:block' : ''}`}>
                                        <div className="flex gap-1.5 md:gap-3 items-start">
                                            <div className="p-1 md:p-1.5 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm text-yellow-600 border border-gray-100 dark:border-gray-700 flex-shrink-0 scale-[0.65] md:scale-[0.75]"><NewsIcon /></div>
                                            <div className="min-w-0 flex-grow text-right">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-black text-gray-800 dark:text-white leading-tight truncate mb-0.5 text-[11px] md:text-sm">{item.title}</h3>
                                                    {!item.seenBy.includes(currentUser?.id || 0) && (
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); markNewsAsSeen(item.id); }}
                                                            className="text-[7px] md:text-[9px] font-black text-green-600 bg-green-50 px-1 py-0.5 rounded-md hover:bg-green-100"
                                                        >
                                                            تمت المشاهدة
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[8px] md:text-[10px] text-gray-400 font-bold mb-0.5">{new Date(item.date).toLocaleDateString('ar-LY')}</p>
                                                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">{item.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {data.recentNews.length === 0 && (
                                    <div className="py-5 md:py-20 text-center flex flex-col items-center">
                                        <div className="w-8 h-8 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 mb-1 md:mb-4 scale-75 md:scale-100"><NewsIcon /></div>
                                        <p className="text-[8px] md:text-sm text-gray-400 font-bold">لا توجد تنبيهات</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
