import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ResetPasswordConfirmationPage: React.FC = () => {
    const { companyInfo } = useAppContext();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 md:p-6" dir="rtl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-8 md:p-12 text-center"
            >
                <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                        <Mail className="w-12 h-12 text-yellow-500" />
                    </div>
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1"
                    >
                        <CheckCircle2 className="w-8 h-8 text-green-500 fill-white dark:fill-gray-900" />
                    </motion.div>
                </div>

                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">تحقق من بريدك</h2>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-lg mb-10 leading-relaxed">
                    إذا كان البريد الإلكتروني الذي أدخلته مسجلاً لدينا، فستتلقى رمز التحقق خلال لحظات. يرجى التحقق من صندوق الوارد (أو البريد المزعج).
                </p>

                <div className="space-y-4">
                    <ReactRouterDOM.Link
                        to="/reset-password"
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span>أدخل رمز التحقق</span>
                    </ReactRouterDOM.Link>

                    <ReactRouterDOM.Link
                        to="/login"
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-black text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3"
                    >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        <span>العودة لتسجيل الدخول</span>
                    </ReactRouterDOM.Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-400 font-bold text-sm">
                        لم تصلك الرسالة؟ <ReactRouterDOM.Link to="/forgot-password" className="text-yellow-600 hover:underline">أعد المحاولة</ReactRouterDOM.Link>
                    </p>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="fixed bottom-8 left-0 right-0 text-center">
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

export default ResetPasswordConfirmationPage;
