
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const SpiritRobot: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { currentUser, language } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);
    const [thought, setThought] = useState<string | null>(null);

    const thoughts = useMemo(() => [
        "أهلاً بك! أنا ليبوبوت 🤖",
        "النظام يعمل بسرعة البرق ⚡",
        "هل قمت بمراجعة شحناتك؟",
        "أنا أحمي بياناتك بدقة 🛡️",
        "يوم مليء بالأرباح إن شاء الله 💰",
        "تحتاج مساعدة؟ أنا هنا!",
        "LibyPort هو رفيقك للنجاح",
        "كل شيء يسير حسب الخطة 😎"
    ], []);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1200);
        
        const thoughtTimer = setInterval(() => {
            if (document.visibilityState === 'visible') {
                const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
                setThought(randomThought);
                setTimeout(() => setThought(null), 5000);
            }
        }, 35000);

        return () => {
            clearTimeout(timer);
            clearInterval(thoughtTimer);
        };
    }, [thoughts]);

    if (!currentUser) return null;

    return (
        <div 
            className={`fixed bottom-24 md:bottom-12 ${language === 'ar' ? 'left-6' : 'right-6'} z-[100] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        >
            <style>
                {`
                @keyframes robot-hover {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes robot-shadow-glow {
                    0% { transform: scale(1); opacity: 0.3; filter: blur(8px); }
                    50% { transform: scale(0.8); opacity: 0.15; filter: blur(12px); }
                    100% { transform: scale(1); opacity: 0.3; filter: blur(8px); }
                }
                .robot-main-float {
                    animation: robot-hover 4s ease-in-out infinite;
                }
                .robot-ground-shadow {
                    animation: robot-shadow-glow 4s ease-in-out infinite;
                }
                `}
            </style>

            <div className="relative group cursor-pointer" onClick={onClick}>
                {/* فقاعة الأفكار */}
                {thought && (
                    <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 w-44 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/30 text-[11px] font-black text-center text-gray-700 dark:text-gray-200 animate-fade-in-up">
                        {thought}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 dark:bg-gray-800/90 border-r border-b border-blue-100 dark:border-blue-900/30 rotate-45"></div>
                    </div>
                )}

                {/* جسم الروبوت */}
                <div className="robot-main-float relative z-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 relative transform group-hover:scale-110 transition-transform duration-500">
                        
                        {/* تصميم روبوت SVG مدمج عالي الجودة */}
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                            {/* الرأس */}
                            <rect x="25" y="15" width="50" height="40" rx="15" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1"/>
                            <rect x="30" y="25" width="40" height="20" rx="10" fill="#2d3436"/>
                            {/* العينين */}
                            <circle cx="40" cy="35" r="4" fill="#00d2ff" className="animate-pulse">
                                <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="60" cy="35" r="4" fill="#00d2ff" className="animate-pulse">
                                <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                            {/* الجسم */}
                            <rect x="20" y="58" width="60" height="35" rx="12" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1"/>
                            {/* اليدين */}
                            <rect x="12" y="65" width="8" height="20" rx="4" fill="#dee2e6"/>
                            <rect x="80" y="65" width="8" height="20" rx="4" fill="#dee2e6"/>
                        </svg>

                        {/* شعار الشركة المصغر في منتصف صدر الروبوت */}
                        <div className="absolute top-[70%] left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full p-1 border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
                            <img src="https://up6.cc/2025/10/176278012677161.jpg" alt="Logo" className="w-full h-full object-contain" />
                        </div>

                        {/* تأثير الوهج الأزرق خلف الروبوت */}
                        <div className="absolute inset-4 bg-blue-400/10 blur-3xl rounded-full -z-10 group-hover:bg-blue-400/20 transition-all"></div>
                    </div>
                </div>

                {/* الظل الديناميكي على الأرضية */}
                <div className="robot-ground-shadow mx-auto mt-2 w-10 h-2 bg-blue-900/10 dark:bg-blue-400/5 rounded-full blur-md"></div>

                {/* إشارة النشاط */}
                <div className="absolute top-2 right-4 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow-lg animate-pulse z-20"></div>
            </div>
        </div>
    );
};

export default SpiritRobot;
