import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, ShieldCheck, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
    const { resetPassword, companyInfo } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();
    
    const identifier = location.state?.identifier;

    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!identifier) {
            navigate('/forgot-password', { replace: true });
        }
    }, [identifier, navigate]);

    if (!identifier) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
            return;
        }
        if (newPassword.length < 6) {
            setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await resetPassword(identifier, code, newPassword);
            if (result.success) {
                navigate('/login', { state: { successMessage: result.message } });
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('حدث خطأ أثناء محاولة تحديث كلمة المرور.');
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
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">كلمة مرور جديدة</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold mb-10">
                            أدخل الرمز الذي حصلت عليه وكلمة المرور الجديدة لتأمين حسابك.
                        </p>
                        
                        <AnimatePresence mode="wait">
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
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">رمز التحقق</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputClasses} placeholder="أدخل الرمز هنا" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">كلمة المرور الجديدة</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClasses} placeholder="••••••••" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">تأكيد كلمة المرور</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClasses} placeholder="••••••••" required />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>تحديث كلمة المرور</span>}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <ReactRouterDOM.Link to="/forgot-password" className="text-gray-500 hover:text-yellow-600 transition-colors font-bold flex items-center justify-center gap-2">
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                لم تستلم الرمز؟ اطلب واحداً جديداً
                            </ReactRouterDOM.Link>
                        </div>
                    </div>
                </div>

                {/* Image Column */}
                <div className="hidden md:block md:w-1/2 relative bg-gray-900 overflow-hidden group">
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/40 to-yellow-500/20" />
                    <div className="absolute inset-0 p-16 flex flex-col justify-end z-10">
                        <h2 className="text-4xl font-black text-white mb-4">خطوة واحدة متبقية</h2>
                        <p className="text-gray-300 text-lg font-medium max-w-sm">
                            أنت الآن على وشك استعادة الوصول الكامل إلى حسابك. اختر كلمة مرور قوية وفريدة.
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

export default ResetPasswordPage;
