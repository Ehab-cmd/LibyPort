
import React, { useState, useEffect, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import MobileMenuModal from './MobileMenuModal';
import CartDrawer from './CartDrawer';
import OnboardingTutorial from '../OnboardingTutorial';
import { useAppContext } from '../../context/AppContext';

const LoadingBar = () => (
    <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-yellow-500 w-1/3 animate-progress-slide shadow-[0_0_10px_#f59e0b]"></div>
    </div>
);

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { currentUser, updateUser, language } = useAppContext();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstallApp = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    const handleCompleteTutorial = async () => {
        if (currentUser) {
            await updateUser(currentUser.id, { hasSeenTutorial: true });
        }
    };

    const showTutorial = currentUser && !currentUser.hasSeenTutorial && currentUser.isApproved;
    const pageDirection = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 font-cairo overflow-hidden print:h-auto print:overflow-visible`} dir={pageDirection}>
            <div className="no-print">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden relative print:overflow-visible">
                <div className="no-print">
                    <Header 
                        onMenuClick={() => setIsMobileMenuOpen(true)} 
                        onCartClick={() => setIsCartOpen(true)} 
                    />
                </div>
                
                {deferredPrompt && (
                    <div className="bg-yellow-500 text-white p-2 text-center text-xs font-bold flex items-center justify-center gap-4 no-print mx-4 rounded-xl mb-2 shadow-lg">
                        <span>يمكنك تثبيت LibyPort كبرنامج على جهازك للوصول السريع</span>
                        <button onClick={handleInstallApp} className="bg-white text-yellow-600 px-3 py-1 rounded-lg shadow-sm">تثبيت الآن</button>
                    </div>
                )}

                {/* إضافة id="main-content" هنا للتحكم في التمرير */}
                <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 px-1 md:px-4 py-2 pb-20 md:pb-4 relative print:p-0 print:overflow-visible print:max-w-none">
                    <div className="max-w-[1600px] mx-auto print:max-w-none print:m-0">
                        <Suspense fallback={<LoadingBar />}>
                            <ReactRouterDOM.Outlet />
                        </Suspense>
                    </div>
                </main>

                <div className="no-print">
                    <BottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
                    <MobileMenuModal isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                </div>
            </div>

            <div className="no-print">
                <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>
            {showTutorial && <OnboardingTutorial onComplete={handleCompleteTutorial} />}
        </div>
    );
};

export default Layout;
