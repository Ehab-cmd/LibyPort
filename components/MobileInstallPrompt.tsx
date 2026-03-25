
import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const MobileInstallPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // التحقق من نوع الجهاز
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        
        // التحقق مما إذا كان التطبيق مثبتاً بالفعل (Standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (!isStandalone) {
            if (isIos) setPlatform('ios');
            else if (isAndroid) setPlatform('android');
            
            // إظهار التنبيه بعد 5 ثوانٍ من دخول الموقع
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-500/20 p-4 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full"></div>
                
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-2 left-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                        <Download className="text-white" size={24} />
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">تثبيت تطبيق LibyPort</h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                            {platform === 'ios' 
                                ? 'اضغط على أيقونة المشاركة ثم "إضافة إلى الشاشة الرئيسية"' 
                                : 'ثبت التطبيق على هاتفك للوصول السريع ومتابعة شحناتك'}
                        </p>
                    </div>

                    {platform === 'ios' ? (
                        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-100 dark:border-gray-800">
                            <Share size={20} className="text-blue-500 animate-bounce" />
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                // في أندرويد المتصفح سيتعامل مع الـ Install prompt تلقائياً إذا كان الـ Manifest صحيحاً
                                // هنا نوجه المستخدم فقط
                                setShowPrompt(false);
                            }}
                            className="bg-amber-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                        >
                            تثبيت الآن
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileInstallPrompt;
