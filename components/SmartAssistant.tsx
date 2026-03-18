
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { GoogleGenAI } from "@google/genai";
import { OrderType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const SmartAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { exchangeRate, shippingOrigins, currentUser } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const [activeTab, setActiveTab] = useState<'tools' | 'chat'>('tools');
    const [calcWeight, setCalcWeight] = useState('');
    const [calcOrigin, setCalcOrigin] = useState('');

    const handleQuickOrder = (type: OrderType) => {
        onClose();
        navigate('/orders/new', { state: { forceOrderType: type } });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" dir="rtl">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white flex justify-between items-center shadow-lg">
                    <div>
                        <h2 className="text-xl font-bold">مساعد LibyPort الذكي</h2>
                        <p className="text-xs opacity-80 italic">اختصارات سريعة لإدارة مبيعاتك</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                    <button onClick={() => setActiveTab('tools')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'tools' ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow' : 'text-gray-500'}`}>الأدوات السريعة</button>
                    <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow' : 'text-gray-500'}`}>دردشة AI</button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {activeTab === 'tools' ? (
                        <>
                            {/* Fast Actions */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">إضافة سريعة</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleQuickOrder(OrderType.Procurement)} className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl text-center group hover:bg-purple-500 hover:text-white transition-all">
                                        <div className="text-2xl mb-1">📦</div>
                                        <div className="text-xs font-bold">مبيعات خاصة</div>
                                    </button>
                                    <button onClick={() => handleQuickOrder(OrderType.NewPurchase)} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl text-center group hover:bg-blue-500 hover:text-white transition-all">
                                        <div className="text-2xl mb-1">🛒</div>
                                        <div className="text-xs font-bold">طلب جديد</div>
                                    </button>
                                </div>
                            </section>

                            {/* Quick Shipping Calc */}
                            <section className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" strokeWidth="2" /></svg>
                                    حاسبة شحن سريعة
                                </h3>
                                <div className="space-y-3">
                                    <input 
                                        type="number" 
                                        placeholder="الوزن (كجم)..." 
                                        value={calcWeight}
                                        onChange={e => setCalcWeight(e.target.value)}
                                        className="w-full p-3 bg-white dark:bg-gray-800 border rounded-xl" 
                                    />
                                    <select 
                                        value={calcOrigin}
                                        onChange={e => setCalcOrigin(e.target.value)}
                                        className="w-full p-3 bg-white dark:bg-gray-800 border rounded-xl"
                                    >
                                        <option value="">-- اختر بلد الشحن --</option>
                                        {shippingOrigins.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                    {calcWeight && calcOrigin && (
                                        <div className="p-3 bg-green-500 text-white rounded-xl text-center animate-pulse">
                                            <p className="text-xs font-bold uppercase mb-1">التكلفة التقديرية</p>
                                            <p className="text-xl font-black">
                                                {((parseFloat(calcWeight) || 0) * (shippingOrigins.find(o => o.id === calcOrigin)?.ratePerKgUSD || 0)).toLocaleString()} $
                                            </p>
                                            <p className="text-[10px] opacity-80">≈ {((parseFloat(calcWeight) || 0) * (shippingOrigins.find(o => o.id === calcOrigin)?.ratePerKgUSD || 0) * exchangeRate).toLocaleString()} د.ل</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="mt-auto p-4 text-center">
                                <p className="text-xs text-gray-500 italic">LibyPort Enterprise v2.5</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl">🤖</div>
                            <h3 className="font-bold text-lg dark:text-white">هل تحتاج مساعدة في النظام؟</h3>
                            <p className="text-sm text-gray-500">أنا هنا لمساعدتك في الاستعلام عن أي فاتورة أو تحليل مبيعاتك.</p>
                            <button onClick={() => { onClose(); navigate('/support'); }} className="bg-yellow-500 text-white px-8 py-2 rounded-full font-bold">ابدأ الدردشة الآن</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartAssistant;
