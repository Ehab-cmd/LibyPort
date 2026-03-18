
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { UserRole, AppNotification } from '../../types';

// --- Minimalist Professional Icons ---
const ShoppingBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const MegaphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#f84b4b]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
    </svg>
);

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

interface HeaderProps {
    onMenuClick: () => void;
    onCartClick: () => void;
}

const HeaderAvatar: React.FC<{ name: string; src?: string | null; className?: string; textSize?: string }> = ({ name, src, className = 'w-10 h-10', textSize = 'text-sm' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const gradients = [
        'from-rose-500 to-rose-600', 'from-amber-500 to-amber-600', 'from-emerald-500 to-emerald-600',
        'from-sky-500 to-sky-600', 'from-indigo-500 to-indigo-600', 'from-purple-500 to-purple-600'
    ];
    const getGradient = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return gradients[Math.abs(hash) % gradients.length];
    };
    if (src) {
        return (
            <div className={`relative ${className} group`}>
                <img src={src} alt={name} className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10"></div>
            </div>
        );
    }
    return (
        <div className={`rounded-full flex items-center justify-center font-black text-white bg-gradient-to-br ${getGradient(name)} shadow-xl ring-2 ring-white dark:ring-gray-800 transform active:scale-95 transition-all ${className}`}>
            <span className={`${textSize} drop-shadow-md select-none`}>{initial}</span>
        </div>
    );
};

const Header: React.FC<HeaderProps> = React.memo(({ onMenuClick, onCartClick }) => {
    const { currentUser, logout, notifications, markNotificationsAsRead, markNotificationAsRead, cart, theme, setTheme, language, setLanguage, t } = useAppContext();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifMenuRef = useRef<HTMLDivElement>(null);
    const navigate = ReactRouterDOM.useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
            if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userNotifications = useMemo(() => {
        if (!currentUser) return [];
        return notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [notifications, currentUser]);

    const unreadCount = useMemo(() => userNotifications.filter(n => !n.isRead).length, [userNotifications]);
    const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.isRead) await markNotificationAsRead(notif.id);
        setIsNotificationsOpen(false);
        if (notif.link) navigate(notif.link);
    };

    return (
        <header className="sticky top-0 z-50 py-1 md:py-2 no-print">
            <div className="container mx-auto px-2 md:px-4">
                <div className="max-w-5xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 md:px-5 py-1.5 md:py-2">
                    
                    {/* Left Section: Language Toggle (Hidden menu button removed) */}
                    <div className="flex items-center gap-3">
                        {/* Compact Language Toggle */}
                        <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                            <button 
                                onClick={() => setLanguage('ar')}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${language === 'ar' ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                AR
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                EN
                            </button>
                        </div>
                    </div>

                    {/* Right Section: Actions & Profile */}
                    <div className="flex items-center gap-2">
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="p-2 md:p-2.5 rounded-full text-gray-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            title={theme === 'light' ? t('darkMode') : t('lightMode')}
                        >
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>

                        {currentUser && (
                            <>
                                {/* Cart Button */}
                                <div className="relative">
                                    <button onClick={onCartClick} className="p-2 md:p-2.5 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative">
                                        <ShoppingBagIcon />
                                        {cartItemCount > 0 && (
                                            <span className="absolute top-1 md:top-1.5 right-1 md:right-1.5 flex h-3 w-3 md:h-3.5 md:w-3.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 md:h-3.5 md:w-3.5 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                                            </span>
                                        )}
                                    </button>
                                </div>
                                
                                {/* Notification Toggle */}
                                <div className="relative" ref={notifMenuRef}>
                                    <button 
                                        onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsUserMenuOpen(false); }} 
                                        className={`p-2 md:p-2.5 rounded-full transition-all relative ${isNotificationsOpen ? 'bg-gray-100 dark:bg-gray-800 text-yellow-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        <BellIcon />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 md:top-1.5 right-1 md:right-1.5 flex h-3 w-3 md:h-3.5 md:w-3.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 md:h-3.5 md:w-3.5 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown (Floating style) */}
                                    {isNotificationsOpen && (
                                        <div className={`fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:top-full ${language === 'ar' ? 'sm:left-0' : 'sm:right-0'} sm:mt-4 sm:w-80 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden z-[100] border border-gray-100 dark:border-gray-700 animate-fade-in-up`}>
                                            <div className="p-5 flex justify-between items-center border-b dark:border-gray-700">
                                                <span className="font-black text-sm dark:text-white">الإشعارات</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        markNotificationsAsRead();
                                                    }} 
                                                    className="text-[10px] font-black text-yellow-600 hover:underline transition-all"
                                                >
                                                    تحديد كمقروء
                                                </button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                                {userNotifications.length > 0 ? (
                                                    userNotifications.map(n => (
                                                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!n.isRead ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><MegaphoneIcon /></div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight mb-1">{n.message}</p>
                                                                <p className="text-[9px] text-gray-400">{new Date(n.date).toLocaleDateString('ar-LY')}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-gray-400 text-xs font-bold">لا توجد تنبيهات جديدة</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Menu Profile Button */}
                                <div className="relative mr-1 border-r border-gray-100 dark:border-gray-800 pr-1 md:pr-2" ref={userMenuRef}>
                                    <button 
                                        onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotificationsOpen(false); }} 
                                        className="flex items-center gap-2 pl-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all p-0.5"
                                    >
                                        <div className="hidden sm:block text-right">
                                            <p className="text-[9px] font-black text-gray-900 dark:text-white leading-none mb-0.5">{currentUser.name.split(' ')[0]}</p>
                                            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">{currentUser.role}</p>
                                        </div>
                                        <HeaderAvatar name={currentUser.name} src={currentUser.profilePicture} className="w-5 h-5 md:w-6 h-6" textSize="text-[8px] md:text-[10px]" />
                                    </button>

                                    {/* User Dropdown */}
                                    {isUserMenuOpen && (
                                        <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[100] border border-gray-100 dark:border-gray-700 animate-fade-in-up`}>
                                            <div className="p-1.5 space-y-0.5">
                                                <ReactRouterDOM.Link 
                                                    to="/settings" 
                                                    onClick={() => setIsUserMenuOpen(false)} 
                                                    className="flex items-center gap-2 px-3 py-2 text-[11px] font-black text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                                                >
                                                    <UserIcon /> <span>الملف الشخصي</span>
                                                </ReactRouterDOM.Link>
                                                <button 
                                                    onClick={() => { logout(); setIsUserMenuOpen(false); }} 
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                >
                                                    <LogoutIcon /> <span>تسجيل الخروج</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
});

export default Header;
