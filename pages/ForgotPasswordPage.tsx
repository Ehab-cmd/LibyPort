
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, Phone, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
    const { requestPasswordReset, companyInfo } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetCode, setResetCode] = useState<string | null>(null);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!email || !name || !phone) {
            setError('الرجاء تعبئة جميع الحقول للتحقق من هويتك.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await requestPasswordReset(email, name, phone);
            
            if (result.success && result.code && result.email) {
                setResetCode(result.code);
                setVerifiedEmail(result.email);
                setMessage(result.message);
            } else {
                setError(result.message);
                setResetCode(null);
                setVerifiedEmail(null);
            }
        } catch (err) {
            setError('حدث خطأ أثناء محاولة استعادة كلمة المرور.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold text-gray-900 dark:text-white transition-all outline-none";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 md:p-6" dir="rtl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-6xl flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
                {/* Form Column */}
                <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative">
                    <div className="max-w-md mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {resetCode ? (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">تم التحقق بنجاح</h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold mb-8">
                                        لقد تم إنشاء رمز إعادة تعيين كلمة المرور الخاص بك. يرجى استخدامه في الخطوة التالية.
                                    </p>
                                    
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-200 dark:border-yellow-700 p-8 rounded-3xl mb-8">
                                        <p className="text-xs font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest mb-2">رمز التحقق الخاص بك</p>
                                        <p className="text-5xl font-black tracking-[0.2em] text-gray-900 dark:text-white font-mono">{resetCode}</p>
                                    </div>

                                    <button
                                        onClick={() => navigate('/reset-password', { state: { identifier: verifiedEmail } })}
                                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <span>متابعة لإعادة التعيين</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div key="form">
                                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">استعادة الوصول</h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold mb-10">
                                        أدخل بياناتك المسجلة لدينا لنتمكن من مساعدتك في إعادة تعيين كلمة المرور.
                                    </p>
                                    
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-50 dark:bg-red-900/20 border-r-4 border-red-500 p-4 rounded-xl mb-6 flex items-center gap-3"
                                        >
                                            <ShieldAlert className="w-5 h-5 text-red-500" />
                                            <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="name@example.com" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="الاسم كما هو مسجل" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">رقم الهاتف</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} placeholder="09XXXXXXXX" required />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                                        >
                                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>التحقق وإنشاء الرمز</span>}
                                        </button>
                                    </form>

                                    <div className="mt-10 text-center">
                                        <ReactRouterDOM.Link to="/login" className="text-gray-500 hover:text-yellow-600 transition-colors font-bold flex items-center justify-center gap-2">
                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                            العودة لتسجيل الدخول
                                        </ReactRouterDOM.Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Image Column */}
                <div className="hidden md:block md:w-1/2 relative bg-gray-900 overflow-hidden group">
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/40 to-yellow-500/20" />
                    <div className="absolute inset-0 p-16 flex flex-col justify-end z-10">
                        <h2 className="text-4xl font-black text-white mb-4">أمان حسابك أولويتنا</h2>
                        <p className="text-gray-300 text-lg font-medium max-w-sm">
                            نحن هنا لمساعدتك في استعادة الوصول إلى حسابك بسرعة وأمان. اتبع الخطوات البسيطة لاستعادة كلمة المرور.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                    برمجة وتطوير بواسطة
                </p>
                <p className="text-sm font-black text-gray-900 dark:text-white">
                    {companyInfo.developerName || 'LibyPort Tech Solutions'}
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;