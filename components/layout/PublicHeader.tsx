
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

// الأيقونة المستخدمة للسلة
const ShoppingBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

interface PublicHeaderProps {
    onCartClick: () => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ onCartClick }) => {
    const { currentUser, cart } = useAppContext();
    const location = ReactRouterDOM.useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const cartItemCount = useMemo(() => (cart || []).reduce((sum, item) => sum + item.quantity, 0), [cart]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'الرئيسية', path: '/' },
        { name: 'متجر LibyPort', path: '/instant-products' },
        { name: 'حاسبة التكاليف', path: '/shipping-calculator' },
        { name: 'تتبع الشحنات', path: '/track' },
        { name: 'تواصل معنا', path: '/contact-us' },
    ];

    const getNavLinkClass = (path: string, end: boolean = false) => {
        const isActive = end ? location.pathname === path : location.pathname.startsWith(path);
        return `relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
        isActive
            ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`;
    };

    return (
        <header 
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled 
                ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' 
                : 'bg-white dark:bg-gray-900 border-b border-transparent'
            }`}
        >
            <nav className="container mx-auto px-3 md:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12 md:h-16">
                    <div className="flex items-center gap-3 md:gap-8">
                        <ReactRouterDOM.Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
                            <img 
                                src="https://up6.cc/2025/10/176278012677161.jpg" 
                                alt="LibyPort Logo" 
                                className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform bg-white"
                                referrerPolicy="no-referrer"
                            />
                            <span className="text-sm md:text-xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                                Liby<span className="text-yellow-500">Port</span>
                            </span>
                        </ReactRouterDOM.Link>
                        
                        <div className="hidden lg:block">
                            <div className="flex items-center space-x-1 space-x-reverse">
                                {navLinks.map((link) => (
                                    <ReactRouterDOM.Link key={link.name} to={link.path} className={getNavLinkClass(link.path, link.path === '/')}>
                                        {link.name}
                                    </ReactRouterDOM.Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* زر السلة */}
                        <button 
                            onClick={onCartClick} 
                            className="relative p-1.5 md:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"
                        >
                            <ShoppingBagIcon />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] md:text-[10px] font-black w-3.5 h-3.5 md:w-5 md:h-5 rounded-full flex items-center justify-center border md:border-2 border-white dark:border-gray-900 shadow-sm animate-bounce">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        {/* زر لوحة التحكم أو الدخول - يظهر دائماً الآن */}
                        <div className="flex items-center gap-2 md:gap-3 md:border-r md:pr-4 dark:border-gray-800">
                            {currentUser ? (
                                <ReactRouterDOM.Link 
                                    to="/dashboard" 
                                    className="bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-sm font-black hover:bg-gray-800 dark:hover:bg-yellow-600 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <span className="hidden xs:inline">لوحة التحكم</span>
                                    <span className="xs:hidden">اللوحة</span>
                                </ReactRouterDOM.Link>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <ReactRouterDOM.Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-xs md:text-sm font-bold transition-colors">
                                        دخول
                                    </ReactRouterDOM.Link>
                                    <ReactRouterDOM.Link to="/register" className="bg-yellow-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold hover:bg-yellow-600 transition-all shadow-lg">
                                        تسجيل
                                    </ReactRouterDOM.Link>
                                </div>
                            )}
                        </div>

                        {/* موبايل منيو */}
                        <div className="flex lg:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-800 dark:text-gray-300 p-2">
                                {isMobileMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* القائمة الجانبية للموبايل - Sidebar Style */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                        />
                        
                        {/* Sidebar Content */}
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 bottom-0 w-[280px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800"
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 flex items-center justify-between border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 bg-white dark:bg-gray-700 text-gray-500 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-gray-900 dark:text-white">Liby<span className="text-yellow-500">Port</span></span>
                                    <img 
                                        src="https://up6.cc/2025/10/176278012677161.jpg" 
                                        alt="Logo" 
                                        className="w-8 h-8 rounded-lg bg-white p-0.5"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </div>

                            {/* Sidebar Body */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                                {currentUser && (
                                    <ReactRouterDOM.Link 
                                        to="/dashboard" 
                                        className="flex items-center justify-between px-4 py-3 rounded-2xl bg-yellow-500 text-gray-900 font-black mb-6 shadow-lg shadow-yellow-500/20"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-sm">لوحة التحكم الرئيسية</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </ReactRouterDOM.Link>
                                )}
                                
                                <div className="space-y-1">
                                    {navLinks.map((link) => {
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <ReactRouterDOM.Link 
                                                key={link.name} 
                                                to={link.path} 
                                                className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                                    isActive 
                                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {link.name}
                                            </ReactRouterDOM.Link>
                                        );
                                    })}
                                </div>
                                
                                {!currentUser && (
                                    <div className="pt-6 mt-6 border-t dark:border-gray-800 flex flex-col gap-3">
                                        <ReactRouterDOM.Link 
                                            to="/login" 
                                            className="text-center py-3.5 font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-2xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            تسجيل الدخول
                                        </ReactRouterDOM.Link>
                                        <ReactRouterDOM.Link 
                                            to="/register" 
                                            className="text-center py-3.5 bg-yellow-500 text-gray-900 rounded-2xl font-black shadow-lg shadow-yellow-500/20 text-sm hover:bg-yellow-400 transition-colors" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            إنشاء حساب جديد
                                        </ReactRouterDOM.Link>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-4 border-t dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">© 2025 LibyPort Global</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default PublicHeader;
