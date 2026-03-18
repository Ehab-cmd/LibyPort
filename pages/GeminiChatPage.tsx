import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { useAppContext } from '../context/AppContext';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

// Avatar Component
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


const GeminiChatPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial welcome message
        setMessages([{
            role: 'model',
            text: 'مرحباً! أنا مساعد LibyPort الذكي. كيف يمكنني مساعدتك في تحليل أعمالك اليوم؟'
        }]);
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        
        const userMessage = { role: 'user' as const, text: prompt };
        // Build history for the chat from existing messages
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);

        try {
            // Instantiate GoogleGenAI right before making the call as per guidelines
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chat = ai.chats.create({
                model: 'gemini-3-flash-preview', // Use recommended flash model for basic text tasks
                history: history,
                config: {
                    systemInstruction: "You are a helpful business assistant for 'LibyPort', a shipping and e-commerce logistics company based in Tripoli, Libya. Your role is to analyze data and provide insights to store owners and administrators. When asked for data analysis, be concise and clear. When asked for business advice (like marketing or sales strategies), be creative and provide actionable steps. Always maintain a professional and encouraging tone. Your responses should be in Arabic.",
                },
            });

            const response = await chat.sendMessageStream({ message: prompt });
            for await (const chunk of response) {
                const c = chunk as GenerateContentResponse;
                setMessages(prevMessages => {
                    if (prevMessages.length === 0) return prevMessages;
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    const updatedMessages = [
                        ...prevMessages.slice(0, -1),
                        {
                            ...lastMessage,
                            text: lastMessage.text + (c.text || ''), // Directly access .text property
                        },
                    ];
                    return updatedMessages;
                });
            }
        } catch (e: any) {
            console.error("Error sending message to Gemini:", e);
            const errorMessage = "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.";
            setError(errorMessage);
            setMessages(prevMessages => {
                if (prevMessages.length === 0) return prevMessages;
                const lastMessage = prevMessages[prevMessages.length - 1];
                const updatedMessages = [
                    ...prevMessages.slice(0, -1),
                    {
                        ...lastMessage,
                        text: errorMessage,
                    },
                ];
                return updatedMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
        setUserInput('');
    };
    
    const promptStarters = [
        "أنشئ ملخصاً للمبيعات في الأسبوع الماضي",
        "اقترح 3 أفكار تسويقية لزيادة المبيعات",
        "ما هي المنتجات الأكثر مبيعاً؟",
        "كيف يمكنني تحسين إدارة المخزون؟"
    ];

    return (
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900" dir="rtl">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                             <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold flex-shrink-0">G</div>
                        )}
                        <div className={`max-w-xl p-4 rounded-2xl whitespace-pre-wrap ${
                            msg.role === 'user' 
                                ? 'bg-yellow-500 text-white rounded-br-none' 
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                         {msg.role === 'user' && currentUser && (
                             <Avatar name={currentUser.name} src={currentUser.profilePicture} className="w-10 h-10" />
                        )}
                    </div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.text === '' && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold flex-shrink-0">G</div>
                        <div className="max-w-xl p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm">
                            <span className="animate-pulse">Gemini يفكر...</span>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
                 
                {messages.length <= 1 && !isLoading && (
                    <div className="pt-8">
                        <h3 className="text-center text-gray-500 dark:text-gray-400 font-semibold mb-4">أو جرب أحد هذه الاقتراحات:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {promptStarters.map(prompt => (
                                <button key={prompt} onClick={() => handleSendMessage(prompt)} className="p-4 bg-white dark:bg-gray-800 rounded-lg text-right shadow-sm hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="اسأل Gemini أي شيء عن أعمالك..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-600 dark:placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 disabled:bg-gray-400 transition-colors" disabled={isLoading || !userInput.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GeminiChatPage;