
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { DeliveryPrice, UserRole } from '../types';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

const AddEditPriceModal: React.FC<{ 
    initialData?: DeliveryPrice; 
    onClose: () => void; 
    onSave: (data: Omit<DeliveryPrice, 'id'>) => Promise<void> 
}> = ({ initialData, onClose, onSave }) => {
    const { showToast } = useNotification();
    const [title, setTitle] = useState(initialData?.title || '');
    const [cityCode, setCityCode] = useState(initialData?.cityCode || '');
    const [regionCode, setRegionCode] = useState(initialData?.regionCode || '');
    const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !price) {
            showToast('يرجى تعبئة الحقول المطلوبة', 'error');
            return;
        }
        setIsSaving(true);
        await onSave({ title, cityCode, regionCode, price: Number(price), lastUpdated: new Date().toISOString() });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up border dark:border-gray-700">
                <h2 className="text-2xl font-black mb-6">{initialData ? 'تعديل سعر المنطقة' : 'إضافة منطقة جديدة'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">العنوان / المنطقة</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold" placeholder="مثال: طرابلس، سوق الجمعة..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">كود المدينة</label>
                            <input type="text" value={cityCode} onChange={e => setCityCode(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold font-mono" placeholder="TIP" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">رقم المنطقة</label>
                            <input type="text" value={regionCode} onChange={e => setRegionCode(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold font-mono" placeholder="70" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">السعر (د.ل)</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-2xl text-center text-green-600" placeholder="0.00" required />
                    </div>
                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl">{isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeliveryPricesPage: React.FC = () => {
    const { deliveryPrices, currentUser, addDeliveryPrice, updateDeliveryPrice, deleteDeliveryPrice } = useAppContext();
    const { showConfirm } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPrice, setEditingPrice] = useState<DeliveryPrice | null>(null);

    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);

    const filteredPrices = useMemo(() => {
        return [...deliveryPrices].filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.cityCode.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => a.title.localeCompare(b.title, 'ar'));
    }, [deliveryPrices, searchTerm]);

    const handleSave = async (data: Omit<DeliveryPrice, 'id'>) => {
        if (editingPrice) {
            await updateDeliveryPrice(editingPrice.id, data);
        } else {
            await addDeliveryPrice(data);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 pb-20" dir="rtl">
            {isAddModalOpen && <AddEditPriceModal onClose={() => setIsAddModalOpen(false)} onSave={handleSave} />}
            {editingPrice && <AddEditPriceModal initialData={editingPrice} onClose={() => setEditingPrice(null)} onSave={handleSave} />}

            <div className="flex flex-row justify-between items-center mb-6 md:mb-10 gap-2">
                <div className="animate-fade-in-up flex-1">
                    <h1 className="text-lg md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">أسعار التوصيل المحلية</h1>
                    <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">جدول يوضح تكاليف شحن الميل الأخير للمناطق داخل المدن الليبية.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-yellow-500 text-white px-3 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center justify-center gap-1.5 text-[10px] md:text-base whitespace-nowrap">
                        <PlusIcon /> إضافة منطقة
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 mb-6 md:mb-8">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="ابحث عن منطقة أو كود..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 md:p-4 pr-10 md:pr-12 border-none bg-gray-50 dark:bg-gray-900 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white shadow-inner text-sm md:text-base"
                    />
                    <div className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-400 scale-75 md:scale-100"><SearchIcon /></div>
                </div>
            </div>

            {/* Desktop View Table (Hidden on Mobile) */}
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden border dark:border-gray-700 hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-5">العنوان</th>
                                <th className="px-6 py-5 text-center">كود المدينة</th>
                                <th className="px-6 py-5 text-center">رقم المنطقة</th>
                                <th className="px-8 py-5 text-left">السعر</th>
                                {isAdmin && <th className="px-6 py-5"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {filteredPrices.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-5 font-black text-gray-900 dark:text-white text-base leading-tight">{p.title}</td>
                                    <td className="px-6 py-5 text-center font-mono font-bold text-gray-500 dark:text-gray-400">{p.cityCode || '-'}</td>
                                    <td className="px-6 py-5 text-center font-mono font-bold text-gray-400">{p.regionCode || '-'}</td>
                                    <td className="px-8 py-5 text-left">
                                        <div className="font-black text-gray-900 dark:text-white text-xl font-mono">
                                            {p.price.toLocaleString()} <span className="text-[10px] font-normal opacity-50">د.ل</span>
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-5 text-left">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingPrice(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><EditIcon /></button>
                                                <button onClick={async () => {
                                                    const confirmed = await showConfirm('هل أنت متأكد من حذف سعر التوصيل هذا؟', 'حذف؟');
                                                    if (confirmed) await deleteDeliveryPrice(p.id);
                                                }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile/Tablet Card View (Hidden on Desktop) */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {filteredPrices.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 relative animate-fade-in-up hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="text-right flex-1 min-w-0">
                                <h3 className="font-black text-gray-900 dark:text-white text-sm md:text-lg leading-tight truncate">{p.title}</h3>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    <span className="text-[8px] md:text-[10px] font-black bg-gray-50 dark:bg-gray-900/50 text-gray-500 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-700 uppercase tracking-tighter">مدينة: {p.cityCode || '-'}</span>
                                    <span className="text-[8px] md:text-[10px] font-black bg-gray-50 dark:bg-gray-900/50 text-gray-400 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-700 uppercase tracking-tighter">منطقة: {p.regionCode || '-'}</span>
                                </div>
                            </div>
                            <div className="text-left mr-3">
                                <p className="font-black text-green-600 text-base md:text-xl font-mono leading-none">{p.price.toLocaleString()}</p>
                                <p className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase mt-1 tracking-tighter text-left">دينار ليبي</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="flex gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                                <button onClick={() => setEditingPrice(p)} className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl font-black text-[9px] flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors">
                                    <EditIcon /> تعديل
                                </button>
                                <button onClick={async () => {
                                    const confirmed = await showConfirm('هل أنت متأكد من حذف سعر التوصيل هذا؟', 'حذف؟');
                                    if (confirmed) await deleteDeliveryPrice(p.id);
                                }} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl font-black text-[9px] flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors">
                                    <TrashIcon /> حذف
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredPrices.length === 0 && (
                <div className="py-32 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mt-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner">
                        <SearchIcon />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لا توجد نتائج</h3>
                    <p className="text-gray-500 mt-1 font-medium">جرب البحث بكلمات أخرى.</p>
                </div>
            )}
            
            <div className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                * ملاحظة: يتم تحديث هذه الأسعار دورياً بناءً على الاتفاقيات المبرمة مع شركات الشحن المحلية المتعاونة.
            </div>
            <div className="h-24"></div>
        </div>
    );
};

export default DeliveryPricesPage;
