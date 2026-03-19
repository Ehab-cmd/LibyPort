
import React, { useMemo, useState, useEffect, startTransition, useCallback, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, PurchaseTrackingStatus, Order, OrderType, DeliveryTrackingStatus, CurrencyType, CurrencyTxType, TreasuryType, CompanyTxType, PaymentStatus, User, BankAccount, DeliveryCompany, ClientTransactionType } from '../types';
import { getDeliveryStatusColor } from '../utils/statusColors';
import * as ReactRouterDOM from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

import { useNotification } from '../context/NotificationContext';

// --- Icons ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

// --- مكون متتالية "تم الشراء" المطور (The Purchase Wizard) ---
const PurchaseWizard: React.FC<{
    order: Order;
    onClose: () => void;
    onFinish: (updates: Partial<Order>) => Promise<void>;
    exchangeRate: number;
    currencyBalances: Record<CurrencyType, number>;
    addCurrencyTx: (data: any) => Promise<void>;
}> = ({ order, onClose, onFinish, exchangeRate, currencyBalances, addCurrencyTx }) => {
    const [step, setStep] = useState<'cost' | 'deduct' | 'ship'>('cost');
    const [actualCostUSD, setActualCostUSD] = useState(String(order.costInUSD || 0));
    const [actualCommissionUSD, setActualCommissionUSD] = useState('0'); 
    const [shouldDeduct, setShouldDeduct] = useState(true);
    
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(CurrencyType.USD);
    const [deductDescription, setDeductDescription] = useState(`شراء بضاعة طلبية #${order.id} - ${order.customerName}`);
    
    const [deliveryStatus, setDeliveryStatus] = useState<DeliveryTrackingStatus>(DeliveryTrackingStatus.InternationalShipping);
    const [intlTracking, setIntlTracking] = useState(order.internationalTrackingNumber || '');
    const [localTracking, setLocalTracking] = useState(order.localTrackingNumber || '');

    const EUR_USD_PARITY = 1.085;
    const USD_AED_PARITY = 3.6725;
    const USD_SAR_PARITY = 3.7500;

    const totalDeductionUSD = useMemo(() => {
        return (parseFloat(actualCostUSD) || 0) + (parseFloat(actualCommissionUSD) || 0);
    }, [actualCostUSD, actualCommissionUSD]);

    const calculateDeduction = () => {
        let walletAmount = totalDeductionUSD;
        if (selectedCurrency === CurrencyType.EUR) walletAmount = totalDeductionUSD / EUR_USD_PARITY;
        if (selectedCurrency === CurrencyType.AED) walletAmount = totalDeductionUSD * USD_AED_PARITY;
        if (selectedCurrency === CurrencyType.SAR) walletAmount = totalDeductionUSD * USD_SAR_PARITY;
        return { walletAmount, lydEquiv: totalDeductionUSD * exchangeRate };
    };

    const handleNextFromCost = () => {
        if (shouldDeduct) setStep('deduct');
        else setStep('ship');
    };

    const handleConfirmDeduction = async () => {
        const { walletAmount } = calculateDeduction();
        // تصحيح: نوع الحركة يجب أن يكون Spend لخصم الرصيد
        await addCurrencyTx({
            date: new Date().toISOString(),
            type: CurrencyTxType.Spend,
            currency: selectedCurrency,
            amount: walletAmount,
            description: `[سداد تلقائي] ${deductDescription} (إجمالي المشتريات: $${totalDeductionUSD.toFixed(2)})`
        });
        setStep('ship');
    };

    const handleFinalize = async () => {
        const updates: Partial<Order> = {
            purchaseTrackingStatus: PurchaseTrackingStatus.Purchased,
            costInUSD: parseFloat(actualCostUSD),
            notes: (order.notes || '') + `\n[عمولة شراء مخصومة: $${actualCommissionUSD}]`,
            deliveryTrackingStatus: deliveryStatus,
            internationalTrackingNumber: intlTracking,
            localTrackingNumber: localTracking
        };
        await onFinish(updates);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[1000] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-fade-in-up border dark:border-gray-700 relative">
                <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-red-500 transition-colors p-1"><CloseIcon /></button>

                {step === 'cost' && (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-black text-center mb-1 dark:text-white">تأكيد تكلفة الشراء</h2>
                        <p className="text-[10px] text-gray-400 text-center mb-6 font-bold uppercase tracking-tight">يرجى مراجعة التكلفة والعمولة</p>
                        
                        <div className="space-y-3 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 mr-1">التكلفة الفعلية ($)</label>
                                <input 
                                    type="number" 
                                    value={actualCostUSD} 
                                    onChange={e => setActualCostUSD(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 font-black text-2xl focus:ring-0 dark:text-white"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-red-50/50 dark:bg-red-900/10 p-3.5 rounded-2xl border border-red-100 dark:border-red-900/20">
                                <label className="block text-[9px] font-black text-red-400 uppercase mb-1 mr-1">العمولة المخصومة ($)</label>
                                <input 
                                    type="number" 
                                    value={actualCommissionUSD} 
                                    onChange={e => setActualCommissionUSD(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 font-black text-xl text-red-600 focus:ring-0"
                                />
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border-2 border-green-500/30 text-center">
                                <p className="text-[9px] font-black text-green-700 uppercase mb-1">إجمالي الخصم من المحفظة</p>
                                <p className="text-2xl font-black text-green-600">${totalDeductionUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/20 flex items-center justify-between mb-6">
                            <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">خصم من رصيد العملة</span>
                            <input 
                                type="checkbox" 
                                checked={shouldDeduct} 
                                onChange={e => setShouldDeduct(e.target.checked)}
                                className="w-5 h-5 rounded text-yellow-600 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl text-xs">إلغاء</button>
                            <button onClick={handleNextFromCost} className="flex-[2] py-3 bg-green-600 text-white font-black rounded-xl shadow-lg hover:bg-green-700 text-xs">تأكيد وشراء</button>
                        </div>
                    </div>
                )}

                {step === 'deduct' && (
                    <div className="animate-fade-in">
                         <h2 className="text-lg font-black text-center mb-6 text-red-600 flex items-center justify-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             سداد من الرصيد
                         </h2>

                         <div className="grid grid-cols-2 gap-2 mb-6">
                            {[CurrencyType.USD, CurrencyType.EUR, CurrencyType.SAR, CurrencyType.AED].map(cur => (
                                <button 
                                    key={cur}
                                    onClick={() => setSelectedCurrency(cur)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${selectedCurrency === cur ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-100 dark:border-gray-700'}`}
                                >
                                    <span className="font-black text-xs">{cur}</span>
                                    <span className="text-[8px] text-gray-400 mt-0.5">{currencyBalances[cur]?.toLocaleString() || 0}</span>
                                </button>
                            ))}
                         </div>

                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border-2 border-dashed border-gray-200 mb-6 text-center">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">المبلغ الذي سيُخصم ({selectedCurrency})</p>
                            <p className="text-2xl font-black text-red-600">{calculateDeduction().walletAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">معادل الدينار: {calculateDeduction().lydEquiv.toLocaleString()}</p>
                         </div>

                         <div className="flex gap-2">
                            <button onClick={() => setStep('cost')} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl text-xs">رجوع</button>
                            <button onClick={handleConfirmDeduction} className="flex-[2] py-3 bg-red-600 text-white font-black rounded-xl shadow-lg text-xs">تأكيد الخصم</button>
                         </div>
                    </div>
                )}

                {step === 'ship' && (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-black text-center mb-1 dark:text-white">إدارة شحنة #{order.id}</h2>
                        <p className="text-[10px] text-gray-400 text-center mb-6 font-bold uppercase tracking-tight">تسجيل بيانات التتبع</p>

                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 mr-1">حالة التوصيل</label>
                                <select 
                                    value={deliveryStatus} 
                                    onChange={e => setDeliveryStatus(e.target.value as DeliveryTrackingStatus)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-bold text-xs focus:ring-1 focus:ring-yellow-500"
                                >
                                    {Object.values(DeliveryTrackingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 mr-1">التتبع الدولي</label>
                                <input type="text" value={intlTracking} onChange={e => setIntlTracking(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-mono text-xs" placeholder="GSH..." />
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 mr-1">التتبع المحلي</label>
                                <input type="text" value={localTracking} onChange={e => setLocalTracking(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-mono text-xs" placeholder="LP-TRIP..." />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl text-xs">إلغاء</button>
                            <button onClick={handleFinalize} className="flex-[2] py-3 bg-yellow-500 text-white font-black rounded-xl shadow-lg text-xs">حفظ التغييرات</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const OrdersPage: React.FC = () => {
    const { currentUser, orders, getStoreNames, updateOrder, stores, currencyBalances, addCurrencyTransaction, exchangeRate } = useAppContext();
    const { showToast, showConfirm } = useNotification();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();

    const [depositActionOrder, setDepositActionOrder] = useState<Order | null>(null);
    const [purchasingOrder, setPurchasingOrder] = useState<Order | null>(null); 
    const [visibleCount, setVisibleCount] = useState(50);

    const isAdmin = useMemo(() => !!(currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role)), [currentUser]);

    const urlSearchTerm = searchParams.get('search') || '';
    const statusFilter = (searchParams.get('status') as PurchaseTrackingStatus | 'all') || 'all';
    const storeFilter = searchParams.get('store') || 'all';

    const updateFilter = (key: string, val: string) => {
        startTransition(() => {
            setSearchParams(prev => {
                if (!val || val === 'all') prev.delete(key);
                else prev.set(key, val);
                return prev;
            }, { replace: true });
        });
    };

    // حفظ واستعادة موقع التمرير - تم تحسينه بشكل جذري
    const handleOrderClick = (id: string) => {
        const container = document.getElementById('main-content');
        if (container) {
            // نخزن قيمة scrollTop الفعلية في sessionStorage قبل الانتقال
            sessionStorage.setItem('orders_scroll_pos', container.scrollTop.toString());
        }
        navigate(`/orders/${id}`);
    };

    useLayoutEffect(() => {
        const savedPos = sessionStorage.getItem('orders_scroll_pos');
        if (savedPos && orders.length > 0) {
            const container = document.getElementById('main-content');
            if (container) {
                const top = parseInt(savedPos);
                const attemptScroll = () => {
                    if (container) {
                        container.scrollTo({ top, behavior: 'instant' });
                    }
                };

                // محاولات متعددة لضمان استقرار التمرير بعد رندر العناصر
                attemptScroll();
                const t1 = setTimeout(attemptScroll, 50);
                const t2 = setTimeout(attemptScroll, 150);
                const t3 = setTimeout(() => {
                    attemptScroll();
                    sessionStorage.removeItem('orders_scroll_pos');
                }, 400);

                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                };
            }
        }
    }, [orders.length]); // يعمل الكود كلما تغير طول القائمة (بمعنى تم تحميل البيانات)

    const filteredOrders = useMemo(() => {
        const userStoreIds = isAdmin ? orders.map(o => o.storeId) : currentUser?.storeIds || [];
        const searchTermClean = urlSearchTerm.toLowerCase().trim();

        return [...orders]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter(o => userStoreIds.includes(o.storeId) && !o.isDeleted)
            .filter(o => {
                const currentStatus = o.purchaseTrackingStatus || PurchaseTrackingStatus.Pending;
                return statusFilter === 'all' || currentStatus === statusFilter;
            })
            .filter(o => storeFilter === 'all' || String(o.storeId) === storeFilter)
            .filter(o => {
                if (!searchTermClean) return true;
                return String(o.customerName || '').toLowerCase().includes(searchTermClean) || 
                       String(o.id).toLowerCase().includes(searchTermClean) || 
                       String(o.phone1).includes(searchTermClean) ||
                       String(o.depositTrackingNumber || '').toLowerCase().includes(searchTermClean);
            });
    }, [orders, currentUser, urlSearchTerm, isAdmin, statusFilter, storeFilter]);

    const handleUpdateStatus = useCallback(async (updates: Partial<Order>) => {
        if (depositActionOrder) {
            await updateOrder(depositActionOrder.id, updates);
        }
    }, [depositActionOrder, updateOrder]);

    const getStatusStyles = (status: PurchaseTrackingStatus) => {
        switch (status) {
            case PurchaseTrackingStatus.Purchased: return 'bg-green-600 text-white';
            case PurchaseTrackingStatus.Processing: return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30';
            case PurchaseTrackingStatus.Pending: return 'bg-blue-500 text-white';
            case PurchaseTrackingStatus.Cancelled: return 'bg-red-600 text-white';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {purchasingOrder && (
                <PurchaseWizard 
                    order={purchasingOrder}
                    onClose={() => setPurchasingOrder(null)}
                    onFinish={async (updates) => {
                        await updateOrder(purchasingOrder.id, updates);
                    }}
                    exchangeRate={exchangeRate}
                    currencyBalances={currencyBalances}
                    addCurrencyTx={addCurrencyTransaction}
                />
            )}

            {depositActionOrder && (
                <DepositActionModal 
                    order={depositActionOrder} 
                    isAdmin={isAdmin}
                    onClose={() => setDepositActionOrder(null)} 
                    onStatusChange={handleUpdateStatus}
                />
            )}

            <div className="flex flex-row justify-between items-center mb-6 md:mb-10 gap-4">
                <div>
                    <h1 className="text-base md:text-xl font-black text-gray-900 dark:text-white tracking-tight">سجل الفواتير الموحد</h1>
                    <p className="text-[9px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 font-bold">إدارة عمليات الشراء وتتبع الحالات، العربون، والتسليم.</p>
                </div>
                <ReactRouterDOM.Link to="/orders/new" className="flex-shrink-0 bg-yellow-500 text-white px-4 py-2 md:px-10 md:py-4 rounded-xl md:rounded-[1.5rem] font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 text-[9px] md:text-sm">
                    <PlusIcon /> <span className="hidden sm:inline">إنشاء فاتورة جديدة</span><span className="sm:hidden">إنشاء</span>
                </ReactRouterDOM.Link>
            </div>

            <div className="max-w-6xl mx-auto mb-6 md:mb-12 animate-fade-in-up">
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-row gap-2 md:gap-5 items-end">
                    
                    <div className="relative flex-grow">
                        <label className="hidden md:block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">البحث</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="بحث..." 
                                value={urlSearchTerm} 
                                onChange={e => updateFilter('search', e.target.value)} 
                                className="w-full p-2 md:p-4 pr-8 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold transition-all shadow-inner text-gray-900 dark:text-white text-[9px] md:text-sm" 
                            />
                            <div className="absolute right-2 md:right-4 top-2 md:top-4 text-gray-400 scale-[0.5] md:scale-100"><SearchIcon /></div>
                        </div>
                    </div>
                    
                    <div className="w-24 md:w-40 flex-shrink-0 flex flex-col gap-1">
                        <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1 mr-1 md:mr-2 truncate">الحالة</label>
                        <select 
                            value={statusFilter} 
                            onChange={e => updateFilter('status', e.target.value)}
                            className="w-full p-1.5 md:p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-lg md:rounded-xl font-bold text-[8px] md:text-xs focus:ring-2 focus:ring-yellow-500 dark:text-white appearance-none"
                        >
                            <option value="all">الكل</option>
                            {Object.values(PurchaseTrackingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="w-24 md:w-40 flex-shrink-0 flex flex-col gap-1">
                        <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1 mr-1 md:mr-2 truncate">المتجر</label>
                        <select 
                            value={storeFilter} 
                            onChange={e => updateFilter('store', e.target.value)}
                            className="w-full p-1.5 md:p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-lg md:rounded-xl font-bold text-[8px] md:text-xs focus:ring-2 focus:ring-yellow-500 dark:text-white appearance-none"
                        >
                            <option value="all">الكل</option>
                            {stores.filter(s => isAdmin || currentUser?.storeIds.includes(s.id)).map(s => (
                                <option key={s.id} value={String(s.id)}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border dark:border-gray-700 overflow-hidden animate-fade-in-up">
                <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-6">رقم الفاتورة</th>
                                <th className="px-4 py-6">العميل</th>
                                <th className="px-6 py-6">المتجر</th>
                                <th className="px-6 py-6">الإجمالي</th>
                                <th className="px-6 py-6 text-center">حالة الشراء</th>
                                <th className="px-8 py-6 text-left">التوصيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {filteredOrders.slice(0, visibleCount).map((order, idx) => (
                                <tr key={`${order.id}-${idx}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <button onClick={() => handleOrderClick(order.id)} className="font-mono font-bold text-yellow-600 text-xs hover:text-yellow-700 transition-colors cursor-pointer whitespace-nowrap">#{order.id}</button>
                                        <span className="block text-[10px] text-gray-400 font-bold mt-1 uppercase">{new Date(order.date).toLocaleDateString('ar-LY')}</span>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="flex flex-col min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white leading-tight truncate text-xs">{order.customerName}</p>
                                            {((order.orderType === OrderType.DepositPurchase || order.orderType === OrderType.Procurement) && order.deposit && order.deposit > 0) && (
                                                <div className="mt-1.5 flex flex-col items-start gap-1">
                                                    {order.isDepositPaid ? (
                                                        <div 
                                                            onClick={isAdmin ? (e) => { e.stopPropagation(); setDepositActionOrder(order); } : undefined}
                                                            className={`text-[9px] bg-green-50 dark:bg-green-900/20 text-green-600 px-2.5 py-1 rounded-full font-bold border border-green-100 flex items-center gap-1 transition-colors ${isAdmin ? 'cursor-pointer hover:bg-green-100' : 'cursor-default'}`}
                                                        >
                                                            💰 تم إيداع ({order.deposit})
                                                        </div>
                                                    ) : order.depositTrackingNumber ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div 
                                                                onClick={isAdmin ? (e) => { e.stopPropagation(); setDepositActionOrder(order); } : undefined}
                                                                className={`text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2.5 py-1 rounded-full font-bold border border-blue-100 transition-colors w-fit ${isAdmin ? 'cursor-pointer hover:bg-blue-100' : 'cursor-default'}`}
                                                            >
                                                                🔍 جاري استلام العربون
                                                            </div>
                                                            <span className="text-[8px] text-gray-400 font-mono font-bold bg-gray-50 dark:bg-gray-900 px-1.5 rounded border border-dashed border-gray-200 dark:border-gray-700">Ref: {order.depositTrackingNumber}</span>
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            onClick={isAdmin ? (e) => { e.stopPropagation(); setDepositActionOrder(order); } : undefined}
                                                            className={`text-[9px] bg-red-50 dark:bg-red-900/10 text-red-600 px-2.5 py-1 rounded-full font-bold border border-red-100 transition-colors ${isAdmin ? 'cursor-pointer animate-pulse hover:bg-red-100' : 'cursor-default'}`}
                                                        >
                                                            ⚠️ بانتظار العربون ({order.deposit})
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-gray-600 dark:text-gray-400 font-bold truncate">{getStoreNames([order.storeId])}</td>
                                    <td className="px-6 py-6 font-black text-gray-900 dark:text-white text-sm whitespace-nowrap">{order.total.toLocaleString()} <span className="text-xs font-normal opacity-50">د.ل</span></td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="relative inline-block w-full max-w-[140px]">
                                            <select 
                                                value={order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending} 
                                                disabled={!isAdmin}
                                                onChange={(e) => { 
                                                    const s = e.target.value as PurchaseTrackingStatus; 
                                                    if (s === PurchaseTrackingStatus.Purchased) {
                                                        if (order.orderType === OrderType.InstantDelivery) {
                                                            updateOrder(order.id, { 
                                                                purchaseTrackingStatus: s,
                                                                deliveryTrackingStatus: DeliveryTrackingStatus.Arrived 
                                                            });
                                                        } else {
                                                            setPurchasingOrder(order);
                                                        }
                                                    } else {
                                                        updateOrder(order.id, { purchaseTrackingStatus: s }); 
                                                    }
                                                }} 
                                                className={`w-full appearance-none px-3 py-2 rounded-xl text-[9px] font-bold uppercase text-center border shadow-sm transition-all outline-none ${getStatusStyles(order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending)} ${!isAdmin ? 'cursor-default opacity-80' : 'cursor-pointer hover:shadow-md'}`}
                                            >
                                                {Object.values(PurchaseTrackingStatus).map(s => <option key={s} value={s} className="bg-white text-gray-900">{s}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <span className={`text-[9px] font-bold uppercase tracking-tight px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm border ${getDeliveryStatusColor(order.deliveryTrackingStatus)}`}>
                                            {order.deliveryTrackingStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:hidden p-4 space-y-6 bg-gray-50/50 dark:bg-gray-900/20">
                    {filteredOrders.slice(0, visibleCount).map((order, idx) => (
                        <div key={`${order.id}-${idx}`} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 relative animate-fade-in-up">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <button onClick={() => handleOrderClick(order.id)} className="text-xs font-bold text-yellow-600 block mb-1 font-mono tracking-widest whitespace-nowrap">#{order.id}</button>
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(order.date).toLocaleDateString('ar-LY')}</span>
                                </div>
                                <div className="text-left">
                                    <select 
                                        value={order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending} 
                                        disabled={!isAdmin}
                                        onChange={(e) => { 
                                            const s = e.target.value as PurchaseTrackingStatus; 
                                            if (s === PurchaseTrackingStatus.Purchased) {
                                                if (order.orderType === OrderType.InstantDelivery) {
                                                    updateOrder(order.id, { 
                                                        purchaseTrackingStatus: s,
                                                        deliveryTrackingStatus: DeliveryTrackingStatus.Arrived
                                                    });
                                                } else {
                                                    setPurchasingOrder(order);
                                                }
                                            } else {
                                                updateOrder(order.id, { purchaseTrackingStatus: s }); 
                                            }
                                        }} 
                                        className={`px-3 py-2 rounded-xl text-[9px] font-bold uppercase text-center border shadow-md transition-all outline-none ${getStatusStyles(order.purchaseTrackingStatus || PurchaseTrackingStatus.Pending)} ${!isAdmin ? 'opacity-80' : 'hover:shadow-lg'}`}
                                    >
                                        {Object.values(PurchaseTrackingStatus).map(s => <option key={s} value={s} className="bg-white text-gray-900">{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-5">
                                <h3 className="font-bold text-gray-900 dark:text-white text-xs leading-tight truncate">{order.customerName}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mt-1.5">{getStoreNames([order.storeId])}</p>
                                
                                {((order.orderType === OrderType.DepositPurchase || order.orderType === OrderType.Procurement) && order.deposit && order.deposit > 0) && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {order.isDepositPaid ? (
                                            <div 
                                                onClick={isAdmin ? (e) => { e.stopPropagation(); setDepositActionOrder(order); } : undefined}
                                                className={`text-[10px] bg-green-50 dark:bg-green-900/20 text-green-600 px-3 py-1.5 rounded-full font-bold border border-green-100 flex items-center gap-1.5 transition-transform ${isAdmin ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                                            >
                                                💰 تم استلام العربون ({order.deposit})
                                            </div>
                                        ) : order.depositTrackingNumber ? (
                                            <div 
                                                onClick={isAdmin ? (e) => { e.stopPropagation(); setDepositActionOrder(order); } : undefined}
                                                className={`text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-full font-bold border border-blue-100 transition-transform ${isAdmin ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                                            >
                                                🔍 جاري التحقق من الحوالة
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={isAdmin ? (e) => { e.stopPropagation(); setDepositActionOrder(order); } : undefined}
                                                className={`text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1.5 rounded-full font-bold border border-red-100 transition-transform ${isAdmin ? 'cursor-pointer animate-pulse active:scale-95' : 'cursor-default'}`}
                                            >
                                                ⚠️ مطلوب عربون: {order.deposit} د.ل
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end pt-5 mt-2 border-t border-gray-50 dark:border-gray-700/50">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">حالة التوصيل</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDeliveryStatusColor(order.deliveryTrackingStatus)}`}>{order.deliveryTrackingStatus}</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-black text-gray-900 dark:text-white font-mono leading-none">
                                        {order.total.toLocaleString()} <span className="text-xs font-normal opacity-50">د.ل</span>
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleOrderClick(order.id)}
                                className="w-full mt-6 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200 py-3.5 rounded-2xl font-bold text-[10px] hover:bg-yellow-500 hover:text-white transition-all border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center gap-2"
                            >
                                عرض تفاصيل الفاتورة
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mt-6 animate-pulse">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner"><SearchIcon /></div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لا توجد نتائج</h3>
                </div>
            )}

            {visibleCount < filteredOrders.length && (
                <div className="mt-12 flex justify-center">
                    <button onClick={() => setVisibleCount(v => v + 50)} className="bg-gray-900 dark:bg-gray-700 text-white px-12 py-5 rounded-xl font-black text-sm shadow-2xl transform hover:-translate-y-1 transition-all active:scale-95 border border-gray-800">عرض المزيد</button>
                </div>
            )}

            <div className="h-24"></div>
        </div>
    );
};

// --- المكون المساعد: نافذة خيارات العربون ---
const DepositActionModal: React.FC<{
    order: Order;
    isAdmin: boolean;
    onClose: () => void;
    onStatusChange: (updates: Partial<Order>) => Promise<void>;
}> = ({ order, isAdmin, onClose, onStatusChange }) => {
    const { showToast, showConfirm } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();
    const [showTrackingInput, setShowTrackingInput] = useState(false);
    const [trackingNote, setTrackingNote] = useState(order.depositTrackingNumber || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleConfirmReceive = () => {
        if (!isAdmin) return; 
        navigate(`/orders/${order.id}?action=confirm_deposit`);
        onClose();
    };

    const handleSaveTracking = async () => {
        if (!trackingNote.trim()) {
            showToast('الرجاء إدخال ملاحظة أو رقم التتبع', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await onStatusChange({ depositTrackingNumber: trackingNote, isDepositPaid: false });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!isAdmin) return;
        const confirmed = await showConfirm('إلغاء الطلبية', `هل أنت متأكد من إلغاء الطلبية #${order.id} بسبب عدم دفع العربون؟`);
        if (confirmed) {
            setIsSaving(true);
            try {
                await onStatusChange({ purchaseTrackingStatus: PurchaseTrackingStatus.Cancelled });
                onClose();
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[999] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-7 rounded-[2rem] shadow-2xl w-full max-w-[340px] animate-fade-in-up border dark:border-gray-700 relative">
                <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-red-500 transition-all p-1.5 bg-gray-50 dark:bg-gray-700 rounded-full">
                    <CloseIcon />
                </button>
                
                <div className="text-center mb-5 mt-2">
                    <h2 className="text-sm font-black text-gray-800 dark:text-white leading-tight">تأكيد العربون للفاتورة #{order.id}</h2>
                    <p className="text-[9px] text-gray-400 font-bold mt-1.5 px-2">الرجاء اختيار الإجراء المناسب بناءً على حالة دفع العربون:</p>
                </div>

                <div className="space-y-2.5">
                    {!showTrackingInput ? (
                        <>
                            {isAdmin && (
                                <button 
                                    onClick={handleConfirmReceive}
                                    className="w-full py-3.5 bg-[#1fb141] text-white rounded-xl font-black shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer text-[11px]"
                                >
                                    تم استلام العربون (إصدار إيصال)
                                </button>
                            )}

                            <button 
                                onClick={() => setShowTrackingInput(true)}
                                className="w-full py-3.5 bg-[#f3f4f6] dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer border-2 border-transparent text-[11px]"
                            >
                                {isAdmin ? 'في انتظار استلام العربون (تعديل/تتبع)' : 'إضافة ملاحظة تتبع العربون'}
                            </button>

                            {isAdmin && (
                                <button 
                                    onClick={handleCancelOrder}
                                    disabled={isSaving}
                                    className="w-full py-3.5 bg-white dark:bg-gray-800 text-red-600 rounded-xl font-black border-2 border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer text-[11px]"
                                >
                                    {isSaving ? 'جاري الإلغاء...' : 'لم يتم دفع العربون (إلغاء الطلبية)'}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="animate-fade-in space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3.5 rounded-xl border-2 border-yellow-500/30">
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1.5">رقم تتبع الحوالة أو ملاحظة</label>
                                <input 
                                    type="text" 
                                    value={trackingNote} 
                                    onChange={e => setTrackingNote(e.target.value)}
                                    placeholder="اكتب رقم التتبع هنا..."
                                    className="w-full bg-transparent border-none p-0 font-bold focus:ring-0 dark:text-white text-xs"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowTrackingInput(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl text-[10px]">تراجع</button>
                                <button onClick={handleSaveTracking} disabled={isSaving} className="flex-1 py-3 bg-yellow-500 text-white font-black rounded-xl shadow-lg text-[10px]">
                                    {isSaving ? 'جاري الحفظ...' : 'حفظ التتبع'}
                                </button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={onClose}
                        className="w-full py-2 text-gray-400 font-bold text-[10px] hover:underline mt-1 cursor-pointer"
                    >
                        إغلاق النافذة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
