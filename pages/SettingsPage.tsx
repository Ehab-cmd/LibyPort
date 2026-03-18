import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, Store, User, ShippingOrigin, ShoppingBrand, ExpenseCategory, CompanyInfo, TreasuryType } from '../types';
import { compressImage } from '../utils/imageHelper';

// Icons
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const PercentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const TrashIcon2 = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// Fix: Add missing icon components required in forms and tables
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L14.5 4.5M21 21l-4.35-4.35m1.35-5.65a9.96 9.96 0 00-1.558-3.03M12 5c4.478 0 8.268 2.943 9.542 7 0 .53-.057 1.05-.164 1.543" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

const StoreModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (name: string) => void; initialName?: string; title: string; }> = ({ isOpen, onClose, onSave, initialName = '', title }) => {
    const [name, setName] = useState(initialName);
    useEffect(() => { if (isOpen) { setName(initialName); } }, [initialName, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) { onSave(name); onClose(); } };
    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl"> <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md"> <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2> <form onSubmit={handleSubmit}> <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="اسم المتجر" required /> <div className="flex justify-end gap-3"> <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">إلغاء</button> <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600">حفظ</button> </div> </form> </div> </div> );
};

const DeleteStoreConfirmationModal: React.FC<{ storeName: string; onClose: () => void; onConfirm: () => void }> = ({ storeName, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl"> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full"> <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">تأكيد الحذف</h3> <p className="text-gray-600 dark:text-gray-300 mb-6">هل أنت متأكد من حذف المتجر "{storeName}"؟</p> <div className="flex justify-end gap-3"> <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">إلغاء</button> <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">حفظ</button> </div> </div> </div>
);

const ConfirmModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    message: string;
    confirmText?: string;
    cancelText?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'نعم', cancelText = 'لا' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
                <h2 className="text-xl font-black mb-4 text-gray-800 dark:text-gray-100">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-bold">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 transition-all">{cancelText}</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 bg-yellow-500 text-white px-4 py-3 rounded-xl font-black hover:bg-yellow-600 shadow-lg transition-all">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const OriginModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (origin: ShippingOrigin) => void; initialData?: ShippingOrigin; }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState(''); const [rate, setRate] = useState(''); const [time, setTime] = useState(''); const [isActive, setIsActive] = useState(true);
    useEffect(() => { if (isOpen) { if (initialData) { setName(initialData.name); setRate(String(initialData.ratePerKgUSD)); setTime(initialData.estimatedDeliveryTime || ''); setIsActive(initialData.isActive); } else { setName(''); setRate(''); setTime(''); setIsActive(true); } } }, [isOpen, initialData?.id]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name && rate !== '') { onSave({ id: initialData ? initialData.id : String(Date.now()), name, ratePerKgUSD: parseFloat(rate) || 0, estimatedDeliveryTime: time || '10-15 يوم', isActive }); onClose(); } };
    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" dir="rtl"> <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md"> <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{initialData ? 'تعديل بلد شحن' : 'إضافة بلد شحن'}</h2> <form onSubmit={handleSubmit} className="space-y-4"> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الدولة</label> <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /> </div> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سعر الشحن للكيلو ($)</label> <input type="number" step="any" value={rate} onChange={e => setRate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /> </div> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وقت التوصيل التقديري</label> <input type="text" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="مثال: 10-15 يوم" /> </div> <div className="flex items-center gap-2"> <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-yellow-600 focus:ring-yellow-500" /> <label className="text-sm text-gray-700 dark:text-gray-300">مفعل (يظهر في الحاسبة)</label> </div> <div className="flex justify-end gap-3 mt-4"> <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">إلغاء</button> <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600">حفظ</button> </div> </form> </div> </div> );
};

const BrandModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (brand: ShoppingBrand) => void; initialData?: ShoppingBrand; }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState(''); const [cost, setCost] = useState(''); const [isActive, setIsActive] = useState(true);
    useEffect(() => { if (isOpen) { if (initialData) { setName(initialData.name); setCost(String(initialData.defaultInternalShippingCost)); setIsActive(initialData.isActive); } else { setName(''); setCost(''); setIsActive(true); } } }, [isOpen, initialData?.id]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name) { onSave({ id: initialData ? initialData.id : String(Date.now()), name, defaultInternalShippingCost: parseFloat(cost) || 0, isActive }); onClose(); } };
    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" dir="rtl"> <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md"> <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{initialData ? 'تعديل مصدر/ماركة' : 'إضافة مصدر/ماركة'}</h2> <form onSubmit={handleSubmit} className="space-y-4"> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الموقع/الماركة</label> <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /> </div> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تكلفة الشحن الداخلي الافتراضية ($)</label> <input type="number" step="any" value={cost} onChange={e => setCost(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /> <p className="text-xs text-gray-500 mt-1">تضاف تلقائياً عند اختيار هذا المصدر في الحاسبة.</p> </div> <div className="flex items-center gap-2"> <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-yellow-600 focus:ring-yellow-500" /> <label className="text-sm text-gray-700 dark:text-gray-300">مفعل</label> </div> <div className="flex justify-end gap-3 mt-4"> <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">إلغاء</button> <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600">حفظ</button> </div> </form> </div> </div> );
};

import { useNotification } from '../context/NotificationContext';

const UserProfileSettings: React.FC = () => {
    const { currentUser, updateUser, stores, requestNewStore, updateStore, deleteStore } = useAppContext();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({ name: currentUser?.name || '', phone: currentUser?.phone || '', city: currentUser?.city || '', address: currentUser?.address || '', password: currentUser?.password || '', });
    const [profilePic, setProfilePic] = useState<string | undefined>(currentUser?.profilePicture || undefined);
    const [isSaving, setIsSaving] = useState(false); const [showPassword, setShowPassword] = useState(false);
    const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false); const [storeToEdit, setStoreToEdit] = useState<Store | null>(null); const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const userStores = stores.filter(s => currentUser?.storeIds.includes(s.id));
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { try { const compressed = await compressImage(file); setProfilePic(compressed); } catch (error) { console.error("Failed to compress image", error); showToast("حدث خطأ أثناء معالجة الصورة", "error"); } } };
    const handleSave = async () => { if (!currentUser) return; setIsSaving(true); try { await updateUser(currentUser.id, { ...formData, profilePicture: profilePic }); showToast('تم تحديث الملف الشخصي بنجاح!', 'success'); } catch (error) { console.error("Error updating profile", error); showToast('حدث خطأ أثناء تحديث الملف الشخصي.', 'error'); } finally { setIsSaving(false); } };
    const handleAddStore = async (name: string) => { await requestNewStore(name); setIsAddStoreModalOpen(false); };
    const handleEditStore = async (name: string) => { if (storeToEdit) { await updateStore(storeToEdit.id, { name }); setStoreToEdit(null); } };
    const handleDeleteStore = async () => { if (storeToDelete) { await deleteStore(storeToDelete.id); setStoreToDelete(null); } };
    
    return ( 
        <div className="space-y-6 md:space-y-8"> 
            <StoreModal isOpen={isAddStoreModalOpen} onClose={() => setIsAddStoreModalOpen(false)} onSave={handleAddStore} title="إضافة متجر جديد" /> 
            {storeToEdit && ( <StoreModal isOpen={!!storeToEdit} onClose={() => setStoreToEdit(null)} onSave={handleEditStore} initialName={storeToEdit.name} title="تعديل اسم المتجر" /> )} 
            {storeToDelete && ( <DeleteStoreConfirmationModal storeName={storeToDelete.name} onClose={() => setStoreToDelete(null)} onConfirm={handleDeleteStore} /> )} 
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-8"> 
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-2 md:gap-3"> 
                        <div className="p-1.5 md:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-500"> <UserIcon /> </div> 
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">الملف الشخصي</h2> 
                    </div> 
                    {currentUser?.contractUrl && (
                        <a 
                            href={currentUser.contractUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 md:gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold border border-blue-100 dark:border-blue-800 text-[10px] md:text-sm hover:scale-105 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            عرض العقد
                        </a>
                    )}
                </div>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8"> 
                    <div className="md:w-1/3 flex flex-col items-center"> 
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-300 flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors group bg-gray-50 dark:bg-gray-700 overflow-hidden" onClick={() => fileInputRef.current?.click()} >
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-3xl md:text-4xl text-gray-300 dark:text-gray-500 font-bold">
                                    {formData.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
                                <span className="text-white text-[10px] md:text-xs font-bold opacity-0 group-hover:opacity-100">تغيير الصورة</span>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleProfilePicUpload} accept="image/*" className="hidden" />
                        </div>
                        <p className="mt-3 md:mt-4 text-[10px] md:text-sm text-gray-500 dark:text-gray-400">انقر لتغيير الصورة</p>
                    </div>
                    <div className="md:w-2/3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                                <input type="email" value={currentUser?.email || ''} disabled className="w-full p-2.5 md:p-3 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl text-gray-500 dark:text-gray-300 cursor-not-allowed text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:text-white text-sm" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-2.5 md:top-3 left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">المدينة</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:text-white text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:text-white resize-none text-sm" ></textarea>
                        </div>
                        <div className="flex justify-end pt-2 md:pt-4">
                            <button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto bg-yellow-500 text-white px-8 py-2.5 md:py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/30 hover:bg-yellow-600 hover:-translate-y-1 transition-all disabled:opacity-50 text-sm" >
                                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-8">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-500">
                            <StoreIcon />
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">إدارة متاجري</h2>
                    </div>
                    <button onClick={() => setIsAddStoreModalOpen(true)} className="bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm" >
                        <PlusIcon /> إضافة متجر
                    </button>
                </div>
                <div className="overflow-hidden rounded-xl border dark:border-gray-700">
                    <table className="w-full text-sm text-right hidden md:table"><thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"><tr><th className="px-6 py-4">اسم المتجر</th><th className="px-6 py-4">الحالة</th><th className="px-6 py-4 text-center">إجراءات</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{userStores.map(store => (
                                <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">{store.name}</td>
                                    <td className="px-6 py-4">
                                        {store.isApproved ? (
                                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">معتمد</span>
                                        ) : (
                                            <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold">بانتظار الموافقة</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-3">
                                        <button onClick={() => setStoreToEdit(store)} className="text-blue-500 hover:text-blue-700 p-1" title="تعديل الاسم">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => setStoreToDelete(store)} className="text-red-500 hover:text-red-700 p-1" title="حذف المتجر">
                                            <TrashIcon2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {userStores.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        لا توجد متاجر مضافة حالياً.
                                    </td>
                                </tr>
                            )}</tbody></table>
                    <div className="md:hidden space-y-3 p-3">
                        {userStores.map(store => (
                            <div key={store.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm dark:text-white">{store.name}</p>
                                    <p className="text-[10px] mt-0.5">
                                        {store.isApproved ? (
                                            <span className="text-green-600 font-bold">معتمد</span>
                                        ) : (
                                            <span className="text-yellow-600 font-bold">قيد الموافقة</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => setStoreToEdit(store)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-blue-500 shadow-sm"><EditIcon /></button>
                                    <button onClick={() => setStoreToDelete(store)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-red-500 shadow-sm"><TrashIcon2 /></button>
                                </div>
                            </div>
                        ))}
                        {userStores.length === 0 && <p className="text-center py-4 text-gray-400 text-xs">لا توجد متاجر.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CompanyProfileForm: React.FC = () => {
    const { companyInfo, updateCompanyInfo } = useAppContext();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState<CompanyInfo>(companyInfo);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setFormData(prev => ({ ...prev, logoUrl: compressed }));
            } catch (error) {
                console.error("Failed to process logo", error);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateCompanyInfo(formData);
        setIsSaving(false);
        showToast('تم حفظ بيانات الشركة بنجاح.', 'success');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            
            <div className="p-4 md:p-8">
                <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                    <div className="p-1.5 md:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-500">
                        <HomeIcon />
                    </div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">بيانات المؤسسة</h2>
                </div>

                <div className="mb-6 md:mb-10 flex justify-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors group bg-gray-50 dark:bg-gray-700 overflow-hidden" onClick={() => fileInputRef.current?.click()} >
                        {formData.logoUrl ? ( <img src={formData.logoUrl} alt="Company Logo" className="w-full h-full object-cover" /> ) : ( <div className="text-center p-2"> <span className="text-3xl md:text-4xl text-gray-300 group-hover:text-yellow-500 block mb-1">+</span> </div> )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all"> <span className="text-white text-[10px] md:text-xs font-bold opacity-0 group-hover:opacity-100">تغيير الشعار</span> </div>
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300">اسم الشركة</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:border-yellow-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all shadow-sm focus:ring-0 text-gray-800 dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300">التخصص / النشاط</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:border-yellow-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all shadow-sm focus:ring-0 text-gray-800 dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                        <label className="text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300">العنوان</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:border-yellow-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all shadow-sm focus:ring-0 text-gray-800 dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:border-yellow-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all shadow-sm focus:ring-0 text-gray-800 dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300">رقم الهاتف</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:border-yellow-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all shadow-sm focus:ring-0 text-gray-800 dark:text-white text-sm" />
                    </div>
                    
                    <div className="space-y-1.5 md:space-y-2 md:col-span-2 border-t pt-4 mt-2">
                        <label className="text-[10px] md:text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <CogIcon /> اسم المطور / الشركة البرمجية (للحقوق)
                        </label>
                        <input 
                            type="text" 
                            name="developerName" 
                            value={formData.developerName || ''} 
                            onChange={handleChange} 
                            placeholder="اكتب اسمك هنا ليظهر في تذييل النظام..."
                            className="w-full p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all shadow-sm focus:ring-0 text-gray-800 dark:text-white font-bold text-sm" 
                        />
                    </div>
                </div>

                <div className="mt-8 md:mt-10 pt-6 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto bg-yellow-500 text-white px-8 py-2.5 md:py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/30 hover:bg-yellow-600 hover:-translate-y-1 transition-all disabled:opacity-50 text-sm" > {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'} </button>
                </div>
            </div>
        </div>
    );
};

const MaintenanceSection: React.FC = () => {
    const { syncAllOrdersWithMasterData, fixInvoiceIds, resequence2026Invoices, fixAllProductsStock, resetData, wipeProducts } = useAppContext();
    const { showToast, showConfirm } = useNotification();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isFixingIds, setIsFixingIds] = useState(false);
    const [isResequencing, setIsResequencing] = useState(false);
    const [isFixingStock, setIsFixingStock] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleSync = async () => {
        const confirmed = await showConfirm(
            'تأكيد المزامنة الشاملة',
            'سيتم تحديث كافة بيانات الأصناف في جميع الفواتير لتطابق البيانات الحالية في المخزن. هل أنت متأكد؟'
        );
        if (!confirmed) return;
        setIsSyncing(true);
        const res = await syncAllOrdersWithMasterData();
        setIsSyncing(false);
        setResult(res.message);
        setTimeout(() => setResult(null), 5000);
    };

    const handleFixAllProductsStock = async () => {
        const confirmed = await showConfirm(
            'تصحيح المخزون',
            'سيتم إعادة حساب إجمالي المخزون لكل المنتجات بناءً على المقاسات المتوفرة. هل تريد الاستمرار؟'
        );
        if (!confirmed) return;
        setIsFixingStock(true);
        const res = await fixAllProductsStock();
        setIsFixingStock(false);
        setResult(res.message);
        setTimeout(() => setResult(null), 10000);
    };

    const handleFixInvoiceIds = async () => {
        setIsFixingIds(true);
        const res = await fixInvoiceIds();
        setIsFixingIds(false);
        setResult(res.message);
        setTimeout(() => setResult(null), 10000);
    };

    const handleResequence = async () => {
        const confirmed = await showConfirm(
            'تحذير: إعادة التسلسل',
            'تحذير: سيتم إعادة تسلسل كافة فواتير 2026 من LP26-0001 بشكل زمني. سيتم أيضاً تحديث كافة المعاملات المالية المرتبطة بها. هل تريد الاستمرار؟'
        );
        if (!confirmed) return;
        setIsResequencing(true);
        const res = await resequence2026Invoices();
        setIsResequencing(false);
        setResult(res.message);
        setTimeout(() => setResult(null), 15000);
    };

    const handleClearCache = async () => {
        const confirmed = await showConfirm(
            'مسح التخزين المؤقت',
            'سيتم مسح كافة البيانات المخزنة مؤقتاً في المتصفح وإعادة تحميل الصفحة. هل تريد الاستمرار؟'
        );
        if (confirmed) {
            resetData();
        }
    };

    const handleWipeProducts = async () => {
        const confirmed = await showConfirm(
            'تحذير: مسح كافة المنتجات',
            'هل أنت متأكد من رغبتك في مسح كافة المنتجات من قاعدة البيانات؟ هذا الإجراء لا يمكن التراجع عنه.'
        );
        if (confirmed) {
            await wipeProducts();
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-8 animate-fade-in-up">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                    <RefreshIcon /> صيانة البيانات والمزامنة
                </h3>
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 md:p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-[10px] md:text-sm mb-2">مزامنة الفواتير مع المخزن</h4>
                        <button 
                            onClick={handleSync} 
                            disabled={isSyncing}
                            className="w-full md:w-auto bg-blue-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 text-[10px] md:text-sm"
                        >
                            {isSyncing ? 'جاري المزامنة...' : 'بدء المزامنة الشاملة'}
                        </button>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 md:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-[10px] md:text-sm mb-2">تصحيح مخزون المنتجات</h4>
                        <button 
                            onClick={handleFixAllProductsStock} 
                            disabled={isFixingStock}
                            className="w-full md:w-auto bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 text-[10px] md:text-sm"
                        >
                            {isFixingStock ? 'جاري التصحيح...' : 'تصحيح مخزون كافة المنتجات'}
                        </button>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-3 md:p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                        <h4 className="font-bold text-purple-800 dark:text-purple-300 text-[10px] md:text-sm mb-2">مسح التخزين المؤقت (Cache)</h4>
                        <button 
                            onClick={handleClearCache} 
                            className="w-full md:w-auto bg-purple-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-purple-700 shadow-md transition-all flex items-center justify-center gap-2 text-[10px] md:text-sm"
                        >
                            <RefreshIcon /> مسح التخزين المؤقت وإعادة التحميل
                        </button>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-3 md:p-4 rounded-2xl border border-red-100 dark:border-red-800">
                        <h4 className="font-bold text-red-800 dark:text-red-300 text-[10px] md:text-sm mb-2">مسح كافة المنتجات (Wipe Products)</h4>
                        <button 
                            onClick={handleWipeProducts} 
                            className="w-full md:w-auto bg-red-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2 text-[10px] md:text-sm"
                        >
                            مسح كافة المنتجات من قاعدة البيانات
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-8 animate-fade-in-up">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700 flex items-center gap-2 text-yellow-600">
                    <AlertIcon /> أدوات النظام المتقدمة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 md:p-4 rounded-2xl border border-yellow-100 dark:border-yellow-800">
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-300 text-[10px] md:text-sm mb-2">أداة فحص تسلسل الفواتير</h4>
                        <button 
                            onClick={handleFixInvoiceIds} 
                            disabled={isFixingIds}
                            className="w-full md:w-auto bg-yellow-500 text-gray-900 px-4 md:px-6 py-2 rounded-xl font-black hover:bg-yellow-600 shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 text-[10px] md:text-sm"
                        >
                            {isFixingIds ? 'جاري الفحص...' : 'فحص التسلسل'}
                        </button>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-3 md:p-4 rounded-2xl border border-red-100 dark:border-red-800">
                        <h4 className="font-bold text-red-800 dark:text-red-300 text-[10px] md:text-sm mb-2">إعادة تسلسل 2026 بالكامل</h4>
                        <button 
                            onClick={handleResequence} 
                            disabled={isResequencing}
                            className="w-full md:w-auto bg-red-600 text-white px-4 md:px-6 py-2 rounded-xl font-black hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 text-[10px] md:text-sm"
                        >
                            {isResequencing ? 'جاري التعديل...' : 'بدء إعادة التسلسل'}
                        </button>
                    </div>
                </div>
                {result && (
                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-900 text-yellow-400 rounded-2xl border-2 border-yellow-500 font-bold animate-pulse text-[10px] md:text-sm">
                        <p className="flex items-center gap-2"><InfoIcon /> تقرير النظام:</p>
                        <p className="mt-2 text-white">{result}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const GeneralConfigSection: React.FC = () => {
    const { systemSettings, updateSystemSettings, exchangeRate, updateExchangeRate } = useAppContext(); 
    const [vipFee, setVipFee] = useState(String(systemSettings.vipSubscriptionFee)); 
    const [commission, setCommission] = useState(String(systemSettings.purchaseCommissionPercentage));
    const [currentRate, setCurrentRate] = useState(String(exchangeRate));
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setVipFee(String(systemSettings.vipSubscriptionFee));
        setCommission(String(systemSettings.purchaseCommissionPercentage));
        setCurrentRate(String(exchangeRate));
    }, [systemSettings, exchangeRate]);

    const handleSave = () => { 
        const newRate = Number(currentRate);
        updateSystemSettings({ 
            vipSubscriptionFee: Number(vipFee), 
            purchaseCommissionPercentage: Number(commission)
        }); 
        updateExchangeRate(newRate);
        setShowSuccess(true);
    };

    return ( 
        <div className="animate-fade-in-up space-y-6 md:space-y-8"> 
            {showSuccess && <div className="bg-green-100 text-green-700 p-3 md:p-4 rounded-2xl mb-4 font-bold text-[10px] md:text-sm">تم حفظ الإعدادات بنجاح.</div>}
            
            <div className="animate-fade-in-up">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                    <PercentIcon /> إعدادات العمولات والاشتراكات
                </h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"> 
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-600"> 
                        <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">قيمة اشتراك VIP الشهري (د.ل)</label> 
                        <input type="number" value={vipFee} onChange={e => setVipFee(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" /> 
                    </div> 
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-600"> 
                        <label className="block text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نسبة عمولة الشراء (%)</label> 
                        <input type="number" value={commission} onChange={e => setCommission(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" /> 
                    </div> 
                </div> 
            </div>

            <div className="animate-fade-in-up">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                    <RefreshIcon /> إعدادات سعر الصرف الحالي
                </h3> 
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 md:p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800"> 
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] md:text-sm font-black text-yellow-800 dark:text-yellow-400 mb-2">سعر صرف الدولار الحالي مقابل الدينار</label> 
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="text-xl md:text-2xl font-black text-gray-400">$1 = </span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={currentRate} 
                                    onChange={e => setCurrentRate(e.target.value)} 
                                    className="w-32 md:w-48 p-2 md:p-4 bg-white dark:bg-gray-800 border-2 border-yellow-500 rounded-2xl font-black text-xl md:text-3xl text-center focus:ring-4 focus:ring-yellow-500/20" 
                                />
                                <span className="text-lg md:text-xl font-bold text-gray-400">د.ل</span>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700"> 
                <button onClick={handleSave} className="w-full md:w-auto bg-yellow-500 text-white px-10 py-2.5 md:py-3 rounded-xl font-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-600 transition-all text-[10px] md:text-sm">حفظ الإعدادات</button> 
            </div> 
        </div> 
    );
};

const OriginsManagementSection: React.FC = () => {
    const { shippingOrigins, addShippingOrigin, updateShippingOrigin, deleteShippingOrigin } = useAppContext();
    const { showConfirm } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrigin, setEditingOrigin] = useState<ShippingOrigin | undefined>(undefined);

    const handleEdit = (origin: ShippingOrigin) => {
        setEditingOrigin(origin);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingOrigin(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('تأكيد الحذف', 'هل أنت متأكد من حذف بلد الشحن هذا؟');
        if (confirmed) {
            await deleteShippingOrigin(id);
        }
    };

    const handleSave = async (origin: ShippingOrigin) => {
        if (editingOrigin) {
            await updateShippingOrigin(origin.id, origin);
        } else {
            await addShippingOrigin(origin);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <OriginModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingOrigin(undefined);}} onSave={handleSave} initialData={editingOrigin} />
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">إدارة دول الشحن</h3>
                <button onClick={handleAdd} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-bold hover:bg-blue-700 flex items-center gap-1">
                    <PlusIcon /> إضافة دولة
                </button>
            </div>
            <div className="overflow-hidden rounded-xl border dark:border-gray-700">
                <table className="w-full text-sm text-right hidden md:table">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3">الدولة</th>
                            <th className="px-4 py-3">السعر / كجم ($)</th>
                            <th className="px-4 py-3">وقت التوصيل</th>
                            <th className="px-4 py-3">الحالة</th>
                            <th className="px-4 py-3 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {shippingOrigins.map(origin => (
                            <tr key={`origin-row-${origin.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{origin.name}</td>
                                <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{origin.ratePerKgUSD} $</td>
                                <td className="px-4 py-3">{origin.estimatedDeliveryTime}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${origin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {origin.isActive ? 'مفعل' : 'موقف'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                    <button onClick={() => handleEdit(origin)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button>
                                    <button onClick={() => handleDelete(origin.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="md:hidden space-y-3 p-3">
                    {shippingOrigins.map(origin => (
                        <div key={`origin-card-${origin.id}`} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border dark:border-gray-700 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-sm dark:text-white">{origin.name}</p>
                                    <p className="text-[10px] text-gray-500">{origin.estimatedDeliveryTime}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${origin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {origin.isActive ? 'مفعل' : 'موقف'}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="font-bold text-blue-600 text-sm">{origin.ratePerKgUSD} $/كجم</p>
                                <div className="flex gap-1.5">
                                    <button onClick={() => handleEdit(origin)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-blue-500 shadow-sm"><EditIcon /></button>
                                    <button onClick={() => handleDelete(origin.id)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-red-500 shadow-sm"><TrashIcon2 /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BrandsManagementSection: React.FC = () => {
    const { shoppingBrands, addShoppingBrand, updateShoppingBrand, deleteShoppingBrand } = useAppContext();
    const { showConfirm } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<ShoppingBrand | undefined>(undefined);

    const handleEdit = (brand: ShoppingBrand) => {
        setEditingBrand(brand);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingBrand(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('تأكيد الحذف', 'هل أنت متأكد من حذف هذا المصدر؟');
        if (confirmed) {
            await deleteShoppingBrand(id);
        }
    };

    const handleSave = async (brand: ShoppingBrand) => {
        if (editingBrand) {
            await updateShoppingBrand(brand.id, brand);
        } else {
            await addShoppingBrand(brand);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <BrandModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingBrand(undefined);}} onSave={handleSave} initialData={editingBrand} />
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">إدارة مصادر الشراء</h3>
                <button onClick={handleAdd} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-bold hover:bg-purple-700 flex items-center gap-1">
                    <PlusIcon /> إضافة مصدر
                </button>
            </div>
            <div className="overflow-hidden rounded-xl border dark:border-gray-700">
                <table className="w-full text-sm text-right hidden md:table">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3">المصدر</th>
                            <th className="px-4 py-3">شحن داخلي ($)</th>
                            <th className="px-4 py-3">الحالة</th>
                            <th className="px-4 py-3 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {shoppingBrands.map(brand => (
                            <tr key={`brand-row-${brand.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{brand.name}</td>
                                <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">{brand.defaultInternalShippingCost} $</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {brand.isActive ? 'مفعل' : 'موقف'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                    <button onClick={() => handleEdit(brand)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button>
                                    <button onClick={() => handleDelete(brand.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="md:hidden space-y-3 p-3">
                    {shoppingBrands.map(brand => (
                        <div key={`brand-card-${brand.id}`} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm dark:text-white">{brand.name}</p>
                                <p className="text-[10px] text-purple-600 font-bold">شحن داخلي: {brand.defaultInternalShippingCost} $</p>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => handleEdit(brand)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-blue-500 shadow-sm"><EditIcon /></button>
                                <button onClick={() => handleDelete(brand.id)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-red-500 shadow-sm"><TrashIcon2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BankAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (bank: any) => void; initialData?: any; }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setBankName(initialData.bankName);
                setAccountNumber(initialData.accountNumber);
            } else {
                setBankName('');
                setAccountNumber('');
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (bankName && accountNumber) {
            onSave({
                id: initialData ? initialData.id : Date.now(),
                bankName,
                accountNumber
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{initialData ? 'تعديل حساب مصرفي' : 'إضافة حساب مصرفي جديد'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المصرف</label>
                        <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الحساب / IBAN</label>
                        <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">إلغاء</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BankAccountsManagementSection: React.FC = () => {
    const { bankAccounts, addBankAccount, deleteBankAccount } = useAppContext();
    const { showConfirm } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAdd = () => {
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('تأكيد الحذف', 'هل أنت متأكد من حذف هذا الحساب المصرفي؟');
        if (confirmed) {
            await deleteBankAccount(id);
        }
    };

    const handleSave = async (bank: any) => {
        await addBankAccount(bank.bankName, bank.accountNumber);
    };

    return (
        <div className="animate-fade-in-up">
            <BankAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">إدارة الحسابات المصرفية</h3>
                <button onClick={handleAdd} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-bold hover:bg-blue-700 flex items-center gap-1">
                    <PlusIcon /> إضافة حساب
                </button>
            </div>
            <div className="overflow-hidden rounded-xl border dark:border-gray-700">
                <table className="w-full text-sm text-right hidden md:table">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3">اسم المصرف</th>
                            <th className="px-4 py-3">رقم الحساب</th>
                            <th className="px-4 py-3 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {bankAccounts.map(b => (
                            <tr key={`bank-row-${b.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.bankName}</td>
                                <td className="px-4 py-3 font-mono">{b.accountNumber}</td>
                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                    <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon2 /></button>
                                </td>
                            </tr>
                        ))}
                        {bankAccounts.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">لا توجد حسابات مصرفية مضافة.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TreasuryModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (treasury: any) => void; initialData?: any; }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<string>(TreasuryType.Cash);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setType(initialData.type);
                setIsActive(initialData.isActive);
            } else {
                setName('');
                setType(TreasuryType.Cash);
                setIsActive(true);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onSave({
                id: initialData ? initialData.id : String(Date.now()),
                name,
                type,
                isActive
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{initialData ? 'تعديل خزينة' : 'إضافة خزينة جديدة'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الخزينة</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الخزينة</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value={TreasuryType.Cash}>كاش (نقدي)</option>
                            <option value={TreasuryType.Bank}>مصرفي</option>
                            <option value={TreasuryType.POS}>خزينة البطاقات (POS)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-yellow-600 focus:ring-yellow-500" />
                        <label className="text-sm text-gray-700 dark:text-gray-300">نشطة (تظهر في خيارات التحصيل)</label>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">إلغاء</button>
                        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TreasuriesManagementSection: React.FC = () => {
    const { treasuries, addTreasury, updateTreasury, deleteTreasury, users, bankAccounts } = useAppContext();
    const { showToast, showConfirm } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTreasury, setEditingTreasury] = useState<any>(undefined);

    const admins = users.filter(u => u.role === UserRole.Admin || u.role === UserRole.SuperAdmin);

    const handleEdit = (treasury: any) => {
        setEditingTreasury(treasury);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingTreasury(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('هل أنت متأكد من حذف هذه الخزينة؟', 'تأكيد الحذف');
        if (confirmed) await deleteTreasury(id);
    };

    const handleSave = async (treasury: any) => {
        if (editingTreasury) {
            await updateTreasury(treasury.id, treasury);
        } else {
            await addTreasury(treasury);
        }
    };

    const handleSyncEmployees = async () => {
        const confirmed = await showConfirm('هل تريد إضافة الموظفين الإداريين كخزائن نقدية تلقائياً؟', 'تأكيد المزامنة');
        if (confirmed) {
            for (const admin of admins) {
                const exists = treasuries.find(t => t.name === admin.name || t.userId === admin.id);
                if (!exists) {
                    await addTreasury({
                        name: admin.name,
                        type: TreasuryType.Cash,
                        isActive: true,
                        userId: admin.id
                    });
                }
            }
            showToast('تمت مزامنة الموظفين بنجاح.', 'success');
        }
    };

    const handleSyncBanks = async () => {
        const confirmed = await showConfirm('هل تريد إضافة الحسابات المصرفية المسجلة كخزائن مصرفية تلقائياً؟', 'تأكيد المزامنة');
        if (confirmed) {
            for (const bank of bankAccounts) {
                const exists = treasuries.find(t => t.name === bank.bankName || t.id === String(bank.id));
                if (!exists) {
                    await addTreasury({
                        name: bank.bankName,
                        type: TreasuryType.Bank,
                        isActive: true,
                        bankId: bank.id
                    });
                }
            }
            showToast('تمت مزامنة المصارف بنجاح.', 'success');
        }
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <TreasuryModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingTreasury(undefined);}} onSave={handleSave} initialData={editingTreasury} />
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">إدارة الخزائن النقدية والعهد</h3>
                    <div className="flex gap-2">
                        <button onClick={handleSyncEmployees} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-bold hover:bg-gray-200 flex items-center gap-1">
                            <RefreshIcon /> مزامنة الموظفين
                        </button>
                        <button onClick={handleSyncBanks} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-bold hover:bg-gray-200 flex items-center gap-1">
                            <RefreshIcon /> مزامنة المصارف
                        </button>
                        <button onClick={handleAdd} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] md:text-sm font-bold hover:bg-green-700 flex items-center gap-1">
                            <PlusIcon /> إضافة خزينة
                        </button>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border dark:border-gray-700">
                    <table className="w-full text-sm text-right hidden md:table">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">النوع</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {treasuries.map(t => (
                                <tr key={`tr-row-${t.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.name}</td>
                                    <td className="px-4 py-3">{t.type === TreasuryType.Cash ? 'نقدي' : t.type === TreasuryType.Bank ? 'مصرفي' : 'خزنة'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {t.isActive ? 'مفعل' : 'موقف'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                                        <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button>
                                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon2 /></button>
                                    </td>
                                </tr>
                            ))}
                            {treasuries.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">لا توجد خزائن مضافة. اضغط على "مزامنة الموظفين" لاستيراد العهد الحالية.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BankAccountsManagementSection />
        </div>
    );
};

const AdminSystemManagement: React.FC = () => {
    const { stores, users, approveStore, deleteStore } = useAppContext(); 
    const { showToast, showConfirm } = useNotification();
    const [activeTab, setActiveTab] = useState<'brands' | 'general' | 'origins' | 'maintenance' | 'treasuries'>('brands'); 
    const [actionLoading, setActionLoading] = useState(false);
    
    const handleApprove = async (storeId: number) => { 
        const confirmed = await showConfirm('هل أنت متأكد من الموافقة على هذا المتجر؟', 'تأكيد الموافقة');
        if (confirmed) {
            try {
                setActionLoading(true); 
                await approveStore(storeId); 
                showToast('تمت الموافقة على المتجر بنجاح', 'success');
            } catch (error) {
                console.error(error);
                showToast('حدث خطأ أثناء تنفيذ الطلب.', 'error');
            } finally {
                setActionLoading(false); 
            }
        }
    };
    
    const handleDelete = async (storeId: number) => { 
        const confirmed = await showConfirm('هل أنت متأكد من حذف هذا المتجر؟', 'تأكيد الحذف');
        if (confirmed) {
            try {
                setActionLoading(true); 
                await deleteStore(storeId); 
                showToast('تم حذف المتجر بنجاح', 'success');
            } catch (error) {
                console.error(error);
                showToast('حدث خطأ أثناء تنفيذ الطلب.', 'error');
            } finally {
                setActionLoading(false); 
            }
        }
    };
    
    return (
        <div className="space-y-6 md:space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-500">
                        <CogIcon />
                    </div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">إدارة النظام</h2>
                </div>
                <div className="flex mb-4 md:mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveTab('brands')} className={`flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'brands' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} > <span className="flex items-center justify-center gap-1"><ShoppingBagIcon /> المواقع</span> </button>
                    <button onClick={() => setActiveTab('treasuries')} className={`flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'treasuries' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} > <span className="flex items-center justify-center gap-1"><HomeIcon /> الخزائن</span> </button>
                    <button onClick={() => setActiveTab('general')} className={`flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-white dark:bg-gray-600 text-green-600 shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} > <span className="flex items-center justify-center gap-1"><PercentIcon /> العمولات</span> </button>
                    <button onClick={() => setActiveTab('origins')} className={`flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'origins' ? 'bg-white dark:bg-gray-600 text-yellow-600 shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} > <span className="flex items-center justify-center gap-1"><GlobeIcon /> الدول</span> </button>
                    <button onClick={() => setActiveTab('maintenance')} className={`flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'maintenance' ? 'bg-white dark:bg-gray-600 text-red-600 shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} > <span className="flex items-center justify-center gap-1"><RefreshIcon /> صيانة</span> </button>
                </div>
                <div className="min-h-[250px] md:min-h-[300px]">
                    {activeTab === 'general' && <GeneralConfigSection />}
                    {activeTab === 'origins' && <OriginsManagementSection />}
                    {activeTab === 'brands' && <BrandsManagementSection />}
                    {activeTab === 'maintenance' && <MaintenanceSection />}
                    {activeTab === 'treasuries' && <TreasuriesManagementSection />}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-8">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-500">
                        <StoreIcon />
                    </div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">اعتماد المتاجر</h2>
                </div>
                <div className="overflow-hidden rounded-xl border dark:border-gray-700">
                    <table className="w-full text-sm text-right hidden md:table">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-4 py-3">المتجر</th>
                                <th className="px-4 py-3">المالك</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stores.map(store => {
                                const owner = users.find(u => u.id === store.ownerId);
                                return (
                                    <tr key={`store-row-${store.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{store.name}</td>
                                        <td className="px-4 py-3">{owner?.name || 'غير معروف'}</td>
                                        <td className="px-4 py-3">
                                            {store.isApproved ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">معتمد</span>
                                            ) : (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">قيد الانتظار</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                                            {!store.isApproved && (
                                                <button onClick={() => handleApprove(store.id)} disabled={actionLoading} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50">
                                                    {actionLoading ? 'جاري...' : 'موافقة'}
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(store.id)} disabled={actionLoading} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50">
                                                {actionLoading ? 'جاري...' : 'حذف'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {stores.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-4">لا توجد متاجر.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div className="md:hidden space-y-3 p-3">
                        {stores.map(store => {
                            const owner = users.find(u => u.id === store.ownerId);
                            return (
                                <div key={`store-card-${store.id}`} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border dark:border-gray-700 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">{store.name}</p>
                                        <p className="text-[10px] text-gray-500">المالك: {owner?.name || 'غير معروف'}</p>
                                        <p className="mt-0.5">
                                            {store.isApproved ? (
                                                <span className="text-green-600 text-[10px] font-bold">معتمد</span>
                                            ) : (
                                                <span className="text-yellow-600 text-[10px] font-bold">بانتظار الموافقة</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {!store.isApproved && (
                                            <button onClick={() => handleApprove(store.id)} disabled={actionLoading} className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50">
                                                {actionLoading ? '...' : 'موافقة'}
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(store.id)} disabled={actionLoading} className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50">
                                            {actionLoading ? '...' : 'حذف'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { currentUser, theme, setTheme } = useAppContext();
    const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'system'>('profile');
    const isAdmin = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;

    return ( 
        <div className="container mx-auto py-4 md:py-8 px-2 md:px-8" dir="rtl"> 
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4"> 
                <div> 
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">الإعدادات</h1> 
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-[10px] md:text-sm font-bold">أهلاً بك، يمكنك إدارة إعدادات حسابك والنظام من هنا.</p> 
                </div> 
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700"> 
                    <button onClick={() => setTheme('light')} className={`p-1.5 md:p-2 rounded-full transition-all ${theme === 'light' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}> <SunIcon /> </button> 
                    <button onClick={() => setTheme('dark')} className={`p-1.5 md:p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'text-gray-400 hover:text-gray-600'}`}> <MoonIcon /> </button> 
                </div> 
            </div> 
            <div className="flex justify-center mb-6 md:mb-10 overflow-x-auto scrollbar-hide"> 
                <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 inline-flex whitespace-nowrap"> 
                    <button onClick={() => setActiveTab('profile')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-sm transition-all duration-300 ${activeTab === 'profile' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`} > ملفي الشخصي </button> 
                    {isAdmin && ( <> <button onClick={() => setActiveTab('company')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-sm transition-all duration-300 ${activeTab === 'company' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`} > إعدادات الشركة </button> <button onClick={() => setActiveTab('system')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-sm transition-all duration-300 ${activeTab === 'system' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`} > إدارة النظام </button> </> )} 
                </div> 
            </div> 
            <div className="max-w-4xl mx-auto pb-20"> 
                {activeTab === 'profile' && <UserProfileSettings />} 
                {isAdmin && activeTab === 'company' && <CompanyProfileForm />} 
                {isAdmin && activeTab === 'system' && <AdminSystemManagement />} 
            </div> 
        </div> 
    );
};

export default SettingsPage;