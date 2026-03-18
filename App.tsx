
import React, { Suspense, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useAppContext } from './context/AppContext';
import { firebaseConfig } from './firebaseConfig';
import PublicLayout from './components/layout/PublicLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { testConnection } from './firebaseService';
import { useNotification } from './context/NotificationContext';

const FirebaseSetupGuide = React.lazy(() => import('./components/FirebaseSetupGuide'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'));
const NewOrderPage = React.lazy(() => import('./pages/NewOrderPage'));
const NewSpecialSalePage = React.lazy(() => import('./pages/NewSpecialSalePage'));
const SalesInvoicesPage = React.lazy(() => import('./pages/SalesInvoicesPage'));
const StoresPage = React.lazy(() => import('./pages/StoresPage')); 
const StoreDetailsPage = React.lazy(() => import('./pages/StoreDetailsPage')); 
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const NewsPage = React.lazy(() => import('./pages/NewsPage'));
const CustomersPage = React.lazy(() => import('./pages/CustomersPage'));
const CustomerDetailPage = React.lazy(() => import('./pages/CustomerDetailPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const UserDetailPage = React.lazy(() => import('./pages/UserDetailPage'));
const NewUserPage = React.lazy(() => import('./pages/NewUserPage'));
const DeletionRequestsPage = React.lazy(() => import('./pages/DeletionRequestsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ShipmentsPage = React.lazy(() => import('./pages/ShipmentsPage'));
const SupportChatPage = React.lazy(() => import('./pages/SupportChatPage'));
const FinancialsPage = React.lazy(() => import('./pages/FinancialsPage'));
const UserLedgerPage = React.lazy(() => import('./pages/UserLedgerPage'));
const UserSettlementReportPage = React.lazy(() => import('./pages/UserSettlementReportPage'));
const WithdrawalRequestsPage = React.lazy(() => import('./pages/WithdrawalRequestsPage'));
const TransactionReceiptPage = React.lazy(() => import('./pages/TransactionReceiptPage'));
const DepositReceiptPage = React.lazy(() => import('./pages/DepositReceiptPage')); 
const ClientsPage = React.lazy(() => import('./pages/ClientsPage')); 
const ClientDetailsPage = React.lazy(() => import('./pages/ClientDetailsPage')); 
const CompanyFinancialsPage = React.lazy(() => import('./pages/CompanyFinancialsPage')); 
const InstantProductsPage = React.lazy(() => import('./pages/InstantProductsPage'));
const ShippingCalculatorPage = React.lazy(() => import('./pages/ShippingCalculatorPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const TrackShipmentPage = React.lazy(() => import('./pages/TrackShipmentPage'));
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'));
const PaymentResultPage = React.lazy(() => import('./pages/PaymentResultPage'));
const CurrencyManagementPage = React.lazy(() => import('./pages/CurrencyManagementPage'));
const TreasuryManagementPage = React.lazy(() => import('./pages/TreasuryManagementPage'));
const DeliveryPricesPage = React.lazy(() => import('./pages/DeliveryPricesPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const GlobalDealsPage = React.lazy(() => import('./pages/GlobalDealsPage'));

// مكون إعادة التمرير للأعلى المطور - ذكي بما يكفي لعدم التصفير عند الرجوع
const ScrollToTop = () => {
  const { pathname } = ReactRouterDOM.useLocation();
  const navigationType = ReactRouterDOM.useNavigationType();

  useEffect(() => {
    // نقوم بتصفير التمرير فقط إذا كان المستخدم قد انتقل لصفحة جديدة (Push)
    // أما في حالة الرجوع (Pop) فنحن نعتمد على استعادة التمرير اليدوية داخل الصفحات
    if (navigationType !== 'POP') {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.scrollTo({ top: 0, behavior: 'instant' });
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, navigationType]);
  return null;
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
        <style>
            {`
                @keyframes logo-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shine-sweep {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .branding-box { animation: logo-float 3s ease-in-out infinite; }
                .text-liby { color: #000000; }
                .dark .text-liby { color: #ffffff; }
                .text-port { color: #f59e0b; }
                .shine-container { position: relative; overflow: hidden; display: inline-block; }
                .shine-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%);
                    animation: shine-sweep 2.5s infinite;
                }
                .loader-track { width: 240px; height: 1px; background: #f1f5f9; border-radius: 10px; position: relative; margin-top: 3rem; overflow: visible; }
                .dark .loader-track { background: #1e293b; }
                
                .vehicle-container {
                    position: absolute;
                    top: -16px;
                    width: 100%;
                    height: 32px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .plane-anim {
                    position: absolute;
                    animation: vehicle-slide 4s infinite linear;
                    color: #f59e0b;
                    opacity: 0;
                    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
                }

                .ship-anim {
                    position: absolute;
                    animation: vehicle-slide 4s infinite linear;
                    animation-delay: 2s;
                    color: #f59e0b;
                    opacity: 0;
                    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
                }

                @keyframes vehicle-slide {
                    0% { transform: translateX(-120px); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateX(120px); opacity: 0; }
                }
            `}
        </style>
        
        <div className="relative mb-8 branding-box" dir="ltr">
            <div className="absolute -inset-6 bg-yellow-500/10 blur-3xl rounded-full animate-pulse"></div>
            <div className="w-28 h-28 p-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 relative z-10">
                <img src="https://up6.cc/2025/10/176278012677161.jpg" alt="LibyPort Logo" className="w-full h-full object-contain" />
            </div>
        </div>

        <div className="text-center" dir="ltr">
            <div className="shine-container px-4">
                <h1 className="text-5xl font-black tracking-tighter flex items-center gap-0">
                    <span className="text-liby">Liby</span><span className="text-port">Port</span>
                </h1>
                <div className="shine-overlay"></div>
            </div>
            <p className="text-[11px] uppercase font-black tracking-[0.4em] text-gray-400 mt-3 dark:text-gray-500">بوابة طرابلس العالمية</p>
            <div className="flex justify-center">
                <div className="loader-track">
                    <div className="vehicle-container">
                        <div className="plane-anim">
                            <svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor" style={{ transform: 'rotate(-15deg)' }}>
                                <path d="M61.3,34.6c-0.1,0.5-0.5,0.8-1,0.8H47.2l-14,18.6c-0.3,0.4-0.8,0.7-1.3,0.7h-3.9c-0.7,0-1.2-0.6-1-1.3l3.7-12.1H18 c-0.7,0-1.3-0.5-1.3-1.2v-1.6c0-0.7,0.6-1.2,1.3-1.2h12.7l-3.7-12.1c-0.2-0.7,0.3-1.3,1-1.3h3.9c0.5,0,1,0.3,1.3,0.7l14,18.6h13.1 c0.3,0,0.7,0.1,1,0.3C61,33.9,61.3,34.6,61.3,34.6z"/>
                            </svg>
                        </div>
                        <div className="ship-anim">
                            <svg viewBox="0 0 64 64" width="36" height="36" fill="currentColor">
                                <path d="M62,44H2l2,12h56L62,44z M10,40h4v4h-4V40z M16,40h4v4h-4V40z M22,40h4v4h-4V40z M28,40h4v4h-4V40z M34,40h4v4h-4V40z M40,40h4v4h-4V40z M46,40h4v4h-4V40z M52,40h4v4h-4V40z M50,32h6v8h-6V32z M42,32h6v8h-6V32z M34,32h6v8h-6V32z M26,32h6v8h-6V32z M18,32h6v8h-6V32z M10,32h6v8h-6V32z M14,24h36v8H14V24z M22,16h20v8H22V16z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AuthGuard: React.FC = () => {
    const { currentUser } = useAppContext();
    const location = ReactRouterDOM.useLocation();
    if (!currentUser) return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
    return <ReactRouterDOM.Outlet />;
};

const App: React.FC = () => {
    const { showToast } = useNotification();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            const connected = await testConnection();
            setIsOnline(connected);
            if (!connected) {
                showToast('مشكلة في الاتصال بقاعدة البيانات. يرجى التحقق من الشبكة.', 'error');
            }
        };
        checkConnection();
    }, []);

    if (firebaseConfig.projectId === 'your-project-id' || firebaseConfig.projectId === 'studio-5374249466-ed95c') {
        return <Suspense fallback={<LoadingSpinner />}><FirebaseSetupGuide /></Suspense>;
    }
    const { isLoading } = useAppContext();
    if (isLoading) return <LoadingSpinner />;

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
                <ScrollToTop />
                {!isOnline && (
                    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-black py-1 text-center z-[9999] animate-pulse">
                        أنت تعمل في وضع عدم الاتصال - قد لا يتم حفظ التغييرات
                    </div>
                )}
                <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route element={<PublicLayout />}>
                        <ReactRouterDOM.Route path="/" element={<LandingPage />} />
                        <ReactRouterDOM.Route path="/track/:trackingNumber" element={<TrackShipmentPage />} />
                        <ReactRouterDOM.Route path="/track" element={<TrackShipmentPage />} />
                        <ReactRouterDOM.Route path="/shipping-calculator" element={<ShippingCalculatorPage />} />
                        <ReactRouterDOM.Route path="/instant-products" element={<InstantProductsPage />} />
                        <ReactRouterDOM.Route path="/products/:id" element={<ProductDetailPage />} />
                        <ReactRouterDOM.Route path="/global-deals" element={<GlobalDealsPage />} />
                        <ReactRouterDOM.Route path="/checkout" element={<CheckoutPage />} />
                        <ReactRouterDOM.Route path="/delivery-prices" element={<DeliveryPricesPage />} />
                        <ReactRouterDOM.Route path="/contact-us" element={<ContactUsPage />} />
                        <ReactRouterDOM.Route path="/payment/result" element={<PaymentResultPage />} />
                        <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
                        <ReactRouterDOM.Route path="/register" element={<RegisterPage />} />
                        <ReactRouterDOM.Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <ReactRouterDOM.Route path="/reset-password" element={<ResetPasswordPage />} />
                    </ReactRouterDOM.Route>
                    
                    <ReactRouterDOM.Route element={<AuthGuard />}>
                        <ReactRouterDOM.Route element={<Layout />}>
                            <ReactRouterDOM.Route path="/dashboard" element={<DashboardPage />} />
                            <ReactRouterDOM.Route path="/dashboard/instant-products" element={<InstantProductsPage />} />
                            <ReactRouterDOM.Route path="/dashboard/shipping-calculator" element={<ShippingCalculatorPage />} />
                            <ReactRouterDOM.Route path="/products" element={<ProductsPage />} />
                            <ReactRouterDOM.Route path="/orders/new" element={<NewOrderPage />} />
                            <ReactRouterDOM.Route path="/orders/:id" element={<OrderDetailPage />} />
                            <ReactRouterDOM.Route path="/orders" element={<OrdersPage />} />
                            <ReactRouterDOM.Route path="/sales-invoices/new" element={<NewSpecialSalePage />} />
                            <ReactRouterDOM.Route path="/sales-invoices" element={<SalesInvoicesPage />} />
                            <ReactRouterDOM.Route path="/stores/:id" element={<StoreDetailsPage />} />
                            <ReactRouterDOM.Route path="/stores" element={<StoresPage />} />
                            <ReactRouterDOM.Route path="/shipments" element={<ShipmentsPage />} />
                            <ReactRouterDOM.Route path="/reports" element={<ReportsPage />} />
                            <ReactRouterDOM.Route path="/news" element={<NewsPage />} />
                            <ReactRouterDOM.Route path="/customers/:phone" element={<CustomerDetailPage />} />
                            <ReactRouterDOM.Route path="/customers" element={<CustomersPage />} />
                            <ReactRouterDOM.Route path="/clients/:id" element={<ClientDetailsPage />} /> 
                            <ReactRouterDOM.Route path="/clients" element={<ClientsPage />} />
                            <ReactRouterDOM.Route path="/company-financials" element={<CompanyFinancialsPage />} />
                            <ReactRouterDOM.Route path="/currencies" element={<CurrencyManagementPage />} />
                            <ReactRouterDOM.Route path="/treasury-management" element={<TreasuryManagementPage />} />
                            <ReactRouterDOM.Route path="/dashboard/delivery-prices" element={<DeliveryPricesPage />} />
                            <ReactRouterDOM.Route path="/users/new" element={<NewUserPage />} />
                            <ReactRouterDOM.Route path="/users/:id" element={<UserDetailPage />} />
                            <ReactRouterDOM.Route path="/users" element={<UsersPage />} />
                            <ReactRouterDOM.Route path="/deletion-requests" element={<DeletionRequestsPage />} />
                            <ReactRouterDOM.Route path="/withdrawal-requests" element={<WithdrawalRequestsPage />} />
                            <ReactRouterDOM.Route path="/settings" element={<SettingsPage />} />
                            <ReactRouterDOM.Route path="/financials/receipt/:id" element={<TransactionReceiptPage />} />
                            <ReactRouterDOM.Route path="/orders/deposit-receipt/:id" element={<DepositReceiptPage />} /> 
                            <ReactRouterDOM.Route path="/financials/user/:userId" element={<UserLedgerPage />} />
                            <ReactRouterDOM.Route path="/financials/settlement/:userId" element={<UserSettlementReportPage />} />
                            <ReactRouterDOM.Route path="/financials" element={<FinancialsPage />} />
                            <ReactRouterDOM.Route path="/support" element={<SupportChatPage />} />
                        </ReactRouterDOM.Route>
                    </ReactRouterDOM.Route>
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" replace />} />
                </ReactRouterDOM.Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

export default App;
