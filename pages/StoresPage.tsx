
import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, Store, User } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

// Link Owner Modal
const LinkOwnerModal: React.FC<{
    store: Store;
    users: User[];
    onClose: () => void;
    onLink: (userId: number) => Promise<void>;
}> = ({ store, users, onClose, onLink }) => {
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [isSaving, setIsSaving] = useState(false);

    const filteredUsers = useMemo(() => users.filter(u => !u.isDeleted && u.isActive), [users]);

    const handleConfirm = async () => {
        if (!selectedUserId) return;
        setIsSaving(true);
        await onLink(Number(selectedUserId));
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up border dark:border-gray-700">
                <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2">ربط متجر بمالك جديد</h2>
                <p className="text-gray-500 text-xs mb-6 font-bold italic">متجر: {store.name}</p>
                
                <div className="mb-8">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">اختر المسؤول الجديد عن المتجر</label>
                    <select 
                        value={selectedUserId} 
                        onChange={e => setSelectedUserId(Number(e.target.value))}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="">-- اختر مستخدماً من القائمة --</option>
                        {filteredUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl">إلغاء</button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!selectedUserId || isSaving}
                        className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 disabled:bg-gray-300"
                    >
                        {isSaving ? 'جاري الربط...' : 'تأكيد الربط'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StoresPage: React.FC = () => {
    const { currentUser, stores, users, orders, products, approveStore, deleteStore, requestNewStore, updateStore, updateUser } = useAppContext();
    const { showToast } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [storeToLink, setStoreToLink] = useState<Store | null>(null);

    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);

    const activeStores = useMemo(() => {
        return stores.filter(store => {
            if (!store.isApproved) return false;
            if (!isAdmin && store.ownerId !== currentUser?.id) return false;
            
            const owner = users.find(u => String(u.id) === String(store.ownerId));
            const ownerName = owner ? owner.name.toLowerCase() : 'غير معروف';
            const storeName = store.name.toLowerCase();
            const search = searchTerm.toLowerCase();

            return storeName.includes(search) || ownerName.includes(search);
        });
    }, [stores, users, currentUser, isAdmin, searchTerm]);

    const handleLinkOwner = async (userId: number) => {
        if (!storeToLink) return;
        
        try {
            // 1. تحديث المتجر بالمالك الجديد
            await updateStore(storeToLink.id, { ownerId: userId });
            
            // 2. تحديث قائمة متاجر المستخدم
            const user = users.find(u => u.id === userId);
            if (user) {
                const currentStoreIds = user.storeIds || [];
                if (!currentStoreIds.includes(storeToLink.id)) {
                    await updateUser(userId, { storeIds: [...currentStoreIds, storeToLink.id] });
                }
            }
            
            setSuccessMessage('تم ربط المتجر بالمالك الجديد بنجاح.');
        } catch (e) {
            showToast('حدث خطأ أثناء الربط', 'error');
        }
    };

    const getStoreStats = (storeId: number) => {
        const storeOrders = orders.filter(o => o.storeId === storeId && !o.isDeleted);
        const storeProducts = products.filter(p => p.storeId === storeId && !p.isDeleted);
        const owner = users.find(u => String(u.id) === String(stores.find(s => s.id === storeId)?.ownerId));
        
        return {
            orderCount: storeOrders.length,
            productCount: storeProducts.length,
            ownerName: owner ? owner.name : null,
            ownerEmail: owner ? owner.email : null
        };
    };

    return (
        <div className="container mx-auto p-4 md:p-8 pb-20" dir="rtl">
            {storeToLink && <LinkOwnerModal store={storeToLink} users={users} onClose={() => setStoreToLink(null)} onLink={handleLinkOwner} />}

            {successMessage && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold animate-fade-in-up flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl text-yellow-600 dark:text-yellow-500">
                        <StoreIcon />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">المتاجر</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إدارة متاجرك والتحكم في ملكيتها</p>
                    </div>
                </div>
                
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="بحث عن متجر أو مالك..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <div className="absolute top-3.5 right-3 text-gray-400"><SearchIcon /></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Desktop View Table (Hidden on Mobile) */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-bold">اسم المتجر</th>
                                <th className="px-6 py-4 font-bold">المالك المسؤول</th>
                                <th className="px-6 py-4 font-bold text-center">المنتجات</th>
                                <th className="px-6 py-4 font-bold text-center">الطلبات</th>
                                <th className="px-8 py-4 text-left">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {activeStores.map(store => {
                                const stats = getStoreStats(store.id);
                                const hasNoOwner = !stats.ownerName;

                                return (
                                    <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900 dark:text-white text-base leading-none">{store.name}</div>
                                            <span className="text-[9px] text-gray-400 font-mono mt-1 block">ID: {store.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {hasNoOwner ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-[10px] inline-block border border-red-100 w-fit animate-pulse">⚠️ غير معروف / غير مرتبط</span>
                                                    {isAdmin && (
                                                        <button 
                                                            onClick={() => setStoreToLink(store)} 
                                                            className="text-blue-500 hover:underline text-[10px] font-black flex items-center gap-1"
                                                        >
                                                            <LinkIcon /> ربط بمالك الآن
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-gray-800 dark:text-gray-200 font-bold">{stats.ownerName}</div>
                                                    <div className="text-gray-400 text-xs font-mono">{stats.ownerEmail}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-black px-2.5 py-0.5 rounded-lg border border-blue-100">
                                                {stats.productCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-black px-2.5 py-0.5 rounded-lg border border-purple-100">
                                                {stats.orderCount}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-left">
                                            <button 
                                                onClick={() => navigate(`/stores/${store.id}`)}
                                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-xl text-xs font-black hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all shadow-sm"
                                            >
                                                عرض المتجر
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile & Tablet Card View (Hidden on Desktop) */}
                <div className="md:hidden p-4 space-y-5 bg-gray-50 dark:bg-gray-900/50">
                    {activeStores.map(store => {
                        const stats = getStoreStats(store.id);
                        const hasNoOwner = !stats.ownerName;

                        return (
                            <div key={store.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-xl border-2 border-gray-100 dark:border-gray-700 relative animate-fade-in-up">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="text-right">
                                        <h3 className="font-black text-gray-900 dark:text-white text-xl leading-tight">{store.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">ID: {store.id}</p>
                                    </div>
                                    <div className="text-left">
                                        {hasNoOwner ? (
                                            <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-1 rounded-lg border border-red-100">بدون مالك</span>
                                        ) : (
                                            <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-1 rounded-lg border border-green-100">مرتبط</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">المالك المسؤول</p>
                                        {hasNoOwner ? (
                                            <div className="flex flex-col gap-2">
                                                <p className="text-red-500 font-bold text-sm italic">غير مرتبط بمستخدم حالياً</p>
                                                {isAdmin && (
                                                    <button 
                                                        onClick={() => setStoreToLink(store)} 
                                                        className="w-full bg-blue-600 text-white py-2 rounded-xl font-black text-[10px] shadow-lg shadow-blue-500/20"
                                                    >
                                                        ربط بمالك الآن
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-black text-gray-800 dark:text-white text-sm">{stats.ownerName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{stats.ownerEmail}</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800 text-center">
                                            <p className="text-[9px] font-black text-blue-400 uppercase mb-1">المنتجات</p>
                                            <p className="text-xl font-black text-blue-700 dark:text-blue-300">{stats.productCount}</p>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-3xl border border-purple-100 dark:border-purple-800 text-center">
                                            <p className="text-[9px] font-black text-purple-400 uppercase mb-1">الطلبات</p>
                                            <p className="text-xl font-black text-purple-700 dark:text-purple-300">{stats.orderCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/stores/${store.id}`)}
                                    className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                >
                                    <StoreIcon />
                                    عرض تفاصيل المتجر
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {activeStores.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mt-6 animate-pulse">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner"><StoreIcon /></div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لا توجد متاجر مطابقة</h3>
                    <p className="text-gray-500 mt-2 font-medium">جرب تغيير معايير البحث أو إضافة متجر جديد.</p>
                </div>
            )}
        </div>
    );
};

export default StoresPage;
