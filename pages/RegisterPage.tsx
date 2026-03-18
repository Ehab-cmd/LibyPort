
import React, { useState, useRef, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, SubscriptionType } from '../types';
import { LIBYAN_CITIES } from '../constants';
import { compressImage } from '../utils/imageHelper';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const COLORS = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500'];
const getColorForName = (name: string) => {
    if (!name) return COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index]!;
};

const Avatar: React.FC<{ name: string; src?: string | null; className?: string; textSize?: string }> = ({ name, src, className = 'w-10 h-10', textSize = 'text-lg' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colorClass = getColorForName(name || '');
    if (src) {
        return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} />;
    }
    return (
        <div className={`rounded-full flex items-center justify-center font-bold text-white ${colorClass} ${className}`}>
            <span className={textSize}>{initial}</span>
        </div>
    );
};

interface RegistrationData {
    name: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    address: string;
    storeNames: string[];
    profilePicture?: string | null;
    subscriptionType?: SubscriptionType;
}

const ContractModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    subscriptionType: SubscriptionType;
    fee: number;
    commission: number;
}> = ({ isOpen, onClose, onConfirm, userName, subscriptionType, fee, commission }) => {
    const [isAgreed, setIsAgreed] = useState(false);

    if (!isOpen) return null;

    const currentDate = new Date().toLocaleDateString('ar-LY');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in border dark:border-gray-700">
                
                <div className="text-center mb-8 border-b-2 border-yellow-500 pb-6">
                    <h1 className="text-4xl font-extrabold text-yellow-500 tracking-tighter">LibyPort</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 tracking-widest uppercase font-black">بوابة طرابلس العالمية</p>
                    <h2 className="text-2xl font-black mt-6 text-gray-900 dark:text-white">عقد اتفاق وتوفير خدمات</h2>
                </div>

                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-justify leading-relaxed text-sm">
                    <p className="font-bold">انه في يوم {currentDate}، تم الاتفاق بين كل من:</p>
                    <p>1. <strong>شركة LibyPort</strong> (الطرف الأول - الشركة)</p>
                    <p>2. <strong>السيد/ة: {userName}</strong> (الطرف الثاني - المشترك/صاحب المتجر)</p>
                    
                    <h3 className="font-black text-lg mt-4 text-yellow-600 dark:text-yellow-500">تمهيد:</h3>
                    <p>حيث أن الطرف الأول شركة متخصصة في الخدمات اللوجستية والتجارة الإلكترونية، وحيث أن الطرف الثاني يرغب في الاستفادة من خدمات الشركة وفقاً لنوع الاشتراك الموضح أدناه، فقد اتفق الطرفان على ما يلي:</p>

                    <h3 className="font-black text-lg mt-4 text-yellow-600 dark:text-yellow-500">البند الأول: نوع الاشتراك والرسوم</h3>
                    {subscriptionType === SubscriptionType.VIP ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-700">
                            <p className="font-black text-yellow-800 dark:text-yellow-400 mb-2">نوع الاشتراك: LibyPort VIP Store</p>
                            <p>- خدمات متكاملة تشمل: الشراء، الشحن الدولي، التخليص الجمركي، التخزين، وخدمات توصيل الميل الأخير (توصيل الطلبيات لزبائن المتجر واستلام الأموال).</p>
                            <p>- <strong>قيمة الاشتراك الشهري: {fee} دينار ليبي.</strong></p>
                            <p>- يتم خصم قيمة الاشتراك تلقائياً من الرصيد المستحق للطرف الثاني في نهاية كل شهر.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
                            <p className="font-black text-gray-800 dark:text-white mb-2">نوع الاشتراك: LibyPort Store (قياسي)</p>
                            <p>- خدمات تشمل: الشراء والشحن الدولي فقط.</p>
                            <p>- لا تشمل خدمات التوصيل للزبائن النهائيين أو تحصيل الأموال منهم.</p>
                            <p>- <strong>قيمة الاشتراك: مجاني.</strong></p>
                        </div>
                    )}

                    <h3 className="font-black text-lg mt-4 text-yellow-600 dark:text-yellow-500">البند الثاني: الالتزامات المالية</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>يتحمل الطرف الثاني تكلفة البضاعة المشتراة، تكاليف الشحن، وأي مصاريف إعلانية (إن وجدت).</li>
                        <li>تستحق الشركة نسبة عمولة قدرها <strong>{commission}%</strong> من قيمة مشتريات الطرف الثاني.</li>
                        <li>يحق للشركة تعديل نسبة العمولة أو قيمة الاشتراك مستقبلاً بعد إخطار الطرف الثاني.</li>
                    </ul>

                    <h3 className="font-black text-lg mt-4 text-yellow-600 dark:text-yellow-500">البند الثالث: أحكام عامة</h3>
                    <p>يعتبر هذا العقد سارياً من تاريخ قبول الطرف الثاني له إلكترونياً عبر منصة LibyPort، ويخضع للقوانين المعمول بها.</p>
                </div>

                <div className="mt-16 pt-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-row justify-between items-end px-4 opacity-70">
                    <div className="text-center w-1/3">
                        <p className="font-black mb-4 text-gray-800 dark:text-gray-200">الطرف الثاني (المستخدم)</p>
                        <div className="h-20 flex flex-col justify-center items-center border-b-2 border-gray-400 pb-2 border-dashed">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">سيتم التوقيع إلكترونياً عند الموافقة</p>
                        </div>
                    </div>

                    <div className="text-center w-1/3 relative">
                        <p className="font-black mb-4 text-gray-800 dark:text-gray-200">الطرف الأول (الشركة)</p>
                        <div className="h-20 flex flex-col justify-center items-center border-b-2 border-gray-400 pb-2 relative z-10">
                            <p className="font-serif text-xl italic text-yellow-600 font-black">LibyPort Admin</p>
                        </div>
                        
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 opacity-80 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
                            <div className="w-24 h-24 border-4 border-blue-900 dark:border-blue-400 rounded-full flex items-center justify-center transform -rotate-12">
                                <div className="w-20 h-20 border border-blue-900 dark:border-blue-400 rounded-full flex flex-col items-center justify-center text-center p-1">
                                    <p className="text-[8px] font-black text-blue-900 dark:text-blue-400">TRIPOLI - LIBYA</p>
                                    <p className="text-xs font-black text-blue-900 dark:text-blue-400 my-1">LibyPort</p>
                                    <p className="text-[8px] font-black text-blue-900 dark:text-blue-400">APPROVED</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl border dark:border-gray-600">
                    <input 
                        type="checkbox" 
                        id="agree-checkbox" 
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="w-6 h-6 text-yellow-600 focus:ring-yellow-500 rounded-lg cursor-pointer" 
                    />
                    <label htmlFor="agree-checkbox" className="text-sm font-black cursor-pointer text-gray-800 dark:text-gray-200 leading-tight">أوافق على جميع الشروط والأحكام المذكورة أعلاه وأعتبر هذا موافقة وتوقيعاً إلكترونياً ملزماً.</label>
                </div>

                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">إلغاء</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={!isAgreed} 
                        className="flex-2 bg-yellow-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        تأكيد التسجيل والموافقة
                    </button>
                </div>
            </div>
        </div>
    );
};

const RegistrationSummaryModal: React.FC<{
    userData: RegistrationData;
    successMessage: string;
    onConfirm: () => void;
}> = ({ userData, successMessage, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl w-full max-w-lg border dark:border-gray-700">
                <h2 className="text-2xl font-black text-center mb-4 text-gray-900 dark:text-white">تم التسجيل بنجاح!</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8 font-bold">هذه هي بياناتك التي قمت بتسجيلها. يرجى الاحتفاظ بها كمرجع.</p>
                
                <div className="flex justify-center mb-6">
                    <Avatar name={userData.name} src={userData.profilePicture} className="w-24 h-24 shadow-xl" textSize="text-3xl" />
                </div>
                
                <div className="space-y-4 text-right bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl text-gray-800 dark:text-gray-200 border dark:border-gray-700">
                    <p><strong>الاسم الكامل:</strong> {userData.name}</p>
                    <p><strong>البريد الإلكتروني:</strong> {userData.email}</p>
                    <p className="text-red-600 dark:text-red-400 font-bold"><strong>كلمة المرور:</strong> <span className="font-mono">{userData.password}</span></p>
                    <p><strong>رقم الهاتف:</strong> {userData.phone}</p>
                    <p><strong>نوع الاشتراك:</strong> <span className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-[10px] font-black">{userData.subscriptionType}</span></p>
                    <div>
                        <strong>المتاجر المسجلة:</strong>
                        <ul className="list-disc list-inside pr-4 mt-1 opacity-70">
                            {userData.storeNames.map((store, i) => <li key={i}>{store}</li>)}
                        </ul>
                    </div>
                </div>

                <p className="text-green-600 dark:text-green-400 text-center font-black my-8 animate-pulse">{successMessage}</p>

                <button
                    onClick={onConfirm}
                    className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transition-all transform active:scale-95"
                >
                    الذهاب لصفحة الدخول
                </button>
            </div>
        </div>
    );
};

const RegisterPage: React.FC = () => {
    const { registerUser, currentUser, systemSettings } = useAppContext();
    const { showToast } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();
    
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState<RegistrationData>({
        name: '', email: '', password: '', phone: '', city: '', address: '', storeNames: [''], subscriptionType: SubscriptionType.Standard
    });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isContractOpen, setIsContractOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (currentUser) {
        return <ReactRouterDOM.Navigate to="/dashboard" replace />;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleStoreNameChange = (index: number, value: string) => {
        const newStoreNames = [...userData.storeNames];
        newStoreNames[index] = value;
        setUserData(prev => ({ ...prev, storeNames: newStoreNames }));
    };

    const addStoreNameField = () => {
        setUserData(prev => ({ ...prev, storeNames: [...prev.storeNames, ''] }));
    };

    const removeStoreNameField = (index: number) => {
        if (userData.storeNames.length > 1) {
            const newStoreNames = userData.storeNames.filter((_, i) => i !== index);
            setUserData(prev => ({ ...prev, storeNames: newStoreNames }));
        }
    };
    
    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setProfilePicture(compressed);
            } catch (error) {
                showToast("حدث خطأ أثناء معالجة الصورة", 'error');
            }
        }
    };

    const handleNextStep = () => {
        if (step === 1 && (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.city || !userData.address)) {
            showToast('يرجى تعبئة جميع الحقول المطلوبة.', 'error');
            return;
        }
        if (step === 2 && userData.storeNames.some(s => !s.trim())) {
            showToast('يرجى إدخال اسم للمتجر.', 'error');
            return;
        }
        setStep(prev => prev + 1);
    };

    const handlePreSubmit = () => {
        setIsContractOpen(true);
    };

    const handleFinalSubmit = async () => {
        setIsContractOpen(false);
        setIsProcessing(true);
        
        const finalStoreNames = userData.storeNames.filter(name => name.trim() !== '');
        
        // تصحيح هام: نستخدم null بدلاً من undefined لـ profilePicture لتجنب خطأ Firebase
        const result = await registerUser({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            city: userData.city,
            address: userData.address,
            profilePicture: profilePicture || null, 
            role: UserRole.Store,
            subscriptionType: userData.subscriptionType
        }, finalStoreNames);

        setIsProcessing(false);
        if (result.success) {
            setSuccessMessage(result.message);
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleSummaryConfirm = () => {
        setSuccessMessage(null);
        navigate('/login');
    };

    const inputClasses = "w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl shadow-inner text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-yellow-500 transition-all";

    return (
        <div className="flex flex-grow items-center justify-center p-4 sm:p-6 lg:p-8" dir="rtl">
            {isContractOpen && (
                <ContractModal 
                    isOpen={isContractOpen}
                    onClose={() => setIsContractOpen(false)}
                    onConfirm={handleFinalSubmit}
                    userName={userData.name}
                    subscriptionType={userData.subscriptionType || SubscriptionType.Standard}
                    fee={systemSettings.vipSubscriptionFee}
                    commission={systemSettings.purchaseCommissionPercentage}
                />
            )}
            
            {successMessage && (
                <RegistrationSummaryModal
                    userData={{...userData, profilePicture}}
                    successMessage={successMessage}
                    onConfirm={handleSummaryConfirm}
                />
            )}

            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-800">
                
                <div className="w-full md:w-2/3 p-8 lg:p-12 overflow-y-auto">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">إنشاء حساب شريك</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold">بوابتك لإدارة تجارتك العالمية والشحن من طرابلس.</p>

                    <div className="flex justify-center mb-12 gap-3">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-yellow-500 shadow-sm' : 'bg-gray-100 dark:bg-gray-800'}`}></div>
                        ))}
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Avatar name={userData.name} src={profilePicture} className="w-32 h-32 shadow-2xl border-4 border-white dark:border-gray-800" textSize="text-5xl" />
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">صورة الملف الشخصي</p>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProfilePicUpload} className="hidden" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="name" placeholder="الاسم الرباعي" value={userData.name} onChange={handleInputChange} className={inputClasses} required />
                                    <input name="email" type="email" placeholder="البريد الإلكتروني" value={userData.email} onChange={handleInputChange} className={inputClasses} required />
                                    <input name="password" type="text" placeholder="كلمة المرور (6 أرقام/حروف)" value={userData.password} onChange={handleInputChange} className={inputClasses} required />
                                    <input name="phone" type="tel" placeholder="رقم الهاتف (واتساب)" value={userData.phone} onChange={handleInputChange} className={inputClasses} required />
                                    <select name="city" value={userData.city} onChange={handleInputChange} className={inputClasses} required>
                                        <option value="" disabled>اختر المدينة</option>
                                        {LIBYAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                    <input name="address" placeholder="العنوان بالتفصيل" value={userData.address} onChange={handleInputChange} className={inputClasses} required />
                                </div>
                                <button onClick={handleNextStep} className="w-full bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-yellow-500/10 hover:scale-[1.01] transition-all transform active:scale-95 mt-4">التالي: تحديد المتاجر</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2">تسمية المتاجر</h3>
                                    <p className="text-sm text-gray-500 font-bold mb-6">أدخل أسماء العلامات التجارية التي تملكها وتريد إدارتها عبر LibyPort.</p>
                                    <div className="space-y-3">
                                        {userData.storeNames.map((name, index) => (
                                            <div key={index} className="flex items-center gap-3 animate-fade-in">
                                                <input
                                                    type="text"
                                                    placeholder={`اسم المتجر ${index + 1}`}
                                                    value={name}
                                                    onChange={(e) => handleStoreNameChange(index, e.target.value)}
                                                    className={inputClasses}
                                                />
                                                {userData.storeNames.length > 1 && (
                                                    <button type="button" onClick={() => removeStoreNameField(index)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                                                        <TrashIcon />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addStoreNameField} className="mt-4 text-yellow-600 font-black text-sm hover:underline flex items-center gap-1">
                                        <span>+ إضافة اسم متجر إضافي</span>
                                    </button>
                                </div>
                                <div className="flex gap-4 mt-10">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white py-4 rounded-2xl font-bold">رجوع</button>
                                    <button onClick={handleNextStep} className="flex-2 bg-yellow-500 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-yellow-600 transition-all">تحديد خطة الاشتراك</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="font-black text-xl text-gray-900 dark:text-white mb-6">اختر باقة الأعمال المناسبة</h3>
                                
                                <div 
                                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${userData.subscriptionType === SubscriptionType.VIP ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-2xl scale-[1.02]' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                                    onClick={() => setUserData(prev => ({...prev, subscriptionType: SubscriptionType.VIP}))}
                                >
                                    {userData.subscriptionType === SubscriptionType.VIP && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>}
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">{SubscriptionType.VIP}</h4>
                                        <span className="bg-yellow-500 text-gray-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg">الأكثر اختياراً</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed font-bold">نظام متكامل لإدارة الطلبيات: يشمل الشراء، الشحن الدولي، التخزين، وتوصيل "الميل الأخير" للزبائن مع تحصيل مبالغ المبيعات.</p>
                                    <p className="text-2xl font-black text-yellow-600 font-mono">{systemSettings.vipSubscriptionFee} <span className="text-xs font-normal">د.ل / شهرياً</span></p>
                                </div>

                                <div 
                                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${userData.subscriptionType === SubscriptionType.Standard ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-2xl scale-[1.02]' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                                    onClick={() => setUserData(prev => ({...prev, subscriptionType: SubscriptionType.Standard}))}
                                >
                                    {userData.subscriptionType === SubscriptionType.Standard && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
                                    <h4 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter mb-2">{SubscriptionType.Standard}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed font-bold">للمتاجر التي ترغب في الشحن الدولي فقط. نحن نتولى الشراء والشحن لطرابلس، وأنت تتولى الباقي.</p>
                                    <p className="text-2xl font-black text-green-600 font-mono">مجاني <span className="text-xs font-normal opacity-50">(عمولات الشراء فقط)</span></p>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white py-4 rounded-2xl font-bold">رجوع</button>
                                    <button onClick={handlePreSubmit} disabled={isProcessing} className="flex-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-2xl hover:bg-black transition-all transform active:scale-95 disabled:bg-gray-300">
                                        {isProcessing ? 'جاري التحقق...' : 'مراجعة العقد والبدء'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="hidden md:block md:w-1/3 bg-gray-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/40 to-gray-950"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-12 text-white z-10">
                        <div className="mb-6"><h1 className="text-6xl font-black text-yellow-500 mb-2">Liby<span className="text-white">Port</span></h1><div className="h-1 w-12 bg-yellow-500 rounded-full"></div></div>
                        <h2 className="text-3xl font-black mb-6 leading-tight">ابدأ رحلتك التجارية الاحترافية اليوم</h2>
                        <p className="text-gray-400 leading-relaxed font-bold text-sm">
                            مع LibyPort، أنت لست مجرد عميل، أنت شريك استراتيجي. نوفر لك البنية التحتية اللوجستية الكاملة لتنمية متجرك من ليبيا للعالم.
                        </p>
                        <div className="mt-12 flex items-center gap-3">
                            <div className="flex -space-x-3 rtl:space-x-reverse">
                                {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center font-black text-[10px] text-yellow-500">M</div>)}
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">+500 شريك نشط</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                    لديك حساب بالفعل؟{' '}
                    <ReactRouterDOM.Link to="/login" className="text-yellow-600 font-black hover:underline px-2">
                        تسجيل الدخول من هنا ⬅️
                    </ReactRouterDOM.Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
