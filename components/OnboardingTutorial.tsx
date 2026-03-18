
import React, { useState } from 'react';

const steps = [
    {
        title: "أهلاً بك في عائلة LibyPort",
        desc: "لقد تم تصميم هذه المنظومة لتكون شريكك الذكي في إدارة مبيعاتك وشحناتك العالمية. دعنا نأخذك في جولة سريعة.",
        emoji: "👋",
        color: "bg-yellow-500"
    },
    {
        title: "إدارة الفواتير الذكية",
        desc: "من قسم 'الفواتير' يمكنك تسجيل مبيعاتك، متابعة العربون، وطباعة إيصالات احترافية لزبائنك بضغطة زر.",
        emoji: "📄",
        color: "bg-blue-500"
    },
    {
        title: "تتبع الشحنات اللحظي",
        desc: "تابع مسار بضاعتك من المتاجر العالمية حتى مخازننا في طرابلس. نظام التتبع يخطرك بكل حركة جديدة للشحنة.",
        emoji: "🚚",
        color: "bg-orange-500"
    },
    {
        title: "الإدارة المالية الدقيقة",
        desc: "راقب رصيدك المستحق، مسحوباتك، وتكاليف المشتريات. نظامنا المالي يضمن لك الشفافية الكاملة في كل قرش.",
        emoji: "💰",
        color: "bg-green-600"
    },
    {
        title: "جاهز للانطلاق؟",
        desc: "فريق الدعم الفني متواجد دائماً في قسم 'الدردشة' لمساعدتك. نتمنى لك تجارة مربحة وناجحة!",
        emoji: "🚀",
        color: "bg-purple-600"
    }
];

interface OnboardingTutorialProps {
    onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
                <div className={`${step.color} h-48 flex items-center justify-center text-7xl transition-colors duration-500`}>
                    <span className="animate-bounce">{step.emoji}</span>
                </div>
                
                <div className="p-10 text-center">
                    <div className="flex justify-center gap-1.5 mb-6">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-yellow-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}></div>
                        ))}
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{step.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10 font-medium">{step.desc}</p>

                    <button 
                        onClick={next}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {currentStep === steps.length - 1 ? 'ابدأ العمل الآن' : 'المتابعة'}
                    </button>
                    
                    {currentStep < steps.length - 1 && (
                        <button onClick={onComplete} className="mt-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-sm">تخطي الجولة</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingTutorial;
