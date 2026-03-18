
import React, { useState, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import CartDrawer from './CartDrawer';

const LoadingBar = () => (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 z-[100] overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500 w-1/3 animate-progress-slide shadow-[0_0_10px_#f59e0b]"></div>
    </div>
);

const PublicLayout: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden" dir="rtl">
            <PublicHeader onCartClick={() => setIsCartOpen(true)} />
            <main id="main-content" className="flex-grow overflow-y-auto overflow-x-hidden">
                <Suspense fallback={<LoadingBar />}>
                    <ReactRouterDOM.Outlet />
                </Suspense>
                <PublicFooter />
            </main>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default PublicLayout;
