
import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { LIBYAN_CITIES } from '../constants';
import { OrderType, PaymentMethod, ProductCategory } from '../types';

const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const CheckoutPage: React.FC = () => {
    const { cart, addOrder, clearCart, currentUser, companyInfo } = useAppContext();
    const { showToast } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState<{ id: string; total: number } | null>(null);

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        city: currentUser?.city || '',
        address: currentUser?.address || '',
        notes: ''
    });

    const subtotal = useMemo(() => (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((cart || []).length === 0) {
            showToast('سلتك فارغة!', 'error');
            return;
        }
        if (!formData.city) {
            showToast('الرجاء اختيار المدينة', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const hasNewPurchaseItems = cart.some(item => !item.productId || item.productId < 1000); 
            const orderType = hasNewPurchaseItems ? OrderType.NewPurchase : OrderType.InstantDelivery;

            const result = await addOrder({
                storeId: 1, 
                customerName: formData.name,
                phone1: formData.phone,
                city: formData.city,
                address: formData.address,
                items: cart || [],
                total: subtotal,
                orderType: orderType,
                productType: ProductCategory.Miscellaneous,
                paymentMethod: PaymentMethod.Cash,
                notes: formData.notes,
                isPaymentConfirmed: false,
                isDepositPaid: false
            });

            if (result.success && result.id) {
                const orderId = result.id;
                
                // --- إضافة ميزة الإرسال التلقائي للواتساب هنا ---
                const companyPhone = companyInfo.phone.replace(/\D/g, ''); 
                const message = `*تأكيد جدية طلب من شركة LibyPort* 🚢\n\nأنا الزبون: *${formData.name}*\nأؤكد رغبتي في استلام الطلب رقم: *#${orderId}*\n\n📍 المدينة: ${formData.city}\n💰 القيمة الإجمالية: ${subtotal.toLocaleString()} د.ل\n\n✅ يرجى المباشرة في إجراءات الشحن والتسليم.`;
                
                const whatsappUrl = `https://wa.me/${companyPhone}?text=${encodeURIComponent(message)}`;
                
                // فتح الواتساب تلقائياً في نافذة جديدة
                window.open(whatsappUrl, '_blank');

                // عرض شاشة النجاح
                setOrderSuccessData({ id: orderId, total: subtotal });
                clearCart();
            } else {
                showToast('فشل تسجيل الطلب، يرجى المحاولة لاحقاً', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('حدث خطأ غير متوقع', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (orderSuccessData) {
        return (
            <div className="container mx-auto p-6 md:p-20 text-center animate-fade-in">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl max-w-2xl mx-auto border border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">تم إرسال الطلب بنجاح!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold leading-relaxed">
                        لقد قمنا بتوجيهك الآن إلى تطبيق الواتساب لإرسال رسالة تأكيد الجدية تلقائياً.<br/>
                        <span className="text-yellow-600">إذا لم يفتح التطبيق تلقائياً، يمكنك متابعة تتبع شحنتك أدناه.</span>
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl mb-8 border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم مرجع الطلب</p>
                        <p className="text-4xl font-black text-yellow-600 font-mono tracking-tighter">#{orderSuccessData.id}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => navigate('/')} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-black transition-all hover:bg-gray-200">العودة للرئيسية</button>
                        <ReactRouterDOM.Link to={`/track/${orderSuccessData.id}`} className="flex-1 bg-yellow-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-yellow-600 transition-all flex items-center justify-center">تتبع الطلبية</ReactRouterDOM.Link>
                    </div>
                </div>
            </div>
        );
    }

    if ((cart || []).length === 0) {
        return (
            <div className="container mx-auto p-20 text-center">
                <h2 className="text-2xl font-black mb-4 text-gray-800 dark:text-white">سلتك فارغة حالياً</h2>
                <ReactRouterDOM.Link to="/instant-products" className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-bold inline-block">تسوق الآن</ReactRouterDOM.Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-10 max-w-6xl" dir="rtl">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">إتمام الطلب</h1>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-gray-700">
                            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><UserIcon /></div>
                            <h2 className="text-xl font-black">بيانات المستلم</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">الاسم بالكامل</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 shadow-inner" placeholder="ادخل اسمك الثلاثي" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">رقم الهاتف (واتساب)</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black focus:ring-2 focus:ring-yellow-500 shadow-inner font-mono" placeholder="09XXXXXXXX" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-gray-700">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><MapPinIcon /></div>
                            <h2 className="text-xl font-black">عنوان التوصيل</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">المدينة</label>
                                <select name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500">
                                    <option value="">-- اختر المدينة --</option>
                                    {LIBYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">العنوان / ملاحظات السائق</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold shadow-inner" placeholder="رقم الشارع، علامة مميزة..." />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">ملاحظات إضافية للطلبية</label>
                        <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold shadow-inner resize-none" placeholder="أي تفاصيل أخرى تود إخبارنا بها..."></textarea>
                    </div>
                </div>

                <div className="space-y-8 animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6 border-b dark:border-gray-700 pb-3">
                            <ShoppingBagIcon />
                            <h2 className="font-black text-gray-800 dark:text-white">ملخص الطلبية</h2>
                        </div>
                        
                        <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
                            {(cart || []).map((item, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <img src={item.image} className="w-12 h-12 object-cover rounded-xl border dark:border-gray-700" alt={item.name} />
                                    <div className="min-w-0 flex-grow">
                                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{item.quantity} × {item.price.toLocaleString()} د.ل</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t dark:border-gray-700">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold">
                                <span className="text-sm">المجموع الفرعي</span>
                                <span className="font-mono">{subtotal.toLocaleString()} د.ل</span>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold">
                                <span className="text-sm">التوصيل</span>
                                <span className="text-xs">يتم الحساب عند التأكيد</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-2">
                                <span className="text-lg font-black dark:text-white text-gray-900">الإجمالي النهائي</span>
                                <p className="text-3xl font-black text-yellow-600 font-mono leading-none">{subtotal.toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 dark:bg-yellow-500 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full text-white dark:text-gray-900 font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-6 h-6 border-4 border-white dark:border-gray-900 border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                                <>إرسال الطلب الآن</>
                            )}
                        </button>
                        <p className="text-[10px] text-white/50 dark:text-gray-700/50 font-bold uppercase tracking-widest mt-4">سيتم توجيهك للواتساب للتأكيد</p>
                    </div>
                </div>
            </form>
            <div className="h-20"></div>
        </div>
    );
};

export default CheckoutPage;
