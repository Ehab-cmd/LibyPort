
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

// --- Icons (Reused from Sidebar or similar) ---
const HomeIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" /></svg>;
const DashboardIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
const InvoicesIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /><path d="M9 14h6m-6 4h6" /></svg>;
const SalesIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const PlusIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v6m3-3H9" /><circle cx="12" cy="12" r="9" /></svg>;
const TruckIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const ProductIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
const StoreIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
const FinancialsIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M12 12h.01M16 12h.01M8 12h.01" /></svg>;
const CurrencyIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChatIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const SettingsIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
const TreasuryIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const TagIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.01" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

interface MobileMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenuModal: React.FC<MobileMenuModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, t, language, chatMessages } = useAppContext();
    const location = ReactRouterDOM.useLocation();

    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);
    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    const unreadChatCount = useMemo(() => {
        if (!currentUser) return 0;
        return chatMessages.filter(msg => !msg.isRead && msg.senderId !== currentUser.id && (isAdmin || msg.conversationId === currentUser.id)).length;
    }, [chatMessages, currentUser, isAdmin]);

    const menuItems = useMemo(() => {
        const items = [
            { to: '/dashboard', icon: <DashboardIcon />, label: t('dashboard') },
            { to: '/orders', icon: <InvoicesIcon />, label: t('orders') },
            { to: '/orders/new', icon: <PlusIcon />, label: t('newOrder') },
            { to: '/shipments', icon: <TruckIcon />, label: t('shipments') },
            { to: '/products', icon: <ProductIcon />, label: t('products') },
            { to: '/dashboard/instant-products', icon: <StoreIcon />, label: t('instantProducts') },
            { to: '/dashboard/delivery-prices', icon: <TagIcon />, label: "أسعار التوصيل" },
            { to: '/customers', icon: <UsersIcon />, label: t('customers') },
            { to: '/financials', icon: <FinancialsIcon />, label: t('financials') },
            { to: '/support', icon: <ChatIcon />, label: t('support'), badge: unreadChatCount },
        ];

        if (isAdmin) {
            items.splice(2, 0, { to: '/sales-invoices', icon: <SalesIcon />, label: language === 'ar' ? 'فواتير المبيعات' : 'Sales Invoices' });
            items.push({ to: '/clients', icon: <FinancialsIcon />, label: language === 'ar' ? 'سجل الزبائن المالي' : 'Customers Ledger' });
            items.push({ to: '/reports', icon: <DashboardIcon />, label: t('reports') });
            items.push({ to: '/treasury-management', icon: <TreasuryIcon />, label: "إدارة الخزائن" });
            items.push({ to: '/company-financials', icon: <FinancialsIcon />, label: language === 'ar' ? 'مالية الشركة' : 'Company Financials' });
            items.push({ to: '/stores', icon: <HomeIcon />, label: language === 'ar' ? 'المتاجر' : 'Stores' });
            items.push({ to: '/users', icon: <UsersIcon />, label: language === 'ar' ? 'المستخدمين' : 'Users' });
            items.push({ to: '/settings', icon: <SettingsIcon />, label: t('settings') });
        }

        if (isSuperAdmin) {
            items.push({ to: '/currencies', icon: <CurrencyIcon />, label: language === 'ar' ? 'خزينة العملات' : 'Currency Treasury' });
        }

        return items;
    }, [isAdmin, isSuperAdmin, language, t, unreadChatCount]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
                    >
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-yellow-500/20">
                                    <DashboardIcon />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-gray-900 dark:text-white leading-none">قائمة التحكم</h2>
                                    <p className="text-[8px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">LibyPort Navigation</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-1.5 bg-white dark:bg-gray-700 text-gray-400 rounded-full hover:text-red-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-600"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[60vh]">
                            <div className="grid grid-cols-4 gap-2">
                                {menuItems.map((item, idx) => {
                                    const isActive = location.pathname === item.to;
                                    return (
                                        <ReactRouterDOM.Link 
                                            key={idx}
                                            to={item.to}
                                            onClick={onClose}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 group relative ${
                                                isActive 
                                                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/10' 
                                                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:text-yellow-600'
                                            }`}
                                        >
                                            <div className={`mb-1 transition-transform group-active:scale-90 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-yellow-500'} scale-75`}>
                                                {item.icon}
                                            </div>
                                            <span className="text-[7px] font-black text-center leading-tight line-clamp-2 h-4 flex items-center">
                                                {item.label}
                                            </span>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 text-white text-[6px] font-black rounded-full flex items-center justify-center shadow-md">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </ReactRouterDOM.Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">System Active</span>
                                </div>
                                <span className="text-[8px] font-black text-gray-400">v1.2.0</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MobileMenuModal;
