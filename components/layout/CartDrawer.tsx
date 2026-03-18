
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

// --- Professional Icons ---
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const MinusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>;

import { useNotification } from '../../context/NotificationContext';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { cart, products, updateCartQuantity, removeFromCart, clearCart } = useAppContext();
    const { showConfirm } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();

    const subtotal = useMemo(() => {
        return (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Sidebar Cart */}
            <aside
                className={`fixed top-0 left-0 h-full w-full max-w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-[130] transform transition-transform duration-500 ease-out flex flex-col ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                dir="rtl"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none">سلة المشتريات</h2>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">{(cart || []).length} أصناف في السلة</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-gray-50/30 dark:bg-gray-900/30">
                    {(cart || []).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60 animate-fade-in">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <ShoppingCartIcon />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white">سلة المشتريات فارغة</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[240px]">لم تقم بإضافة أي منتجات للسلة بعد. ابدأ بالتسوق الآن!</p>
                            <button 
                                onClick={() => { onClose(); navigate('/instant-products'); }}
                                className="mt-8 bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 px-8 py-3 rounded-2xl font-black text-sm shadow-xl"
                            >
                                تسوق المنتجات الفورية
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => {
                                const product = products.find(p => p.id === item.productId);
                                const isInstant = product?.isInstant;
                                
                                return (
                                    <div key={`${item.productId}-${item.size}`} className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 group hover:shadow-md transition-all animate-fade-in-up">
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            <img 
                                                src={item.image || product?.image || 'https://placehold.co/100x100?text=No+Image'} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover rounded-2xl shadow-inner border dark:border-gray-600" 
                                            />
                                            {isInstant && (
                                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg border-2 border-white dark:border-gray-900 uppercase">
                                                    فوري
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 pr-1">
                                                    <h3 className="font-black text-gray-900 dark:text-white text-sm leading-tight truncate" title={item.name}>{item.name}</h3>
                                                    {item.size && (
                                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 font-bold mt-1 inline-block">
                                                            المقاس: {item.size}
                                                        </span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => removeFromCart(item.productId, item.size)} 
                                                    className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                            
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                                    <button 
                                                        onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1), item.size)}
                                                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <MinusIcon />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-black text-gray-900 dark:text-white">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.size)}
                                                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <PlusIcon />
                                                    </button>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-yellow-600 dark:text-yellow-400">
                                                        {(item.price * item.quantity).toLocaleString()} <span className="text-[10px] font-bold opacity-60">د.ل</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {(cart || []).length > 0 && (
                    <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[3rem]">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-bold uppercase tracking-wider">المجموع الفرعي</span>
                                <span className="font-mono font-bold text-sm">{subtotal.toLocaleString()} د.ل</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-bold uppercase tracking-wider">رسوم الخدمة</span>
                                <span className="font-bold text-xs text-green-500">حسب نوع الطلب</span>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-black text-gray-900 dark:text-white">الإجمالي التقديري</span>
                                <span className="text-2xl font-black text-yellow-600">{subtotal.toLocaleString()} <span className="text-xs font-normal">د.ل</span></span>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            <button 
                                onClick={handleCheckout} 
                                className="col-span-4 bg-yellow-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transform transition-all active:scale-95"
                            >
                                متابعة لإنشاء الفاتورة
                            </button>
                            <button 
                                onClick={async () => { 
                                    const confirmed = await showConfirm('إفراغ السلة', 'هل تريد إفراغ السلة بالكامل؟');
                                    if (confirmed) clearCart(); 
                                }} 
                                className="col-span-1 bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all"
                                title="إفراغ السلة"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                        
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                            نظام LibyPort • بوابة طرابلس العالمية
                        </p>
                    </div>
                )}
            </aside>
        </>
    );
};

export default CartDrawer;
