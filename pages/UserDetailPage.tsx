import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User, UserRole, AccountingSystem, Store } from '../types';
import { doc, writeBatch } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

// --- Icons ---
import { useNotification } from '../context/NotificationContext';

const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L14.5 4.5M21 21l-4.35-4.35m1.35-5.65a9.96 9.96 0 00-1.558-3.03M12 5c4.478 0 8.268 2.943 9.542 7 0 .53-.057 1.05-.164 1.543" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.18-2.422a12.02 12.02 0 005.644 0L19 20.417A12.02 12.02 0 0017.618 5.984z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const WhatsAppIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.12c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24zm4.52-6.13c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79 1-.15.17-.29.2-.54.07-.25-.12-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.38.1-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.4-.42-.55-.42h-.5c-.15 0-.39.04-.6.31-.2.25-.79.76-.79 1.85s.81 2.15.93 2.3.79 1.25 1.93 1.8 1.6.39 1.88.31c.28-.08.88-.36 1-.71.12-.35.12-.64.08-.76-.04-.12-.15-.2-.25-.31z" /></svg>;
const AdjustmentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;

const UserDetailPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { showToast, showConfirm } = useNotification();
    // Fix: Extracted systemSettings from useAppContext to resolve undefined reference errors
    const { users, stores, updateUser, updateStore, currentUser, companyInfo, sendNotification, exchangeRate, systemSettings } = useAppContext();
    
    const [editableUser, setEditableUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedStoreToLink, setSelectedStoreToLink] = useState<number | ''>('');
    const fileContractRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const foundUser = users.find(u => String(u.id) === id);
        if (foundUser) {
            setEditableUser(foundUser);
        }
        setIsLoading(false);
    }, [id, users]);

    const managedStores = useMemo(() => {
        if (!editableUser) return [];
        return stores.filter(s => (editableUser.storeIds || []).includes(s.id));
    }, [stores, editableUser]);

    const availableStoresToLink = useMemo(() => {
        if (!editableUser) return [];
        return stores.filter(s => !(editableUser.storeIds || []).includes(s.id));
    }, [stores, editableUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!editableUser) return;
        const { name, value, type } = e.target as HTMLInputElement;
        
        if (type === 'checkbox') {
            setEditableUser({ ...editableUser, [name]: (e.target as HTMLInputElement).checked });
        } else if (name === 'customExchangeRate') {
            setEditableUser({ ...editableUser, customExchangeRate: value === '' ? undefined : Number(value) });
        } else {
            setEditableUser({ ...editableUser, [name]: value });
        }
    };

    const toggleActiveStatus = () => {
        if (!editableUser) return;
        setEditableUser({ ...editableUser, isActive: !editableUser.isActive });
    };

    const handleApproveViaWhatsApp = async () => {
        if (!editableUser) return;
        
        try {
            const batch = writeBatch(firestore);
            const userRef = doc(firestore, 'users', String(editableUser.id));
            batch.update(userRef, { isApproved: true, isActive: true });
            managedStores.forEach(s => {
                const storeRef = doc(firestore, 'stores', String(s.id));
                batch.update(storeRef, { isApproved: true });
            });
            await batch.commit();
            await sendNotification(editableUser.id, `تهانينا ${editableUser.name}! تم اعتماد حسابك بنجاح في LibyPort. يمكنك البدء في إدارة مبيعاتك الآن.`, 'account_approved', '/dashboard');
            const phone = editableUser.phone.replace(/\D/g, '');
            const message = `*أهلاً بك شريكنا العزيز: ${editableUser.name}* 🚢\n\nيسرنا إبلاغك بأنه قد تم *تفعيل حسابك ومتاجرك* بنجاح في منصة *LibyPort*.\n\nيمكنك الآن تسجيل الدخول مباشرة لإدارة مبيعاتك وشحناتك:\n\n📧 البريد: ${editableUser.email}\n🔑 كلمة المرور: ${editableUser.password}\n\n📍 رابط المنصة: ${window.location.origin}\n\nنتمنى لك تجارة رابحة وموفقة! ✅`;
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            showToast('تم تفعيل الحساب والمتاجر بنجاح وتوجيهك لإرسال الرسالة.', 'success');
        } catch (error) {
            console.error(error);
            showToast('حدث خطأ أثناء الاعتماد', 'error');
        }
    };

    const handleLinkStore = async () => {
        if (!selectedStoreToLink || !editableUser) return;
        const storeId = Number(selectedStoreToLink);
        const updatedStoreIds = Array.from(new Set([...(editableUser.storeIds || []), storeId]));
        setEditableUser({ ...editableUser, storeIds: updatedStoreIds });
        await updateStore(storeId, { ownerId: editableUser.id });
        setSelectedStoreToLink('');
    };

    const handleUnlinkStore = async (storeId: number) => {
        if (!editableUser) return;
        const confirmed = await showConfirm('فك ارتباط المتجر', 'هل تريد فعلاً فك ارتباط هذا المتجر بالمستخدم؟');
        if (!confirmed) return;
        const updatedStoreIds = (editableUser.storeIds || []).filter(id => id !== storeId);
        setEditableUser({ ...editableUser, storeIds: updatedStoreIds });
    };

    const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editableUser) {
            if (file.size > 10 * 1024 * 1024) {
                showToast('حجم الملف كبير جداً، يرجى اختيار ملف أقل من 10 ميجابايت', 'error');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setEditableUser({ ...editableUser, contractUrl: reader.result as string });
            };
        }
    };

    const handleSave = async () => {
        if (!editableUser) return;
        try {
            await updateUser(editableUser.id, editableUser);
            showToast('تم تحديث بيانات المستخدم بنجاح', 'success');
            navigate('/users');
        } catch (error) {
            console.error(error);
            showToast('حدث خطأ أثناء التحديث', 'error');
        }
    };

    if (isLoading) return <div className="p-10 text-center font-bold">جاري التحميل...</div>;
    if (!editableUser) return <div className="p-10 text-center font-bold">المستخدم غير موجود</div>;

    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 no-print">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">إدارة حساب: {editableUser.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">تحكم كامل في الصلاحيات، الحالة، والارتباطات بالمتاجر.</p>
                </div>
                <div className="flex gap-2">
                    {!editableUser.isApproved && isAdmin && (
                        <button 
                            onClick={handleApproveViaWhatsApp}
                            className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 flex items-center gap-2 animate-pulse"
                        >
                            <WhatsAppIcon /> اعتماد الحساب وإرسال واتساب
                        </button>
                    )}
                    <button onClick={() => navigate('/users')} className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all border dark:border-gray-700 shadow-sm">العودة للقائمة</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-gray-700">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShieldIcon /></div>
                            <h2 className="text-xl font-black">البيانات التعريفية</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">الاسم الكامل</label>
                                <input type="text" name="name" value={editableUser.name} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 shadow-inner" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">البريد الإلكتروني (لا يمكن تعديله)</label>
                                <input type="email" value={editableUser.email} disabled className="w-full p-4 bg-gray-100 dark:bg-gray-700 border-none rounded-2xl text-gray-400 cursor-not-allowed opacity-60" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">رقم الهاتف</label>
                                <input type="tel" name="phone" value={editableUser.phone || ''} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 shadow-inner font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">كلمة المرور (للمساعدة الفنية)</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        value={editableUser.password || ''} 
                                        onChange={handleInputChange} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 shadow-inner" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute left-4 top-4 text-gray-400 hover:text-yellow-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: SPECIAL FINANCIAL CONFIGURATION SECTION */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 border-t-8 border-t-yellow-500 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-gray-700">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><AdjustmentsIcon /></div>
                            <h2 className="text-xl font-black text-gray-800 dark:text-white">تخصيص الإعدادات المالية (سري)</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2 text-yellow-600">سعر صرف خاص (اختياري)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-gray-300">$1 =</span>
                                    <input 
                                        type="number" 
                                        name="customExchangeRate" 
                                        step="0.01"
                                        value={editableUser.customExchangeRate || ''} 
                                        onChange={handleInputChange} 
                                        placeholder={exchangeRate.toString()}
                                        className="flex-grow p-4 bg-white dark:bg-gray-800 border-2 border-yellow-500 rounded-2xl font-black text-2xl text-center focus:ring-4 focus:ring-yellow-500/10 text-yellow-600" 
                                    />
                                    <span className="text-sm font-bold text-gray-400">د.ل</span>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-3 font-bold italic leading-relaxed">
                                    * في حال إدخال رقم هنا، سيتم احتساب تكاليف الشراء لهذا التاجر بهذا السعر حصراً، ولن يتأثر بتغيير سعر الصرف العام للنظام. اترك الحقل فارغاً لاستخدام السعر العام.
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2 text-blue-600">المرتب الثابت (اختياري)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        name="fixedSalary" 
                                        value={editableUser.fixedSalary || ''} 
                                        onChange={handleInputChange} 
                                        placeholder="0.00"
                                        className="flex-grow p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-2xl font-black text-2xl text-center focus:ring-4 focus:ring-blue-500/10 text-blue-600" 
                                    />
                                    <span className="text-sm font-bold text-gray-400">د.ل</span>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-3 font-bold italic leading-relaxed">
                                    * في حال تحديد مرتب ثابت للموظف، سيتم اعتماده كصافي مستحقاته الشهرية في كشف الحساب والماليات، وسيتم تجاهل عمولات المبيعات التلقائية.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">إعفاءات الرسوم</label>
                                
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="font-black text-sm text-gray-700 dark:text-gray-200 leading-none">إعفاء من الاشتراك الشهري</p>
                                        <p className="text-[9px] text-gray-400 font-bold mt-1">إلغاء خصم الـ {systemSettings.vipSubscriptionFee} د.ل</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        name="isSubscriptionExempt" 
                                        checked={editableUser.isSubscriptionExempt || false} 
                                        onChange={handleInputChange}
                                        className="w-6 h-6 rounded-lg text-yellow-500 focus:ring-yellow-500 border-gray-300 dark:bg-gray-800"
                                    />
                                </div>

                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="font-black text-sm text-gray-700 dark:text-gray-200 leading-none">إعفاء من عمولة الشراء</p>
                                        <p className="text-[9px] text-gray-400 font-bold mt-1">إلغاء خصم نسبة الـ {systemSettings.purchaseCommissionPercentage}%</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        name="isCommissionExempt" 
                                        checked={editableUser.isCommissionExempt || false} 
                                        onChange={handleInputChange}
                                        className="w-6 h-6 rounded-lg text-yellow-500 focus:ring-yellow-500 border-gray-300 dark:bg-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-8">
                                <ReactRouterDOM.Link 
                                    to={`/financials/user/${editableUser?.id}`}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-4 rounded-2xl font-black text-xs text-center hover:bg-gray-200 transition-all border border-gray-200 dark:border-gray-600"
                                >
                                    كشف الحساب (Ledger)
                                </ReactRouterDOM.Link>
                                <ReactRouterDOM.Link 
                                    to={`/financials/settlement/${editableUser?.id}`}
                                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs text-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    تقرير التصفية المالية
                                </ReactRouterDOM.Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-gray-700">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileTextIcon /></div>
                            <h2 className="text-xl font-black text-gray-800 dark:text-white">إدارة العقد القانوني (PDF/Scan)</h2>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center text-center">
                            {editableUser.contractUrl ? (
                                <>
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                        <FileTextIcon />
                                    </div>
                                    <h3 className="font-black text-gray-800 dark:text-white mb-2">يوجد عقد مرفوع لهذا المستخدم</h3>
                                    <div className="flex gap-3 mt-4 w-full max-w-xs">
                                        <a href={editableUser.contractUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg text-xs">عرض الملف</a>
                                        <button onClick={() => fileContractRef.current?.click()} className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold border border-gray-200 dark:border-gray-600 hover:bg-gray-50 text-xs">تحديث الملف</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <h3 className="font-black text-gray-500 mb-1">لم يتم رفع أي عقد بعد</h3>
                                    <button onClick={() => fileContractRef.current?.click()} className="bg-gray-900 text-white px-10 py-3 rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl">رفع ملف العقد الآن</button>
                                </>
                            )}
                            <input type="file" ref={fileContractRef} onChange={handleContractUpload} className="hidden" accept=".pdf,image/*" />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <h2 className="text-lg font-black mb-6 text-gray-800 dark:text-white">حالة الدخول للسيستم</h2>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div>
                                <p className={`font-black text-sm ${editableUser.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                    {editableUser.isActive ? 'الحساب مفعّل' : 'الحساب موقوف'}
                                </p>
                            </div>
                            <button onClick={toggleActiveStatus} className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${editableUser.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${editableUser.isActive ? '-translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black flex items-center gap-2 text-gray-800 dark:text-white"><StoreIcon /> المتاجر التابعة</h2>
                        </div>
                        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-dashed border-purple-200 dark:border-purple-800">
                            <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 mr-2">ربط متجر موجود في السيستم</label>
                            <div className="flex gap-2">
                                <select value={selectedStoreToLink} onChange={e => setSelectedStoreToLink(e.target.value === '' ? '' : Number(e.target.value))} className="flex-grow p-2 text-xs border-none bg-white dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 font-bold">
                                    <option value="">-- اختر متجراً للربط --</option>
                                    {availableStoresToLink.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button onClick={handleLinkStore} disabled={!selectedStoreToLink} className="bg-purple-600 text-white p-2 rounded-xl disabled:bg-gray-300 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"><LinkIcon /></button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {managedStores.map(s => (
                                <div key={s.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-transparent hover:border-yellow-200 dark:hover:border-yellow-900/30 transition-all flex items-center justify-between group">
                                    <div><p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{s.name}</p></div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => navigate(`/stores/${s.id}`)} className="text-[10px] font-black text-blue-500 hover:underline">عرض</button>
                                        <button onClick={() => handleUnlinkStore(s.id)} className="text-[10px] font-black text-red-500 hover:text-red-700 flex items-center gap-1"><XCircleIcon /> فك ربط</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button onClick={handleSave} className="w-full bg-yellow-500 text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-yellow-500/30 hover:bg-yellow-600 hover:-translate-y-1 transition-all active:scale-95">حفظ كافة التغييرات</button>
                    </div>
                </div>
            </div>
            <div className="h-20"></div>
        </div>
    );
};

export default UserDetailPage;