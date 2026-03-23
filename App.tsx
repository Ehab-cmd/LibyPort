
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
        <div className="relative mb-8 branding-box" dir="ltr">
            <div className="absolute -inset-6 bg-yellow-500/10 blur-3xl rounded-full animate-pulse"></div>
            <div className="w-28 h-28 p-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 relative z-10">
                <img src="https://up6.cc/2025/10/176278012677161.jpg" alt="LibyPort Logo" className="w-full h-full object-contain" />
            </div>
        </div>

        <div className="text-center" dir="ltr">
            <div className="relative overflow-hidden inline-block px-4">
                <h1 className="text-5xl font-black tracking-tighter flex items-center gap-0">
                    <span className="text-black dark:text-white">Liby</span><span className="text-amber-500">Port</span>
                </h1>
                <div className="shine-overlay"></div>
            </div>
            <p className="text-[11px] uppercase font-black tracking-[0.4em] text-gray-400 mt-3 dark:text-gray-500">بوابة طرابلس العالمية</p>
            <div className="flex justify-center">
                <div className="w-[240px] h-[1px] bg-slate-100 dark:bg-slate-800 rounded-full relative mt-12 overflow-visible">
                    <div className="absolute -top-4 w-full h-8 flex justify-center items-center">
                        <div className="truck-anim text-amber-500">
                            <svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor">
                                <path d="M2,18h40v24H2V18z M44,26h10l8,8v8h-18V26z M12,48c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,48,12,48z M52,48c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S54.2,48,52,48z"/>
                            </svg>
                        </div>
                        <div className="plane-anim text-amber-500">
                            <svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor">
                                <path d="M62,32c0,0-10-4-20-4s-10,0-10,0L18,12h-6l8,16H4c-2,0-4,2-4,4s2,4,4,4h16l-8,16h6l14-16c0,0,0,0,10,0s20-4,20-4V32z"/>
                            </svg>
                        </div>
                        <div className="ship-anim text-amber-500">
                            <svg viewBox="0 0 64 64" width="36" height="36" fill="currentColor">
                                <path d="M10,24h44l8,12v12H2V36L10,24z M16,16h8v8h-8V16z M28,16h8v8h-8V16z M40,16h8v8h-8V16z M22,8h20v8H22V8z"/>
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
