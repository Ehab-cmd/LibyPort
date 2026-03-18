
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

// Refined Icons with consistent stroke width
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const OrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const ShipmentsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

interface BottomNavProps {
    onMenuClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onMenuClick }) => {
    const location = ReactRouterDOM.useLocation();

    const getLinkClass = (path: string, end: boolean = false) => {
        const isActive = end ? location.pathname === path : location.pathname.startsWith(path);
        
        return `relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-out group ${
            isActive 
                ? 'text-yellow-600 dark:text-yellow-400 -translate-y-1' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`;
    };

    const getFabClass = () => {
        const isActive = location.pathname === '/orders/new';
        return `absolute flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full shadow-lg shadow-yellow-500/30 border-[3px] border-gray-100 dark:border-gray-900 transition-all duration-300 transform active:scale-90 hover:scale-105 hover:shadow-yellow-500/50 ${
            isActive 
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-2 ring-yellow-200 dark:ring-yellow-900' 
                : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
        }`;
    };

    const activeDot = (
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full opacity-100 transition-opacity duration-300"></span>
    );

    return (
        <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden pointer-events-none">
            {/* Container */}
            <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 h-[52px] md:h-[70px] rounded-2xl md:rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 px-2 pointer-events-auto flex justify-between items-center relative">
                
                <ReactRouterDOM.Link to="/dashboard" className={getLinkClass('/dashboard', true)}>
                    <DashboardIcon />
                    <span className="text-[9px] font-bold opacity-80">الرئيسية</span>
                    {location.pathname === '/dashboard' && activeDot}
                </ReactRouterDOM.Link>
                
                <ReactRouterDOM.Link to="/orders" className={getLinkClass('/orders', true)}>
                    <OrdersIcon />
                    <span className="text-[9px] font-bold opacity-80">الفواتير</span>
                    {location.pathname === '/orders' && activeDot}
                </ReactRouterDOM.Link>

                {/* Floating Action Button Container */}
                <div className="relative w-14 h-full flex justify-center items-center -mt-6">
                    <ReactRouterDOM.Link to="/orders/new" className={getFabClass()}>
                        <PlusIcon />
                    </ReactRouterDOM.Link>
                </div>

                <ReactRouterDOM.Link to="/shipments" className={getLinkClass('/shipments')}>
                    <ShipmentsIcon />
                    <span className="text-[9px] font-bold opacity-80">الشحنات</span>
                    {location.pathname.startsWith('/shipments') && activeDot}
                </ReactRouterDOM.Link>

                <button onClick={onMenuClick} className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300 active:scale-95 group">
                    <MenuIcon />
                    <span className="text-[9px] font-bold opacity-80">القائمة</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
