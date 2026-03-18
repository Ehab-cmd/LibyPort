
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Order, Product } from '../types';

// --- Icons ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;

const SuccessModal: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center transform transition-all animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">تم التنفيذ</h2>
            <p className="text-gray-600 dark:text-gray-300 my-4 font-bold">{message}</p>
            <button onClick={onClose} className="w-full bg-yellow-500 text-white py-3 rounded-2xl font-black hover:bg-yellow-600 shadow-lg">موافق</button>
        </div>
    </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full mb-4 text-gray-300">
            <InfoIcon />
        </div>
        <p className="text-gray-400 font-bold">{message}</p>
    </div>
);

const DeletionRequestsPage: React.FC = () => {
    const { orders, products, approveDeletion, rejectDeletion, getStoreNames, approveOrderUpdate, rejectOrderUpdate, approveProductUpdate, rejectProductUpdate } = useAppContext();
    const [activeTab, setActiveTab] = useState<'orders_del' | 'products_del' | 'orders_upd' | 'products_upd'>('orders_del');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const pendingDeletionOrders = useMemo(() => orders.filter(o => o.isPendingDeletion && !o.isDeleted), [orders]);
    const pendingDeletionProducts = useMemo(() => products.filter(p => p.isPendingDeletion && !p.isDeleted), [products]);
    const pendingUpdateOrders = useMemo(() => orders.filter(o => o.isPendingUpdate && !o.isDeleted), [orders]);
    const pendingUpdateProducts = useMemo(() => products.filter(p => p.isPendingUpdate && !p.isDeleted), [products]);

    const handleAction = async (action: () => Promise<void>, msg: string) => {
        await action();
        setSuccessMessage(msg);
    };

    const RequestCard: React.FC<{ 
        title: string; 
        subtitle: string; 
        reason?: string; 
        id: string | number; 
        linkTo?: string; 
        onApprove: () => void; 
        onReject: () => void;
        isUpdate?: boolean;
    }> = ({ title, subtitle, reason, id, linkTo, onApprove, onReject, isUpdate }) => (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group animate-fade-in-up">
            <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isUpdate ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {isUpdate ? 'تعديل بيانات' : 'طلب حذف'}
                        </span>
                        {linkTo ? (
                            <ReactRouterDOM.Link to={linkTo} className="text-yellow-600 font-mono font-bold hover:underline">#{id}</ReactRouterDOM.Link>
                        ) : (
                            <span className="text-gray-400 font-mono font-bold">#{id}</span>
                        )}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <StoreIcon /> <span>{subtitle}</span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={onReject} title="رفض الطلب" className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><XIcon /></button>
                    <button onClick={onApprove} title="موافقة" className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"><CheckIcon /></button>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 mr-2">السبب المذكور:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
                    "{reason || 'لا يوجد سبب مفصل مذكور في الطلب.'}"
                </p>
            </div>
            
            <div className="mt-6 flex gap-2">
                 <button onClick={onApprove} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-green-600/20 hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                    {isUpdate ? <CheckIcon /> : <TrashIcon />} موافقة نهائية
                </button>
                <button onClick={onReject} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-xs font-black hover:bg-gray-200 transition-all">إلغاء الطلب</button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto pb-20" dir="rtl">
            {successMessage && <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />}
            
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">المراجعة الإدارية</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">مراجعة كافة طلبات الحذف والتعديل المرفوعة من الموظفين والمتاجر.</p>
            </div>

            {/* Styled Tabs */}
            <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('orders_del')} className={`flex-1 min-w-[140px] px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'orders_del' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>حذف فواتير ({pendingDeletionOrders.length})</button>
                <button onClick={() => setActiveTab('products_del')} className={`flex-1 min-w-[140px] px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'products_del' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>حذف منتجات ({pendingDeletionProducts.length})</button>
                <button onClick={() => setActiveTab('orders_upd')} className={`flex-1 min-w-[140px] px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'orders_upd' ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>تعديل فواتير ({pendingUpdateOrders.length})</button>
                <button onClick={() => setActiveTab('products_upd')} className={`flex-1 min-w-[140px] px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'products_upd' ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>تعديل منتجات ({pendingUpdateProducts.length})</button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'orders_del' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDeletionOrders.map(o => (
                            <RequestCard 
                                key={o.id} 
                                id={o.id} 
                                title={`فاتورة الزبون: ${o.customerName}`} 
                                subtitle={getStoreNames([o.storeId])} 
                                reason={o.deletionReason} 
                                linkTo={`/orders/${o.id}`}
                                onApprove={() => handleAction(() => approveDeletion('order', o.id), 'تم حذف الفاتورة بنجاح')} 
                                onReject={() => handleAction(() => rejectDeletion('order', o.id), 'تم رفض طلب الحذف')}
                            />
                        ))}
                        {pendingDeletionOrders.length === 0 && <div className="col-span-full"><EmptyState message="لا توجد طلبات حذف فواتير معلقة حالياً" /></div>}
                    </div>
                )}

                {activeTab === 'products_del' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDeletionProducts.map(p => (
                            <RequestCard 
                                key={p.id} 
                                id={p.id} 
                                title={p.name} 
                                subtitle={getStoreNames([p.storeId])} 
                                reason={p.deletionReason} 
                                linkTo={`/products/${p.id}`}
                                onApprove={() => handleAction(() => approveDeletion('product', p.id), 'تم حذف المنتج بنجاح')} 
                                onReject={() => handleAction(() => rejectDeletion('product', p.id), 'تم رفض طلب حذف المنتج')}
                            />
                        ))}
                        {pendingDeletionProducts.length === 0 && <div className="col-span-full"><EmptyState message="لا توجد طلبات حذف منتجات معلقة حالياً" /></div>}
                    </div>
                )}

                {activeTab === 'orders_upd' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingUpdateOrders.map(o => (
                            <RequestCard 
                                key={o.id} 
                                id={o.id} 
                                isUpdate
                                title={`تعديل فاتورة: ${o.customerName}`} 
                                subtitle={getStoreNames([o.storeId])} 
                                reason={o.updateReason} 
                                linkTo={`/orders/${o.id}`}
                                onApprove={() => handleAction(() => approveOrderUpdate(o.id), 'تم اعتماد التعديلات على الفاتورة')} 
                                onReject={() => handleAction(() => rejectOrderUpdate(o.id), 'تم رفض التعديلات المطلوبة')}
                            />
                        ))}
                        {pendingUpdateOrders.length === 0 && <div className="col-span-full"><EmptyState message="لا توجد طلبات تعديل فواتير معلقة حالياً" /></div>}
                    </div>
                )}

                {activeTab === 'products_upd' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingUpdateProducts.map(p => (
                            <RequestCard 
                                key={p.id} 
                                id={p.id} 
                                isUpdate
                                title={`تعديل منتج: ${p.name}`} 
                                subtitle={getStoreNames([p.storeId])} 
                                reason={p.updateReason} 
                                linkTo={`/products/${p.id}`}
                                onApprove={() => handleAction(() => approveProductUpdate(p.id), 'تم اعتماد التعديلات على المنتج')} 
                                onReject={() => handleAction(() => rejectProductUpdate(p.id), 'تم رفض التعديلات على المنتج')}
                            />
                        ))}
                        {pendingUpdateProducts.length === 0 && <div className="col-span-full"><EmptyState message="لا توجد طلبات تعديل منتجات معلقة حالياً" /></div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeletionRequestsPage;
