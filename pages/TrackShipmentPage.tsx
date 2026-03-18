
import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { DeliveryTrackingStatus, Order } from '../types';
import { db } from '../firebaseService';

// --- Icon Components for Stepper ---
const ProcessingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const AirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const WarehouseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const DeliveredIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ReturnedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>;


const stepDetails = [
    { status: DeliveryTrackingStatus.Pending, Icon: ProcessingIcon, label: 'قيد التجهيز' },
    { status: DeliveryTrackingStatus.InternationalShipping, Icon: AirplaneIcon, label: 'شحن دولي' },
    { status: DeliveryTrackingStatus.Arrived, Icon: WarehouseIcon, label: 'وصلت للمخزن' },
    { status: DeliveryTrackingStatus.LocalShipping, Icon: TruckIcon, label: 'شحن محلي' },
    { status: DeliveryTrackingStatus.Delivered, Icon: DeliveredIcon, label: 'تم التسليم' },
    { status: DeliveryTrackingStatus.ReturnedToCompany, Icon: ReturnedIcon, label: 'مرتجع في شركة التوصيل' },
    { status: DeliveryTrackingStatus.Returned, Icon: ReturnedIcon, label: 'مرتجع' },
];

const TrackingStepper: React.FC<{ currentStatus: DeliveryTrackingStatus }> = ({ currentStatus }) => {
    const steps = stepDetails.filter(s => s.status !== DeliveryTrackingStatus.Returned && s.status !== DeliveryTrackingStatus.ReturnedToCompany);
    const isReturned = currentStatus === DeliveryTrackingStatus.Returned || currentStatus === DeliveryTrackingStatus.ReturnedToCompany;
    
    const lastNormalStatusIndex = isReturned 
        ? steps.findIndex(s => s.status === DeliveryTrackingStatus.LocalShipping)
        : -1;
        
    const currentIndex = isReturned ? lastNormalStatusIndex : steps.findIndex(s => s.status === currentStatus);

    return (
        <div className="flex items-center justify-between w-full my-8 flex-wrap" dir="rtl">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;

                const circleClasses = isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-yellow-500 border-yellow-500 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500';

                const lineClasses = index < currentIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600';

                return (
                    <React.Fragment key={step.status}>
                        <div className="flex flex-col items-center text-center p-2 flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${circleClasses}`}>
                                <step.Icon />
                            </div>
                            <p className={`mt-2 text-xs md:text-sm font-semibold transition-colors duration-500 ${
                                isCurrent ? 'text-yellow-600 dark:text-yellow-400' : 
                                isCompleted ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>{step.label}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-grow h-1 rounded transition-colors duration-500 ${lineClasses}`}></div>
                        )}
                    </React.Fragment>
                );
            })}

            {isReturned && (
                 <>
                    <div className={`flex-grow h-1 rounded bg-red-500`}></div>
                    <div className="flex flex-col items-center text-center p-2 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 bg-red-500 border-red-500 text-white`}>
                            <ReturnedIcon />
                        </div>
                        <p className={`mt-2 text-xs md:text-sm font-semibold transition-colors duration-500 text-red-500`}>
                            {DeliveryTrackingStatus.Returned}
                        </p>
                    </div>
                 </>
            )}
        </div>
    );
};

const TrackShipmentPage: React.FC = () => {
    const { trackingNumber: initialTrackingNumber } = ReactRouterDOM.useParams<{ trackingNumber?: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trackedOrder, setTrackedOrder] = useState<Order | null | undefined>(undefined); // undefined means not searched yet

    useEffect(() => {
        const fetchOrder = async () => {
            if (initialTrackingNumber) {
                setIsLoading(true);
                setTrackedOrder(undefined);
                try {
                    const order = await db.queryOrdersByTracking(initialTrackingNumber);
                    setTrackedOrder(order);
                } catch (e) {
                    console.error("Tracking search failed:", e);
                    setLocalError("حدث خطأ أثناء البحث عن الشحنة.");
                    setTrackedOrder(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setTrackedOrder(undefined); 
            }
        };

        fetchOrder();
    }, [initialTrackingNumber]);
    
    useEffect(() => {
        setTrackingNumber(initialTrackingNumber || '');
    }, [initialTrackingNumber]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackingNumber.trim()) {
            setLocalError('');
            navigate(`/track/${encodeURIComponent(trackingNumber.trim())}`);
        } else {
            setLocalError('الرجاء إدخال رقم تتبع أو رقم فاتورة صالح.');
        }
    };

    const SearchForm = () => (
        <div className="max-w-lg mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-gray-800 p-1.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <label htmlFor="tracking-number" className="sr-only">رقم التتبع أو الفاتورة</label>
                <input 
                    id="tracking-number"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="رقم الفاتورة أو التتبع..."
                    className="flex-grow p-2.5 md:p-3.5 border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-bold text-xs md:text-sm"
                />
                <button type="submit" className="bg-yellow-500 text-white px-5 md:px-8 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-black text-xs md:text-sm hover:bg-yellow-600 transition-all shadow-md active:scale-95">
                    تتبع
                </button>
            </form>
            {localError && <p className="text-red-500 text-center mt-3 font-bold text-[10px] md:text-xs">{localError}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6" dir="rtl">
            <div className="container mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tight mb-2">تتبع شحنتك</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">أدخل رقم الفاتورة، رقم التتبع الدولي، أو المحلي لمعرفة حالة طلبك.</p>
                </div>

                <SearchForm />

                {isLoading && (
                     <div className="mt-16 max-w-5xl mx-auto text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mx-auto"></div>
                        <p className="mt-6 font-black text-gray-500">جاري استرجاع بيانات الشحنة...</p>
                    </div>
                )}

                {!isLoading && trackedOrder !== undefined && (
                    trackedOrder ? (
                        <div className="mt-12 max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3rem] shadow-2xl animate-fade-in-up border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b dark:border-gray-700 pb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-black mb-1">تفاصيل الرحلة: <span className="text-yellow-600 font-mono">{(initialTrackingNumber || '').toUpperCase()}</span></h2>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">تحديثات حالة الطلب اللحظية</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم الفاتورة المرجعي</p>
                                     <p className="text-xl font-black text-gray-800 dark:text-white font-mono leading-none">#{trackedOrder.id}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300 mb-10">
                                <div className="bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الزبون المستلم</p>
                                    <p className="text-lg font-black text-gray-800 dark:text-white">{trackedOrder.customerName}</p>
                                </div>
                                <div className="bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">وجهة التوصيل</p>
                                    <p className="text-lg font-black text-gray-800 dark:text-white">{trackedOrder.city}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 py-4">
                                <TrackingStepper currentStatus={trackedOrder.deliveryTrackingStatus} />
                            </div>
                            
                            {(trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.Returned || trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany) && (
                                <div className={`mt-10 border-r-8 p-6 rounded-3xl animate-pulse ${trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-600' : 'bg-red-50 dark:bg-red-900/20 border-red-600'}`}>
                                    <h3 className={`font-black text-lg ${trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany ? 'text-amber-800 dark:text-amber-200' : 'text-red-800 dark:text-red-200'}`}>
                                        {trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany ? 'الشحنة في طريق العودة' : 'فشل في عملية التسليم'}
                                    </h3>
                                    <p className={`mt-2 font-medium ${trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'}`}>
                                        {trackedOrder.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany 
                                            ? 'الشحنة حالياً لدى شركة التوصيل وهي في طريق العودة إلينا. سيتم تحديث الحالة فور استلامنا للمنتج.'
                                            : 'تم إرجاع الشحنة. قد يكون هذا بسبب عدم تمكن مندوب التوصيل من الوصول إليك أو وجود مشكلة في العنوان. يرجى مراجعة قسم الدعم الفني للمتابعة.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                         initialTrackingNumber && (
                            <div className="mt-12 max-w-2xl mx-auto bg-white dark:bg-gray-800 p-12 rounded-[3rem] shadow-xl text-center animate-fade-in-up border-2 border-dashed border-red-100 dark:border-red-900/30">
                                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <h2 className="text-2xl font-black text-red-600 mb-2">تعذر العثور على الشحنة</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                                    لم نتمكن من العثور على أي سجل مالي أو شحنة مطابقة للرقم <span className="text-gray-900 dark:text-white font-mono">"{initialTrackingNumber}"</span>. <br/>يرجى التأكد من كتابة الرقم بشكل صحيح (أرقام وحروف) وحاول مرة أخرى.
                                </p>
                            </div>
                         )
                    )
                )}
            </div>
        </div>
    );
};
export default TrackShipmentPage;
