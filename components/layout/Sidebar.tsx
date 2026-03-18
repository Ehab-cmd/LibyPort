
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';

// --- Icons ---
const HomeIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" /></svg>;
const DashboardIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
const InvoicesIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /><path d="M9 14h6m-6 4h6" /></svg>;
const SalesIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const PlusIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v6m3-3H9" /><circle cx="12" cy="12" r="9" /></svg>;
const TruckIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const ProductIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
const StoreIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const UsersIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
const FinancialsIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M12 12h.01M16 12h.01M8 12h.01" /></svg>;
const CurrencyIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChatIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const SettingsIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 014 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
const TreasuryIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const TagIcon = () => <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.01" /></svg>;

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SidebarItem = React.memo(({ to, icon, label, active, onClick, badge, language }: { to: string, icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number, language: string }) => {
    const textAlign = language === 'ar' ? 'text-right' : 'text-left';
    const baseClass = `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 ${textAlign} font-black text-[11px] md:text-[13px] transition-all duration-300 rounded-none md:rounded-lg mx-0 md:mx-2 mb-1 group`;
    
    const activeClass = active 
        ? (to === '/dashboard' ? 'bg-[#eeb111] text-white shadow-lg shadow-yellow-500/20 z-10' : 'bg-[#fff9c4] text-[#eeb111] border border-yellow-100/50 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-900/30')
        : 'text-[#2d3436] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#eeb111]';

    return (
        <ReactRouterDOM.Link to={to} className={`${baseClass} ${activeClass}`} onClick={onClick}>
            {icon}
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/20`}>
                    {badge}
                </span>
            )}
        </ReactRouterDOM.Link>
    );
});

const Sidebar: React.FC<SidebarProps> = React.memo(({ isOpen, onClose }) => {
    const { currentUser, chatMessages, t, language } = useAppContext();
    const location = ReactRouterDOM.useLocation();

    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);
    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    const unreadChatCount = useMemo(() => {
        if (!currentUser) return 0;
        return chatMessages.filter(msg => !msg.isRead && msg.senderId !== currentUser.id && (isAdmin || msg.conversationId === currentUser.id)).length;
    }, [chatMessages, currentUser, isAdmin]);

    const sidebarContent = useMemo(() => (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
            <div className="p-2 md:p-3 mb-1">
                <ReactRouterDOM.Link to="/dashboard" className="flex items-center gap-1.5 group">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-md md:rounded-lg shadow-md p-1 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                         <img src="https://up6.cc/2025/10/176278012677161.jpg" alt="LibyPort" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                        <h1 className="text-sm md:text-base font-black text-gray-900 dark:text-white leading-none tracking-tighter">LibyPort</h1>
                        <span className="text-[5px] md:text-[6px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5 block">Enterprise Hub</span>
                    </div>
                </ReactRouterDOM.Link>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar pt-1 pb-6 space-y-0.5">
                <SidebarItem to="/" icon={<HomeIcon />} label={language === 'ar' ? 'واجهة الموقع الرئيسية' : 'Main Website'} active={location.pathname === '/'} onClick={onClose} language={language} />
                
                <div className="mx-6 my-2 border-t border-gray-100 dark:border-gray-800"></div>

                <SidebarItem to="/dashboard" icon={<DashboardIcon />} label={t('dashboard')} active={location.pathname === '/dashboard'} onClick={onClose} language={language} />
                <SidebarItem to="/orders" icon={<InvoicesIcon />} label={t('orders')} active={location.pathname === '/orders'} onClick={onClose} language={language} />

                {isAdmin && (
                    <SidebarItem to="/sales-invoices" icon={<SalesIcon />} label={language === 'ar' ? 'فواتير المبيعات' : 'Sales Invoices'} active={location.pathname.startsWith('/sales-invoices')} onClick={onClose} language={language} />
                )}

                <SidebarItem to="/orders/new" icon={<PlusIcon />} label={t('newOrder')} active={location.pathname.startsWith('/orders/new')} onClick={onClose} language={language} />
                <SidebarItem to="/shipments" icon={<TruckIcon />} label={t('shipments')} active={location.pathname.startsWith('/shipments')} onClick={onClose} language={language} />
                <SidebarItem to="/products" icon={<ProductIcon />} label={t('products')} active={location.pathname === '/products'} onClick={onClose} language={language} />
                <SidebarItem to="/dashboard/instant-products" icon={<StoreIcon />} label={t('instantProducts')} active={location.pathname.startsWith('/dashboard/instant-products')} onClick={onClose} language={language} />
                <SidebarItem to="/dashboard/delivery-prices" icon={<TagIcon />} label="أسعار التوصيل" active={location.pathname.startsWith('/dashboard/delivery-prices')} onClick={onClose} language={language} />
                <SidebarItem to="/customers" icon={<UsersIcon />} label={t('customers')} active={location.pathname.startsWith('/customers')} onClick={onClose} language={language} />

                {isAdmin && (
                    <SidebarItem to="/clients" icon={<FinancialsIcon />} label={language === 'ar' ? 'سجل الزبائن المالي' : 'Customers Ledger'} active={location.pathname.startsWith('/clients')} onClick={onClose} language={language} />
                )}

                {isAdmin && (
                    <SidebarItem to="/reports" icon={<DashboardIcon />} label={t('reports')} active={location.pathname.startsWith('/reports')} onClick={onClose} language={language} />
                )}

                <SidebarItem to="/financials" icon={<FinancialsIcon />} label={t('financials')} active={location.pathname.startsWith('/financials')} onClick={onClose} language={language} />

                {isAdmin && (
                    <SidebarItem to="/treasury-management" icon={<TreasuryIcon />} label="إدارة الخزائن والعهد" active={location.pathname.startsWith('/treasury-management')} onClick={onClose} language={language} />
                )}

                {isSuperAdmin && (
                    <SidebarItem to="/currencies" icon={<CurrencyIcon />} label={language === 'ar' ? 'خزينة العملات' : 'Currency Treasury'} active={location.pathname.startsWith('/currencies')} onClick={onClose} language={language} />
                )}

                <SidebarItem to="/support" icon={<ChatIcon />} label={t('support')} active={location.pathname.startsWith('/support')} onClick={onClose} language={language} badge={unreadChatCount} />

                {isAdmin && (
                    <>
                        <div className="pt-2 pb-0.5 px-4 border-t border-gray-100 dark:border-gray-800 mt-1">
                            <span className={`text-[8px] font-black text-gray-400 uppercase tracking-[0.25em] block ${language === 'ar' ? 'text-right' : 'text-left'} opacity-60`}>
                                {language === 'ar' ? 'إدارة النظام' : 'SYSTEM ADMIN'}
                            </span>
                        </div>
                        
                        <SidebarItem to="/company-financials" icon={<FinancialsIcon />} label={language === 'ar' ? 'إدارة مالية الشركة' : 'Company Financials'} active={location.pathname.startsWith('/company-financials')} onClick={onClose} language={language} />
                        <SidebarItem to="/stores" icon={<HomeIcon />} label={language === 'ar' ? 'المتاجر' : 'Stores'} active={location.pathname.startsWith('/stores')} onClick={onClose} language={language} />
                        <SidebarItem to="/users" icon={<UsersIcon />} label={language === 'ar' ? 'المستخدمين' : 'Users'} active={location.pathname.startsWith('/users')} onClick={onClose} language={language} />
                        <SidebarItem to="/settings" icon={<SettingsIcon />} label={t('settings')} active={location.pathname.startsWith('/settings')} onClick={onClose} language={language} />
                    </>
                )}
            </nav>
        </div>
    ), [isAdmin, isSuperAdmin, language, location.pathname, onClose, t, unreadChatCount]);

    return (
        <>
            <aside className={`hidden md:flex flex-col w-[220px] h-full bg-white dark:bg-gray-900 shadow-[10px_0_40px_rgba(0,0,0,0.03)] z-30 flex-shrink-0 border-${language === 'ar' ? 'l' : 'r'} border-gray-50 dark:border-gray-800`}>
                {sidebarContent}
            </aside>
            <div className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-[220px] bg-white dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
                {sidebarContent}
            </aside>
        </>
    );
});

export default Sidebar;
