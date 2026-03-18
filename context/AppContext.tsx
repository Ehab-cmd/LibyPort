import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    User, Store, Product, Order, News, AppNotification, ChatMessage, 
    FinancialTransaction, WithdrawalRequest, BankAccount, 
    SystemSettings, ShippingOrigin, ShoppingBrand, UserRole,
    SubscriptionType, OrderItem, OrderType, PurchaseTrackingStatus, DeliveryTrackingStatus, TransactionType, Review,
    Client, ClientTransaction, ClientTransactionType, CompanyInfo, CompanyTransaction, CompanyTxType, PaymentStatus, WithdrawalRequestStatus, ExpenseCategory,
    AccountingSystem, ProductVariant,
    CurrencyType, CurrencyTransaction, CurrencyTxType, DeliveryCompany, DeliveryPrice, Language, Treasury, TreasuryType
} from '../types';
import { INITIAL_SHIPPING_ORIGINS, SHOPPING_BRANDS } from '../constants';
import { 
    collection, getDocs, doc, updateDoc, addDoc, deleteDoc, 
    query, where, onSnapshot, setDoc, getDoc, writeBatch, orderBy, limit, increment, deleteField
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { seedDatabaseIfNeeded, handleFirestoreError, OperationType, testConnection } from '../firebaseService';
import { translations } from '../translations';

// وظيفة مساعدة متطورة لتنظيف الكائنات من قيم undefined قبل إرسالها لـ Firebase
const cleanData = (obj: any): any => {
    if (obj === null || typeof obj !== 'object' || obj instanceof Date) return obj;
    if (Array.isArray(obj)) {
        const arr = [];
        for (let i = 0; i < obj.length; i++) {
            arr.push(cleanData(obj[i]));
        }
        return arr;
    }
    const clean: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            if (val !== undefined) {
                clean[key] = cleanData(val);
            }
        }
    }
    return clean;
};

const triggerSystemNotification = (title: string, body: string, link?: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                body,
                url: window.location.origin + window.location.pathname + (link ? '#' + link : '')
            });
        } else {
            const n = new Notification(title, { body, icon: 'https://up6.cc/2025/10/176278012677161.jpg' });
            if (link) n.onclick = () => { window.focus(); window.location.hash = link; };
        }
    }
};

const updateAppBadge = (count: number) => {
    if ('setAppBadge' in navigator) {
        if (count > 0) {
            (navigator as any).setAppBadge(count).catch(() => {});
        } else {
            (navigator as any).clearAppBadge().catch(() => {});
        }
    }
};

interface ExtendedSystemSettings extends SystemSettings {
    tlyncMerchantId?: string;
    tlyncStoreId?: string;
    tlyncSecretKey?: string;
    employeeContractText?: string;
    storeContractText?: string;
}

interface AppContextType {
    currentUser: User | null;
    isLoading: boolean;
    users: User[];
    stores: Store[];
    products: Product[];
    orders: Order[];
    news: News[];
    notifications: AppNotification[];
    chatMessages: ChatMessage[];
    financialTransactions: FinancialTransaction[];
    withdrawalRequests: WithdrawalRequest[];
    bankAccounts: BankAccount[];
    treasuries: Treasury[];
    cart: OrderItem[];
    systemSettings: ExtendedSystemSettings; 
    companyInfo: CompanyInfo;
    shippingOrigins: ShippingOrigin[];
    shoppingBrands: ShoppingBrand[];
    deliveryPrices: DeliveryPrice[];
    landingImages: string[];
    saleLandingImages: string[];
    isSalePeriodActive: boolean;
    exchangeRate: number;
    treasuryBalances: any[];
    highValueOrderContact: string;
    deletedCustomers: string[];
    theme: 'light' | 'dark';
    language: Language;
    t: (key: string) => string;
    setLanguage: (lang: Language) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    clients: Client[];
    clientTransactions: ClientTransaction[];
    companyTransactions: CompanyTransaction[];
    currencyTransactions: CurrencyTransaction[];
    currencyBalances: Record<CurrencyType, number>;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    registerUser: (userData: any, storeNames: string[]) => Promise<{ success: boolean; message: string }>;
    updateUser: (userId: number, updates: Partial<User>) => Promise<void>;
    addUser: (userData: any, storeNames: string[]) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
    changePassword: (userId: number, oldPass: string, newPass: string) => { success: boolean; message: string };
    requestPasswordReset: (email: string, name: string, phone: string) => Promise<{ success: boolean; message: string; code?: string; email?: string }>;
    resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; message: string }>;
    getStoreNames: (storeIds: number[]) => string;
    requestNewStore: (name: string) => Promise<{ success: boolean; message: string }>;
    approveStore: (storeId: number) => Promise<{ success: boolean; message: string }>;
    updateStore: (storeId: number, updates: Partial<Store>) => Promise<void>;
    deleteStore: (storeId: number) => Promise<{ success: boolean; message: string }>;
    addToCart: (product: any, quantity?: number, selectedSize?: string) => void;
    removeFromCart: (productId: number, size?: string) => void;
    updateCartQuantity: (productId: number, quantity: number, size?: string) => void;
    updateCartItemSize: (productId: number, newSize: string, oldSize?: string) => void;
    clearCart: () => void;
    addOrder: (orderData: any) => Promise<{ success: boolean; id?: string; message?: string }>;
    updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
    bulkUpdateOrders: (orderIds: string[], updates: Partial<Order>) => Promise<void>;
    deleteOrderDirectly: (orderId: string) => Promise<void>;
    requestOrderUpdate: (orderId: string, updates: Partial<Order>, reason: string) => Promise<void>;
    approveOrderUpdate: (orderId: string) => Promise<void>;
    rejectOrderUpdate: (orderId: string) => Promise<void>;
    offerOrderUpdate?: (orderId: string, updates: Partial<Order>) => Promise<void>;
    addShipmentComment: (orderId: string, comment: string) => Promise<void>;
    addProduct: (productData: any) => Promise<Product>;
    updateProduct: (productId: number, updates: Partial<Product>, reason?: string) => Promise<void>;
    deleteProductDirectly: (productId: number) => Promise<void>;
    requestDeletion: (type: 'order' | 'product', id: string | number, reason: string) => Promise<void>;
    approveDeletion: (type: 'order' | 'product', id: string | number) => Promise<void>;
    rejectDeletion: (type: 'order' | 'product', id: string | number) => Promise<void>;
    addInstantProductsBatch: (products: any[]) => Promise<{ success: boolean; message: string }>;
    approveProductUpdate: (productId: number) => Promise<void>;
    rejectProductUpdate: (productId: number) => Promise<void>;
    addReview: (productId: number, rating: number, comment: string) => Promise<void>;
    addNews: (title: string, content: string, videoUrl?: string, isPinned?: boolean, expiresAt?: string) => Promise<void>;
    updateNews: (id: number, updates: Partial<News>) => Promise<void>;
    deleteNews: (id: number) => Promise<void>;
    markNewsAsSeen: (newsId: number) => Promise<void>;
    runNewsCleanup: () => Promise<void>;
    wipeProducts: () => Promise<void>;
    sendChatMessage: (message: { content: string, attachmentUrl?: string }, receiverId: number | undefined) => Promise<void>;
    markMessagesAsRead: (conversationId: number) => Promise<void>;
    sendNotification: (userId: number, message: string, type?: string, link?: string) => Promise<void>;
    markNotificationsAsRead: () => Promise<void>;
    markNotificationAsRead: (notifId: number | string) => Promise<void>;
    addFinancialTransaction: (data: any) => void;
    requestWithdrawal: (amount: number) => Promise<{ success: boolean; message: string }>;
    updateWithdrawalRequestStatus: (id: number, status: WithdrawalRequestStatus, treasuryType?: TreasuryType, treasuryId?: string) => void;
    addBankAccount: (bankName: string, accountNumber: string) => Promise<void>;
    deleteBankAccount: (id: number) => Promise<void>;
    addTreasury: (data: Omit<Treasury, 'id'>) => Promise<void>;
    updateTreasury: (id: string, updates: Partial<Treasury>) => Promise<void>;
    deleteTreasury: (id: string) => Promise<void>;
    deleteCustomer: (phone: string) => Promise<void>;
    sendContactFormMessage: (data: any) => Promise<{ success: boolean; message: string }>;
    updateSystemSettings: (settings: Partial<ExtendedSystemSettings>) => Promise<void>;
    updateCompanyInfo: (info: Partial<CompanyInfo>) => Promise<void>;
    updateHeroImages: (type: 'regular' | 'sale', images: string[]) => void;
    updateSalePeriodStatus: (isActive: boolean) => void;
    updateSalePeriodStatusAction: (isActive: boolean) => void;
    updateCalculatorSettings: (settings: any) => Promise<void>;
    updateExchangeRate: (rate: number) => Promise<void>;
    getExchangeRateForDate: (date: string) => number;
    addShippingOrigin: (origin: ShippingOrigin) => Promise<void>;
    updateShippingOrigin: (id: string, updates: Partial<ShippingOrigin>) => Promise<void>;
    deleteShippingOrigin: (id: string) => Promise<void>;
    addShoppingBrand: (brand: ShoppingBrand) => Promise<void>;
    updateShoppingBrand: (id: string, updates: Partial<ShoppingBrand>) => Promise<void>;
    deleteShoppingBrand: (id: string) => Promise<void>;
    resetSystemDefaults: () => Promise<void>;
    fixInvoiceIds: () => Promise<{ success: boolean; message: string }>;
    resequence2026Invoices: () => Promise<{ success: boolean; message: string; count: number }>;
    fixAllProductsStock: () => Promise<{ success: boolean; message: string }>;
    fixStockForOrder: (orderId: string) => Promise<{ success: boolean; message: string }>;
    fixStockForAllOrders: (orderIds?: string[]) => Promise<{ success: boolean; message: string; count: number }>;
    fixStockStartingFrom: (startSequence: number) => Promise<{ success: boolean; message: string; count: number }>;
    runSpecificStockCorrection_143_178: () => Promise<{ success: boolean; message: string; processed: number; skipped: number }>;
    addClient: (data: Omit<Client, 'balance' | 'totalPurchases' | 'lastTransactionDate'>) => Promise<Client>;
    addClientTransaction: (clientId: string, amount: number, type: ClientTransactionType, notes?: string, referenceId?: string) => Promise<{ success: boolean; transactionId: string }>;
    recalculateClientBalance: (clientId: string) => Promise<void>;
    deleteClient: (clientId: string) => Promise<void>;
    deleteClientTransaction: (transactionId: string) => Promise<void>;
    syncAllOrdersWithMasterData: () => Promise<{ success: boolean; count: number; message: string }>;
    syncOrderWithMasterData: (orderId: string) => Promise<{ success: boolean; message: string }>;
    addCompanyTransaction: (data: Omit<CompanyTransaction, 'id'>) => Promise<void>;
    updateCompanyTransaction: (id: string, updates: Partial<CompanyTransaction>) => Promise<void>;
    deleteCompanyTransaction: (id: string) => Promise<void>;
    settleCompanyDebt: (transactionId: string, amount?: number) => Promise<void>;
    runAutoArchive: () => Promise<void>;
    runNotificationCleanup: () => Promise<void>;
    addCurrencyTransaction: (data: Omit<CurrencyTransaction, 'id'>) => Promise<void>;
    deleteCurrencyTransaction: (id: string) => Promise<void>;
    addDeliveryPrice: (data: Omit<DeliveryPrice, 'id'>) => Promise<void>;
    updateDeliveryPrice: (id: string, updates: Partial<DeliveryPrice>) => Promise<void>;
    deleteDeliveryPrice: (id: string) => Promise<void>;
    refreshData: () => void;
    resetData: () => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

const LARGE_COLLECTIONS = ['products', 'orders', 'financialTransactions', 'companyTransactions', 'clientTransactions', 'currencyTransactions', 'deliveryPrices'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const listenersInitialized = useRef(false);
    const [users, setUsers] = useState<User[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [treasuries, setTreasuries] = useState<Treasury[]>([]);
    const [treasuryBalances, setTreasuryBalances] = useState<any[]>([]);
    const [cart, setOrderItems] = useState<OrderItem[]>([]);
    const [deletedCustomers, setDeletedCustomers] = useState<string[]>([]);
    const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrice[]>([]);
    const [systemSettings, setSystemSettings] = useState<ExtendedSystemSettings>({
        vipSubscriptionFee: 150,
        purchaseCommissionPercentage: 5,
        exchangeRateHistory: [],
        deliveryCompanies: [ { id: 'DEL-DEFAULT', name: 'الشركة الافتراضية', isActive: true } ],
        contractText: '',
        employeeContractText: '',
        storeContractText: '',
        contractVersion: 1
    });
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: 'LibyPort', specialization: 'خدمات الشحن والتجارة الإلكترونية', address: 'طرابلس - ليبيا', email: 'info@liby2port.com', phone: '+218 94 440 0399' });
    const [shippingOrigins, setShippingOrigins] = useState<ShippingOrigin[]>(INITIAL_SHIPPING_ORIGINS);
    const [shoppingBrands, setShoppingBrands] = useState<ShoppingBrand[]>(SHOPPING_BRANDS);
    const [landingImages, setLandingImages] = useState<string[]>([]);
    const [saleLandingImages, setSaleLandingImages] = useState<string[]>([]);
    const [isSalePeriodActive, setIsSalePeriodActive] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [highValueOrderContact, setHighValueOrderContact] = useState('');
    
    const [currencyTransactions, setCurrencyTransactions] = useState<CurrencyTransaction[]>([]);
    const [currencyBalances, setCurrencyBalances] = useState<Record<CurrencyType, number>>({
        [CurrencyType.USD]: 0, [CurrencyType.EUR]: 0, [CurrencyType.AED]: 0, [CurrencyType.SAR]: 0, [CurrencyType.LYD]: 0
    });

    const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('libyport_lang') as Language) || 'ar');
    const [theme, setThemeState] = useState<'light' | 'dark'>(() => (localStorage.getItem('libyport_theme') as 'light' | 'dark') || 'light');
    
    const t = useCallback((key: string) => {
        return (translations[language] as any)[key] || key;
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('libyport_lang', lang);
    }, []);

    const setTheme = useCallback((newTheme: 'light' | 'dark') => {
        setThemeState(newTheme);
        localStorage.setItem('libyport_theme', newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const [clients, setClients] = useState<Client[]>([]);
    const [clientTransactions, setClientTransactions] = useState<ClientTransaction[]>([]);
    const [companyTransactions, setCompanyTransactions] = useState<CompanyTransaction[]>([]);

    useEffect(() => {
        const initApp = async () => {
            // فتح النظام فوراً للمستخدم دون انتظار أي عمليات اتصال
            setIsLoading(false);

            try {
                // تشغيل فحص البيانات في الخلفية بصمت
                seedDatabaseIfNeeded().catch(err => console.error("Background seeding error:", err));
                
                const storedUser = localStorage.getItem('libyport_user');
                if (storedUser) { 
                    try { 
                        const u = JSON.parse(storedUser);
                        if (u && u.id) {
                            setCurrentUser(u);
                            updateDoc(doc(firestore, 'users', String(u.id)), { lastActive: new Date().toISOString() }).catch(() => {});
                        }
                    } catch (e) { console.error("Stored user parsing failed:", e); } 
                }

                const fetchCollection = async <T,>(colName: string, setter: React.Dispatch<React.SetStateAction<T[]>>, limitCount?: number, orderByField: string = 'id') => {
                    const cacheKey = `lp_cache_${colName}`;
                    
                    // 1. محاولة التحميل الفوري من الكاش للعرض السريع
                    const cached = localStorage.getItem(cacheKey);
                    if (cached) {
                        try {
                            const parsed = JSON.parse(cached);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                setter(parsed);
                            }
                        } catch (e) {}
                    }

                    // 2. التحميل من السيرفر في الخلفية لتحديث البيانات
                    try {
                        let colRef: any = collection(firestore, colName);
                        if (limitCount) {
                            // Use the provided orderByField or default to 'id'
                            // Note: Products use 'id', most others use 'date'
                            colRef = query(colRef, orderBy(orderByField, 'desc'), limit(limitCount));
                        }
                        
                        const snapshot = await getDocs(colRef);
                        const data = snapshot.docs.map(doc => ({ ...(doc.data() as any), id: doc.id } as unknown as T));
                        let processedData = data.map(item => {
                            const anyItem = item as any;
                            if (typeof anyItem.id === 'string' && !isNaN(Number(anyItem.id))) return { ...anyItem, id: Number(anyItem.id) };
                            return item;
                        });
                        
                        // Deduplicate after number conversion to prevent React key collisions
                        const uniqueMap = new Map();
                        processedData.forEach(item => uniqueMap.set((item as any).id, item));
                        processedData = Array.from(uniqueMap.values());
                        
                        if (processedData.length >= 0) {
                            setter(processedData as T[]);
                            // تحديث الكاش للزيارة القادمة - السماح بتخزين المنتجات وأسعار التوصيل لسرعة العرض
                            const cacheableCollections = ['users', 'stores', 'products', 'deliveryPrices', 'news', 'settings', 'orders', 'financialTransactions', 'companyTransactions'];
                            if (cacheableCollections.includes(colName)) {
                                try { 
                                    const stringified = JSON.stringify(processedData);
                                    // Only cache if it's within a reasonable size to avoid QuotaExceededError
                                    if (stringified.length < 4 * 1024 * 1024) { // 4MB limit for individual items
                                        localStorage.setItem(cacheKey, stringified); 
                                    }
                                } catch (e) {
                                    console.warn(`Cache failed for ${colName}:`, e);
                                    // If quota exceeded, clear some old caches
                                    if (e instanceof Error && e.name === 'QuotaExceededError') {
                                        const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('lp_cache_') && k !== cacheKey);
                                        keysToRemove.forEach(k => localStorage.removeItem(k));
                                    }
                                }
                            }
                            return processedData;
                        }
                        return [] as T[];
                    } catch (e: any) {
                        handleFirestoreError(e, OperationType.LIST, colName);
                        return [] as T[];
                    }
                };

                // 1. تحميل البيانات الأساسية من الكاش فوراً وفتح النظام
                const criticalCollections = ['users', 'stores', 'settings', 'news', 'products', 'deliveryPrices', 'orders', 'financialTransactions', 'companyTransactions', 'treasuries'];
                criticalCollections.forEach(col => {
                    const cached = localStorage.getItem(`lp_cache_${col}`);
                    if (cached) {
                        try {
                            const parsed = JSON.parse(cached);
                            if (col === 'users') setUsers(parsed);
                            if (col === 'stores') setStores(parsed);
                            if (col === 'news') setNews(parsed);
                            if (col === 'products') setProducts(parsed);
                            if (col === 'deliveryPrices') setDeliveryPrices(parsed);
                            if (col === 'orders') setOrders(parsed);
                            if (col === 'financialTransactions') setFinancialTransactions(parsed);
                            if (col === 'companyTransactions') setCompanyTransactions(parsed);
                        } catch (e) {}
                    }
                });

                // 2. تشغيل عمليات التحميل من السيرفر بشكل متوازٍ وذكي
                const fetchAll = async () => {
                    await Promise.allSettled([
                        fetchCollection<User>('users', setUsers),
                        fetchCollection<Store>('stores', setStores),
                        fetchCollection<Product>('products', setProducts, 500, 'id'), // Limit products to 500 most recent
                        fetchCollection<News>('news', setNews),
                        fetchCollection<AppNotification>('notifications', setNotifications, 100, 'date'),
                        fetchCollection<BankAccount>('bankAccounts', setBankAccounts),
                        fetchCollection<Treasury>('treasuries', setTreasuries),
                        fetchCollection<ShippingOrigin>('shippingOrigins', setShippingOrigins),
                        fetchCollection<ShoppingBrand>('shoppingBrands', setShoppingBrands),
                    ]);

                    // تشغيل عمليات التحميل المتبقية في الخلفية
                    Promise.allSettled([
                        fetchCollection<Order>('orders', setOrders, 500, 'date'), // Limit orders to 500 most recent
                        fetchCollection<FinancialTransaction>('financialTransactions', setFinancialTransactions, 300, 'date'),
                        fetchCollection<Client>('clients', setClients),
                        fetchCollection<ClientTransaction>('clientTransactions', setClientTransactions, 300, 'date'),
                        fetchCollection<CompanyTransaction>('companyTransactions', setCompanyTransactions, 300, 'date'),
                        fetchCollection<CurrencyTransaction>('currencyTransactions', setCurrencyTransactions, 300, 'date'),
                        fetchCollection<WithdrawalRequest>('withdrawalRequests', setWithdrawalRequests, 100, 'date'),
                        fetchCollection<DeliveryPrice>('deliveryPrices', setDeliveryPrices),
                    ]);
                };

                fetchAll();
                
                try {
                    const settingsDoc = await getDoc(doc(firestore, 'settings', 'general'));
                    if (settingsDoc.exists()) {
                        const data = settingsDoc.data() as ExtendedSystemSettings;
                        setSystemSettings(prev => ({ ...prev, ...data }));
                        if (data.exchangeRateHistory?.length > 0) {
                             const sortedHistory = [...data.exchangeRateHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                             setExchangeRate(sortedHistory[0].rate);
                        }
                    }
                } catch (e) {
                    handleFirestoreError(e, OperationType.GET, 'settings/general');
                }

                try {
                    const companyDoc = await getDoc(doc(firestore, 'settings', 'company'));
                    if (companyDoc.exists()) { setCompanyInfo(prev => ({ ...prev, ...companyDoc.data() })); }
                } catch (e) {
                    handleFirestoreError(e, OperationType.GET, 'settings/company');
                }

            } catch (error) {
                console.error("Initialization Critical Error:", error);
            }
        };
        initApp();
    }, []);

    useEffect(() => {
        // تحسين استقبال البيانات ليكون جزئياً وذكياً لتقليل البطء والتقطيع
        const optimizeListener = <T extends { id: string | number }>(
            colName: string, 
            setter: React.Dispatch<React.SetStateAction<T[]>>,
            idType: 'string' | 'number' = 'string',
            limitCount?: number,
            orderByField: string = 'id'
        ) => {
            let q = query(collection(firestore, colName));
            if (limitCount) {
                // Fetch recent items first for large collections
                q = query(collection(firestore, colName), orderBy(orderByField, 'desc'), limit(limitCount));
            }

            return onSnapshot(q, (snapshot) => {
                setter(prev => {
                    const newMap = new Map(prev.map(item => [item.id, item]));
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'removed') {
                            newMap.delete(idType === 'number' ? Number(change.doc.id) : change.doc.id);
                        } else {
                            const data = { ...change.doc.data(), id: idType === 'number' ? Number(change.doc.id) : change.doc.id } as unknown as T;
                            newMap.set(data.id, data);
                        }
                    });
                    // Sort by ID or Date descending to keep recent items at the top
                    return Array.from(newMap.values()).sort((a: any, b: any) => {
                        if (orderByField === 'date' && a.date && b.date) {
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                        }
                        if (typeof a.id === 'number' && typeof b.id === 'number') return b.id - a.id;
                        return String(b.id).localeCompare(String(a.id));
                    });
                });
            }, (error) => {
                handleFirestoreError(error, OperationType.LIST, colName);
            });
        };

        // Listeners that are always active (Public)
        const unsubscribes: (() => void)[] = [
            optimizeListener<Product>('products', setProducts, 'number', 500, 'id'),
            optimizeListener<Store>('stores', setStores, 'number'),
            optimizeListener<News>('news', setNews, 'number', 50, 'date'),
            optimizeListener<DeliveryPrice>('deliveryPrices', setDeliveryPrices, 'string'),
            optimizeListener<ShippingOrigin>('shippingOrigins', setShippingOrigins, 'string'),
            optimizeListener<ShoppingBrand>('shoppingBrands', setShoppingBrands, 'string'),
            onSnapshot(doc(firestore, 'settings', 'general'), (docSnap) => {
                if (docSnap.exists()) { setSystemSettings(prev => ({ ...prev, ...docSnap.data() })); }
            }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'settings/general');
            })
        ];

        // Listeners that only run when a user is logged in (Private)
        if (currentUser) {
            unsubscribes.push(
                optimizeListener<Order>('orders', setOrders, 'string', 500, 'date'),
                optimizeListener<Client>('clients', setClients, 'string'),
                optimizeListener<ClientTransaction>('clientTransactions', setClientTransactions, 'string', 300, 'date'),
                optimizeListener<CompanyTransaction>('companyTransactions', setCompanyTransactions, 'string', 300, 'date'),
                optimizeListener<AppNotification>('notifications', setNotifications, 'number', 100, 'date'),
                optimizeListener<CurrencyTransaction>('currencyTransactions', setCurrencyTransactions, 'string', 300, 'date'),
                optimizeListener<User>('users', setUsers, 'number'),
                optimizeListener<BankAccount>('bankAccounts', setBankAccounts, 'number'),
                optimizeListener<Treasury>('treasuries', setTreasuries, 'string'),
                optimizeListener<FinancialTransaction>('financialTransactions', setFinancialTransactions, 'number', 300, 'date'),
                optimizeListener<WithdrawalRequest>('withdrawalRequests', setWithdrawalRequests, 'number', 100, 'date'),
                onSnapshot(query(collection(firestore, 'chatMessages'), orderBy('timestamp', 'desc'), limit(200)), (snap) => {
                    setChatMessages(snap.docs.map(d => d.data() as ChatMessage));
                }, (error) => {
                    handleFirestoreError(error, OperationType.LIST, 'chatMessages');
                })
            );
        }

        return () => { 
            unsubscribes.forEach(unsub => unsub());
        };
    }, [currentUser]);

    // حساب أرصدة العملات بشكل منفصل لضمان السرعة وعدم التقطيع
    useEffect(() => {
        const balances: Record<CurrencyType, number> = { [CurrencyType.USD]: 0, [CurrencyType.EUR]: 0, [CurrencyType.AED]: 0, [CurrencyType.SAR]: 0, [CurrencyType.LYD]: 0 };
        currencyTransactions.forEach(tx => {
            if (tx.type === CurrencyTxType.Buy) { 
                balances[tx.currency] += tx.amount; 
                if (tx.lydAmount) balances[CurrencyType.LYD] -= tx.lydAmount; 
            }
            else if (tx.type === CurrencyTxType.Spend) { balances[tx.currency] -= tx.amount; }
            else if (tx.type === CurrencyTxType.Adjustment) { balances[tx.currency] += tx.amount; }
        });
        setCurrencyBalances(balances);
    }, [currencyTransactions]);

    // حساب أرصدة الخزائن (المصارف، العهد، شركات التوصيل)
    useEffect(() => {
        const normalizeType = (type: any) => {
            if (!type) return null;
            if (type === 'Cash' || type === 'cash' || type === TreasuryType.Cash) return TreasuryType.Cash;
            if (type === 'Bank' || type === 'bank' || type === TreasuryType.Bank) return TreasuryType.Bank;
            if (type === 'DeliveryCompany' || type === 'delivery' || type === TreasuryType.DeliveryCompany) return TreasuryType.DeliveryCompany;
            return type;
        };

        const admins = users.filter(u => u.role === UserRole.Admin || u.role === UserRole.SuperAdmin);
        const deliveryCos = systemSettings.deliveryCompanies || [];
        
        const ordersByTreasury = new Map<string, Order[]>();
        const ordersByDepositTreasury = new Map<string, Order[]>();
        const ordersByDeliveryCompany = new Map<string, Order[]>();
        
        orders.forEach(o => {
            if (o.isDeleted) return;
            const colId = String(o.collectionTreasuryId);
            if (!ordersByTreasury.has(colId)) ordersByTreasury.set(colId, []);
            ordersByTreasury.get(colId)!.push(o);

            if (o.deliveryCompanyId) {
                const dcId = String(o.deliveryCompanyId);
                if (!ordersByDeliveryCompany.has(dcId)) ordersByDeliveryCompany.set(dcId, []);
                ordersByDeliveryCompany.get(dcId)!.push(o);
            }
            
            const depId = o.depositTreasuryId ? String(o.depositTreasuryId) : null;
            if (depId) {
                if (!ordersByDepositTreasury.has(depId)) ordersByDepositTreasury.set(depId, []);
                ordersByDepositTreasury.get(depId)!.push(o);
            }
        });

        const txByToTreasury = new Map<string, CompanyTransaction[]>();
        const txByFromTreasury = new Map<string, CompanyTransaction[]>();
        const txByTreasuryId = new Map<string, CompanyTransaction[]>();
        
        companyTransactions.forEach(tx => {
            const toId = String(tx.toTreasuryId);
            if (tx.toTreasuryId) {
                if (!txByToTreasury.has(toId)) txByToTreasury.set(toId, []);
                txByToTreasury.get(toId)!.push(tx);
            }
            
            const fromId = String(tx.fromTreasuryId);
            if (tx.fromTreasuryId) {
                if (!txByFromTreasury.has(fromId)) txByFromTreasury.set(fromId, []);
                txByFromTreasury.get(fromId)!.push(tx);
            }

            const trId = String(tx.treasuryId);
            if (tx.treasuryId) {
                if (!txByTreasuryId.has(trId)) txByTreasuryId.set(trId, []);
                txByTreasuryId.get(trId)!.push(tx);
            }
        });

        const financialTxsByTreasury = new Map<string, FinancialTransaction[]>();
        financialTransactions.forEach(tx => {
            const trId = String(tx.treasuryId);
            if (tx.treasuryId) {
                if (!financialTxsByTreasury.has(trId)) financialTxsByTreasury.set(trId, []);
                financialTxsByTreasury.get(trId)!.push(tx);
            }
        });

        const calculateBalance = (tId: string, nType: TreasuryType, targetLegacyId: string | null, initialBalance: number = 0) => {
            let balance = initialBalance;
            const possibleIds = Array.from(new Set([String(tId), targetLegacyId].filter(Boolean) as string[]));
            
            possibleIds.forEach(id => {
                // 1. تحصيل متبقي الطلبات (عند التسليم)
                (ordersByTreasury.get(id) || []).forEach(o => {
                    if (o.isDeleted || o.purchaseTrackingStatus === PurchaseTrackingStatus.Cancelled) return;

                    // محاولة الحصول على نوع الخزينة من البيانات المخزنة في الطلب أو من قائمة الخزائن لضمان دقة المطابقة
                    const orderTreasuryType = o.collectedToTreasury || treasuries.find(t => String(t.id) === String(o.collectionTreasuryId))?.type;
                    
                    const isMatch = ((String(o.collectionTreasuryId) === String(tId)) || 
                        (targetLegacyId && String(o.collectionTreasuryId) === String(targetLegacyId))) && 
                        normalizeType(orderTreasuryType) === nType;
                    
                    // التوصيل الفوري يعتبر محصلاً تلقائياً لأنه يتم الدفع عند الاستلام مباشرة
                    if ((o.isPaymentConfirmed || o.orderType === OrderType.InstantDelivery) && isMatch) {
                        // البحث عن معاملات تحصيل مبيعات مرتبطة بهذا الطلب في هذه الخزينة للحصول على الصافي (بعد العمولة)
                        const orderTxs = (txByToTreasury.get(id) || []).filter(t => t.type === CompanyTxType.SaleCollection && t.orderId === o.id);
                        if (orderTxs.length > 0) {
                            balance += orderTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                        } else {
                            balance += ((Number(o.total) || 0) - (Number(o.deposit) || 0));
                        }
                    }
                });

                // إضافة منطق خاص لشركات التوصيل (الذمم): الطلبات المسلمة تزيد المديونية، والمسددة تنقصها
                if (nType === TreasuryType.DeliveryCompany) {
                    (ordersByDeliveryCompany.get(id) || []).forEach(o => {
                        if (o.isDeleted || o.purchaseTrackingStatus === PurchaseTrackingStatus.Cancelled) return;
                        const amount = (Number(o.total) || 0) - (Number(o.deposit) || 0);
                        if (o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered) {
                            balance += amount;
                        }
                        if (o.isPaymentConfirmed) {
                            balance -= amount;
                        }
                    });
                }

                // 2. تحصيل العربون
                (ordersByDepositTreasury.get(id) || []).forEach(o => {
                    if (o.isDeleted || o.purchaseTrackingStatus === PurchaseTrackingStatus.Cancelled) return;
                    
                    const orderDepositTreasuryType = o.depositTreasuryType || treasuries.find(t => String(t.id) === String(o.depositTreasuryId))?.type;

                    const isMatch = ((String(o.depositTreasuryId) === String(tId)) || 
                        (targetLegacyId && String(o.depositTreasuryId) === String(targetLegacyId))) && 
                        normalizeType(orderDepositTreasuryType) === nType;
                    
                    if (o.isDepositPaid && isMatch) {
                        balance += (Number(o.deposit) || 0) - (Number(o.depositCommission) || 0);
                    }
                });

                // 3. التحويلات الواردة (To) والمعاملات العامة الواردة
                (txByToTreasury.get(id) || []).forEach(tx => {
                    if (tx.type === CompanyTxType.SaleCollection && tx.orderId) return;
                    
                    const txTreasuryType = tx.toTreasury || tx.treasuryType || treasuries.find(t => String(t.id) === String(tx.toTreasuryId))?.type;
                    const isMatch = (String(tx.toTreasuryId) === String(tId) || (targetLegacyId && String(tx.toTreasuryId) === String(targetLegacyId))) &&
                        (!txTreasuryType || normalizeType(txTreasuryType) === nType);
                    
                    if (isMatch) {
                        const isIncome = (tx.type as string) === CompanyTxType.Income || 
                                       (tx.type as string) === CompanyTxType.SaleCollection ||
                                       (tx.type as string) === CompanyTxType.TreasuryTransfer ||
                                       (tx.type as string) === TransactionType.Collection ||
                                       (tx.type as string) === TransactionType.SubscriptionFee;
                        
                        if (isIncome) {
                            balance += (Number(tx.amount) || 0);
                        }
                    }
                });

                // 4. التحويلات الصادرة (From)
                (txByFromTreasury.get(id) || []).forEach(tx => {
                    const txTreasuryType = tx.fromTreasury || tx.treasuryType || treasuries.find(t => String(t.id) === String(tx.fromTreasuryId))?.type;
                    const isMatch = (String(tx.fromTreasuryId) === String(tId) || (targetLegacyId && String(tx.fromTreasuryId) === String(targetLegacyId))) &&
                        (!txTreasuryType || normalizeType(txTreasuryType) === nType);
                    
                    if (isMatch) {
                        const isExpense = (tx.type as string) === CompanyTxType.Expense || 
                                        (tx.type as string) === CompanyTxType.Purchase || 
                                        (tx.type as string) === CompanyTxType.DebtPayment || 
                                        (tx.type as string) === CompanyTxType.StoreDeduction ||
                                        (tx.type as string) === CompanyTxType.TreasuryTransfer ||
                                        (tx.type as string) === TransactionType.Payment ||
                                        (tx.type as string) === TransactionType.Withdrawal;
                        
                        if (isExpense) {
                            balance -= (Number(tx.amount) || 0);
                        }
                    }
                });

                // 5. المعاملات المالية اليدوية (إيرادات / مصاريف)
                (txByTreasuryId.get(id) || []).forEach(tx => {
                    if (tx.type === CompanyTxType.TreasuryTransfer || tx.type === CompanyTxType.SaleCollection) return;

                    const txTreasuryType = tx.treasuryType || treasuries.find(t => String(t.id) === String(tx.treasuryId))?.type;
                    const isMatch = (String(tx.treasuryId) === String(tId) || (targetLegacyId && String(tx.treasuryId) === String(targetLegacyId))) &&
                        (!txTreasuryType || normalizeType(txTreasuryType) === nType);
                    
                    if (isMatch) {
                        const isIncome = (tx.type as string) === CompanyTxType.Income || (tx.type as string) === TransactionType.Collection || (tx.type as string) === TransactionType.SubscriptionFee;
                        const isExpense = (tx.type as string) === CompanyTxType.Expense || (tx.type as string) === TransactionType.Payment || (tx.type as string) === TransactionType.Withdrawal || (tx.type as string) === CompanyTxType.Purchase || (tx.type as string) === CompanyTxType.DebtPayment || (tx.type as string) === CompanyTxType.StoreDeduction;

                        if (isIncome) {
                            balance += (Number(tx.amount) || 0);
                        } else if (isExpense) {
                            balance -= (Number(tx.amount) || 0);
                        }
                    }
                });

                // 6. المعاملات المالية المتقدمة (سحب رصيد، اشتراكات، إلخ)
                (financialTxsByTreasury.get(id) || []).forEach(tx => {
                    const txTreasuryType = tx.treasuryType || treasuries.find(t => String(t.id) === String(tx.treasuryId))?.type;
                    const isMatch = (String(tx.treasuryId) === String(tId) || 
                        (targetLegacyId && String(tx.treasuryId) === String(targetLegacyId))) &&
                        (!txTreasuryType || normalizeType(txTreasuryType) === nType);
                    
                    if (isMatch) {
                        if (tx.type === TransactionType.Collection || tx.type === TransactionType.SubscriptionFee) {
                            balance += (Number(tx.amount) || 0);
                        } else if (tx.type === TransactionType.Withdrawal || tx.type === TransactionType.Payment) {
                            balance -= (Number(tx.amount) || 0);
                        }
                    }
                });
            });
            return balance;
        };

        const finalBalances: any[] = [];
        treasuries.forEach(t => {
            const nType = normalizeType(t.type);
            const legacyId = t.userId ? String(t.userId) : (t.bankId ? String(t.bankId) : null);
            finalBalances.push({ ...t, type: nType, balance: calculateBalance(String(t.id), nType, legacyId, t.initialBalance || 0) });
        });

        admins.forEach(u => {
            if (treasuries.find(t => t.userId === u.id)) return;
            const balance = calculateBalance(String(u.id), TreasuryType.Cash, null);
            finalBalances.push({ id: String(u.id), name: u.name, type: TreasuryType.Cash, userId: u.id, balance });
        });

        bankAccounts.forEach(bank => {
            if (treasuries.find(t => t.bankId === bank.id)) return;
            const balance = calculateBalance(String(bank.id), TreasuryType.Bank, null);
            finalBalances.push({ id: String(bank.id), name: bank.bankName, type: TreasuryType.Bank, bankId: bank.id, accountNumber: bank.accountNumber, balance });
        });

        deliveryCos.forEach(co => {
            const balance = calculateBalance(co.id, TreasuryType.DeliveryCompany, null);
            finalBalances.push({ id: co.id, name: co.name, type: TreasuryType.DeliveryCompany, balance });
        });

        setTreasuryBalances(finalBalances);
    }, [treasuries, bankAccounts, orders, companyTransactions, financialTransactions, systemSettings, users]);

    // تحديث شارة التنبيهات بشكل منفصل
    useEffect(() => {
        if (currentUser) {
            const unread = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;
            updateAppBadge(unread);
        }
    }, [notifications, currentUser]);

    // تنظيف الأخبار والتعليقات القديمة تلقائياً (مرة واحدة عند التحميل)
    const cleanupPerformed = useRef(false);
    useEffect(() => {
        if (currentUser && !cleanupPerformed.current && (news.length > 0 || orders.length > 0)) {
            const cleanup = async () => {
                const now = new Date();
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(now.getDate() - 3);
                
                const batch = writeBatch(firestore);
                let count = 0;
                
                // تنظيف الأخبار
                news.forEach(item => {
                    const itemDate = new Date(item.date);
                    const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
                    
                    // حذف الأخبار القديمة (أكثر من 3 أيام) - فقط إذا لم تكن مثبتة
                    if (!item.isPinned && itemDate < threeDaysAgo) {
                        batch.delete(doc(firestore, 'news', String(item.id)));
                        count++;
                        return;
                    }
                    
                    // حذف الأخبار التي انتهت مهلتها (سواء مثبتة أو لا)
                    if (expiresAt && expiresAt < now) {
                        batch.delete(doc(firestore, 'news', String(item.id)));
                        count++;
                    }
                });

                // تنظيف تعليقات الشحنات القديمة في الطلبات
                orders.forEach(order => {
                    if (order.shipmentComments && order.shipmentComments.length > 0) {
                        const originalCount = order.shipmentComments.length;
                        const filteredComments = order.shipmentComments.filter(c => {
                            const commentDate = new Date(c.date);
                            return commentDate >= threeDaysAgo;
                        });
                        
                        if (filteredComments.length !== originalCount) {
                            batch.update(doc(firestore, 'orders', String(order.id)), { shipmentComments: filteredComments });
                            count++;
                        }
                    }
                });
                
                if (count > 0) {
                    await batch.commit();
                    console.log(`Cleanup performed: ${count} items removed.`);
                }
                cleanupPerformed.current = true;
            };
            cleanup();
        }
    }, [currentUser, news.length, orders.length]);

    const lastOrderIdRef = useRef<number>(0);

    // Update lastOrderIdRef whenever orders change
    useEffect(() => {
        if (orders.length > 0) {
            const lp26Orders = orders.filter(o => o.id && o.id.startsWith('LP26-'));
            if (lp26Orders.length > 0) {
                const nums = lp26Orders.map(o => {
                    const m = o.id.match(/LP26-(\d+)/);
                    return m ? parseInt(m[1]) : 0;
                });
                const maxNum = Math.max(...nums);
                if (maxNum > lastOrderIdRef.current) {
                    lastOrderIdRef.current = maxNum;
                }
            }
        }
    }, [orders]);

    const updateInventoryStock = async (items: OrderItem[], direction: -1 | 1, existingBatch?: any) => {
        const batch = existingBatch || writeBatch(firestore);
        const productIds: string[] = Array.from(new Set(items.map(item => String(item.productId))));
        
        try {
            // Fetch all products in parallel to get latest stock
            const productSnaps = await Promise.all(productIds.map((id: string) => getDoc(doc(firestore, 'products', id))));
            const productsMap = new Map(productSnaps.filter(s => s.exists()).map(s => [s.id, s.data() as Product]));

            for (const item of items) {
                const prodData = productsMap.get(String(item.productId));
                if (prodData) {
                    const change = item.quantity * direction;
                    let newSizes = prodData.sizes || [];
                    let sizeFound = false;

                    if (item.size && newSizes.length > 0) {
                        newSizes = newSizes.map(s => {
                            if (s.size.toLowerCase() === item.size!.toLowerCase()) {
                                sizeFound = true;
                                return { ...s, stock: Math.max(0, s.stock + change) };
                            }
                            return s;
                        });
                    }

                    // Calculate new total stock
                    // If product has sizes, sum them up. If not, use the total stock field.
                    let newTotalStock;
                    if (newSizes.length > 0) {
                        // If the product has sizes but we didn't find the requested size, 
                        // we still sum up the sizes. The total stock will only change if the size was found.
                        newTotalStock = newSizes.reduce((sum, s) => sum + s.stock, 0);
                    } else {
                        newTotalStock = Math.max(0, prodData.stock + change);
                    }
                    
                    // Update the map so subsequent items for the same product use the new stock
                    const updatedProd = { ...prodData, stock: newTotalStock, sizes: newSizes };
                    productsMap.set(String(item.productId), updatedProd);
                    
                    batch.update(doc(firestore, 'products', String(item.productId)), { stock: newTotalStock, sizes: newSizes });
                }
            }
            if (!existingBatch) await batch.commit();
        } catch (error) {
            console.error("Error updating inventory stock:", error);
            throw error; // Re-throw to handle in caller
        }
    };

    const sendNotification = async (userId: number, message: string, type?: string, link?: string) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        const notif: AppNotification = { id, userId, message, isRead: false, date: new Date().toISOString(), type, link };
        await setDoc(doc(firestore, 'notifications', String(id)), notif);
        triggerSystemNotification('LibyPort', message, link);
    };

    const login = async (email: string, pass: string) => {
        const user = users.find(u => u.email === email && u.password === pass && !u.isDeleted);
        if (user) {
            if (!user.isActive) return { success: false, message: 'هذا الحساب موقوف حالياً، يرجى مراجعة الإدارة.' };
            if (!user.isApproved) return { success: false, message: 'الحساب بانتظار موافقة الإدارة.' };
            
            setCurrentUser(user);
            localStorage.setItem('libyport_user', JSON.stringify(user));
            updateDoc(doc(firestore, 'users', String(user.id)), { lastActive: new Date().toISOString() }).catch(() => {});
            return { success: true, message: 'تم تسجيل الدخول بنجاح' };
        }
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('libyport_user');
    };

    const getStoreNames = (storeIds: number[]) => {
        if (!storeIds || storeIds.length === 0) return 'بدون متجر';
        return stores.filter(s => storeIds.includes(s.id)).map(s => s.name).join(', ');
    };

    const runAutoArchive = async () => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const batch = writeBatch(firestore);
        const oldOrders = orders.filter(o => !o.isArchived && new Date(o.date) < threeMonthsAgo && o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered);
        if (oldOrders.length === 0) return;
        oldOrders.forEach(o => {
            batch.update(doc(firestore, 'orders', o.id), { isArchived: true });
        });
        await batch.commit();
    };

    const runNotificationCleanup = async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const batch = writeBatch(firestore);
        const unreadNotifs = notifications.filter(n => n.isRead && new Date(n.date) < sevenDaysAgo);
        if (unreadNotifs.length === 0) return;
        unreadNotifs.forEach(n => {
            batch.delete(doc(firestore, 'notifications', String(n.id)));
        });
        await batch.commit();
    };

    const addProduct = async (d: any) => {
        const id = Date.now();
        // Recalculate stock if sizes are provided
        let stock = d.stock || 0;
        if (d.sizes && d.sizes.length > 0) {
            stock = d.sizes.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);
        }
        const p = cleanData({ id, ...d, stock, isDeleted: false, isPendingDeletion: false });
        await setDoc(doc(firestore, 'products', String(id)), p);
        return p;
    };

    const updateProduct = async (id: number, up: any) => {
        const cleanedUpdates = cleanData(up);
        // If sizes are being updated, recalculate total stock
        if (cleanedUpdates.sizes) {
            cleanedUpdates.stock = cleanedUpdates.sizes.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);
        }
        await updateDoc(doc(firestore, 'products', String(id)), cleanedUpdates as any);
    };

    const resetData = () => {
        localStorage.clear();
        window.location.reload();
    };

    const wipeProducts = async () => {
        try {
            const productsCollection = collection(firestore, 'products');
            const snapshot = await getDocs(productsCollection);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            localStorage.removeItem('lp_cache_products');
            localStorage.removeItem('lp_db_seeded');
            
            window.location.reload();
        } catch (error) {
            console.error('Error wiping products:', error);
        }
    };

    const contextValue = useMemo(() => ({
        currentUser, setCurrentUser, isLoading, users, stores, products, orders, news, notifications,
        chatMessages, financialTransactions, withdrawalRequests, bankAccounts, treasuries, cart, systemSettings,
        shippingOrigins, shoppingBrands, deliveryPrices, landingImages, saleLandingImages, isSalePeriodActive,
        exchangeRate, treasuryBalances, highValueOrderContact, deletedCustomers, theme, language, t, setLanguage, setTheme, clients, clientTransactions,
        companyTransactions, companyInfo, currencyTransactions, currencyBalances,
        updateCompanyInfo: async(i: any) => { const newInfo = { ...companyInfo, ...i }; await setDoc(doc(firestore, 'settings', 'company'), newInfo); setCompanyInfo(newInfo); },
        updateSystemSettings: async(s: any) => { const newSettings = { ...systemSettings, ...s }; await setDoc(doc(firestore, 'settings', 'general'), newSettings, { merge: true }); setSystemSettings(newSettings); },
        updateExchangeRate: async(r: number) => {
            const today = new Date().toISOString().split('T')[0];
            const newHistory = [ ...(systemSettings.exchangeRateHistory || []).filter(h => h.date !== today), { rate: r, date: today } ];
            await setDoc(doc(firestore, 'settings', 'general'), { exchangeRateHistory: newHistory }, { merge: true });
            setSystemSettings(prev => ({ ...prev, exchangeRateHistory: newHistory }));
            setExchangeRate(r);
            const activeUsers = users.filter(u => u.isActive && !u.isDeleted);
            const notificationPromises = activeUsers.map(u => sendNotification(u.id, `تحديث مالي: تم تغيير سعر صرف الدولار الحالي إلى ${r.toFixed(2)} د.ل`, 'rate_change', '/financials'));
            await Promise.allSettled(notificationPromises);
        },
        login, logout, 
        registerUser: async(userData: any, storeNames: string[]) => {
            const newUserId = Date.now();
            const userRef = doc(firestore, 'users', String(newUserId));
            const createdStoreIds: number[] = [];
            const batch = writeBatch(firestore);
            storeNames.forEach(name => {
                const sId = Math.floor(Math.random() * 1000000);
                batch.set(doc(firestore, 'stores', String(sId)), { id: sId, name, ownerId: newUserId, isApproved: false }); // المتجر يحتاج اعتماد
                createdStoreIds.push(sId);
            });
            
            const finalUserData = { 
                ...userData, 
                id: newUserId, 
                storeIds: createdStoreIds, 
                isApproved: false, // يجب أن يوافق المسؤول
                isActive: true, 
                isDeleted: false, 
                lastActive: new Date().toISOString() 
            };
            
            batch.set(userRef, cleanData(finalUserData));
            await batch.commit();

            // تنبيه المسؤولين بوجود طلب جديد
            users.filter(u => u.role === UserRole.SuperAdmin || u.role === UserRole.Admin).forEach(adm => {
                sendNotification(adm.id, `طلب تسجيل جديد: قام ${userData.name} بإنشاء حساب شريك، يرجى المراجعة والاعتماد.`, 'new_user_request', `/users/${newUserId}`);
            });

            return { success: true, message: 'تم تقديم طلب التسجيل بنجاح! سيتم إخطارك فور تفعيل الحساب من قبل الإدارة.' };
        }, 
        updateUser: async(uid: number, updates: any) => {
            const cleanedUpdates = cleanData(updates);
            await updateDoc(doc(firestore, 'users', String(uid)), cleanedUpdates as any);
            if (currentUser && currentUser.id === uid) {
                const updatedUser = { ...currentUser, ...cleanedUpdates };
                setCurrentUser(updatedUser);
                localStorage.setItem('libyport_user', JSON.stringify(updatedUser));
            }
        }, 
        addUser: async(userData: any, storeNames: string[]) => {
            const newUserId = Date.now();
            const batch = writeBatch(firestore);
            const createdStoreIds: number[] = [];
            storeNames.forEach(name => {
                const sId = Math.floor(Math.random() * 1000000);
                batch.set(doc(firestore, 'stores', String(sId)), { id: sId, name, ownerId: newUserId, isApproved: true });
                createdStoreIds.push(sId);
            });
            
            const finalData = { 
                ...userData, 
                id: newUserId, 
                storeIds: createdStoreIds, 
                isApproved: true, 
                isActive: true, 
                isDeleted: false, 
                lastActive: new Date().toISOString() 
            };
            
            batch.set(doc(firestore, 'users', String(newUserId)), cleanData(finalData));
            await batch.commit();
        }, 
        deleteUser: async(uid: number) => { await updateDoc(doc(firestore, 'users', String(uid)), { isDeleted: true }); }, 
        getStoreNames, 
        approveStore: async(id: number) => {
            try {
                const s = stores.find(x => x.id === id);
                if(s) {
                    const batch = writeBatch(firestore);
                    batch.update(doc(firestore, 'stores', String(id)), { isApproved: true });
                    
                    const owner = users.find(u => u.id === s.ownerId);
                    if (owner) {
                        // حماية: التأكد من وجود المصفوفة قبل استخدامها
                        const currentStoreIds = owner.storeIds || [];
                        if (!currentStoreIds.includes(id)) {
                            batch.update(doc(firestore, 'users', String(s.ownerId)), { 
                                storeIds: [...currentStoreIds, id] 
                            });
                        }
                        await sendNotification(s.ownerId, `تهانينا! تم اعتماد متجرك "${s.name}" بنجاح في النظام.`, 'store_approved', '/stores');
                    }
                    await batch.commit();
                    return { success: true, message: 'تم الاعتماد بنجاح' };
                }
                return { success: false, message: 'المتجر غير موجود' };
            } catch (err) {
                console.error("Approve Store Error:", err);
                return { success: false, message: 'فشل في الاتصال بقاعدة البيانات' };
            }
        }, 
        deleteStore: async(id: number) => { 
            try {
                await deleteDoc(doc(firestore, 'stores', String(id))); 
                return { success: true, message: 'تم الحذف' }; 
            } catch (err) {
                return { success: false, message: 'فشل الحذف' };
            }
        }, 
        updateStore: async(id: number, up: any) => { await updateDoc(doc(firestore, 'stores', String(id)), cleanData(up) as any); },
        addToCart: (p: any, q: number, s: string) => setOrderItems(prev => {
            // Create a clean OrderItem by picking only necessary fields to avoid document bloat
            const newItem: OrderItem = {
                productId: p.productId || p.id,
                name: p.name,
                quantity: q || p.quantity || 1,
                price: p.price,
                basePriceSnapshot: p.basePriceSnapshot || p.price,
                size: s || p.size || '',
                image: p.image || '',
                sku: p.sku || '',
                costInUSD: p.costInUSD || 0,
                url: p.url || '',
                sourceWebsite: p.sourceWebsite || '',
                purchaseReference: p.purchaseReference || '',
                notes: p.notes || ''
            };
            return [...prev, newItem];
        }),
        removeFromCart: (id: number, size?: string) => setOrderItems(p => p.filter(x => x.productId !== id || (size !== undefined && x.size !== size))), 
        updateCartQuantity: (id: number, q: number, size?: string) => setOrderItems(p => p.map(x => (x.productId === id && (size === undefined || x.size === size)) ? { ...x, quantity: q } : x)), 
        updateCartItemSize: (id: number, s: string, oldSize?: string) => setOrderItems(p => p.map(x => (x.productId === id && (oldSize === undefined || x.size === oldSize)) ? { ...x, size: s } : x)), 
        clearCart: () => setOrderItems([]),
        addOrder: async (d: any) => {
            try {
                // Use cached last ID if available to avoid extra DB round-trip
                let nextNum = lastOrderIdRef.current + 1;
                
                // Fallback to DB check only if we don't have enough data or to be absolutely sure
                if (nextNum === 1) {
                    const ordersRef = collection(firestore, 'orders');
                    const q = query(ordersRef, where('id', '>=', 'LP26-'), where('id', '<=', 'LP26-9999'), orderBy('id', 'desc'), limit(1));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        const lastId = snap.docs[0].id; 
                        const lastNumMatch = lastId.match(/LP26-(\d+)/);
                        if (lastNumMatch && lastNumMatch[1]) { nextNum = parseInt(lastNumMatch[1]) + 1; }
                    }
                }
                
                const id = `LP26-${String(nextNum).padStart(4, '0')}`;
                lastOrderIdRef.current = Math.max(lastOrderIdRef.current, nextNum);

                const batch = writeBatch(firestore);
                
                // 1. Update stock in the same batch
                await updateInventoryStock(d.items, -1, batch);
                
                // 2. Prepare order data
                const orderWithDefaults = { 
                    ...d, 
                    id, 
                    date: d.date || new Date().toISOString(), 
                    isStockDeducted: true, 
                    purchaseTrackingStatus: d.purchaseTrackingStatus || PurchaseTrackingStatus.Pending, 
                    deliveryTrackingStatus: d.deliveryTrackingStatus || DeliveryTrackingStatus.Pending, 
                    isDeleted: false, 
                    isPendingDeletion: false 
                };
                
                // 3. Add order to batch
                batch.set(doc(firestore, 'orders', id), cleanData(orderWithDefaults));
                
                // 4. Commit everything at once
                await batch.commit();
                
                // Async notification sending - don't wait for it to return success
                users.filter(u => u.role === UserRole.Admin || u.role === UserRole.SuperAdmin).forEach(adm => {
                    sendNotification(adm.id, `فاتورة جديدة: تم تسجيل طلبية #${id} للزبون ${d.customerName}`, 'new_order', `/orders/${id}`);
                });
                
                return { success: true, id };
            } catch (error: any) {
                console.error("Add Order Error:", error);
                return { success: false, message: 'فشل في حفظ الفاتورة: ' + (error.message || 'خطأ غير معروف') };
            }
        }, 
        updateOrder: async (oid: string, up: any) => { 
            const existingOrder = orders.find(o => o.id === oid);
            if (!existingOrder) return;
            
            const batch = writeBatch(firestore);
            let needsBatch = false;

            // Logic for returning stock and cancelling order on Return status
            const isBecomingReturned = up.deliveryTrackingStatus && 
                (up.deliveryTrackingStatus === DeliveryTrackingStatus.Returned || up.deliveryTrackingStatus === DeliveryTrackingStatus.ReturnedToCompany) &&
                existingOrder.deliveryTrackingStatus !== up.deliveryTrackingStatus;

            if (isBecomingReturned && existingOrder.isStockDeducted) {
                await updateInventoryStock(existingOrder.items, 1, batch);
                (up as any).isStockDeducted = false;
                (up as any).purchaseTrackingStatus = PurchaseTrackingStatus.Cancelled;
                needsBatch = true;
            }

            const cleanUpdate = cleanData(up);
            
            if (needsBatch) {
                batch.update(doc(firestore, 'orders', String(oid)), cleanUpdate as any);
                await batch.commit();
            } else {
                await updateDoc(doc(firestore, 'orders', String(oid)), cleanUpdate as any); 
            }

            // منطق الإشعارات التلقائي للمستخدم (صاحب المتجر)
            const store = stores.find(s => s.id === existingOrder.storeId);
            if (store && store.ownerId) {
                // إذا تغيرت حالة الشراء
                if (up.purchaseTrackingStatus && up.purchaseTrackingStatus !== existingOrder.purchaseTrackingStatus) {
                    sendNotification(store.ownerId, `تحديث طلبية: الفاتورة #${oid} تغيرت حالة الشراء فيها إلى: ${up.purchaseTrackingStatus}`, 'order_status', `/orders/${oid}`);
                }
                // إذا تغيرت حالة التوصيل
                if (up.deliveryTrackingStatus && up.deliveryTrackingStatus !== existingOrder.deliveryTrackingStatus) {
                    sendNotification(store.ownerId, `تحديث شحنة: الفاتورة #${oid} تغيرت حالة الشحن فيها إلى: ${up.deliveryTrackingStatus}`, 'order_status', `/shipments`);
                }
            }
        },
        deleteOrderDirectly: async(id: string)=>{ 
            const orderToDelete = orders.find(o => o.id === id);
            if (orderToDelete?.isStockDeducted) { await updateInventoryStock(orderToDelete.items, 1); }
            await deleteDoc(doc(firestore, 'orders', String(id))); 
        }, 
        addProduct,
        updateProduct,
        deleteProductDirectly: async(id: number) => { await deleteDoc(doc(firestore, 'products', String(id))); },
        approveDeletion: async(type: 'order' | 'product', id: string | number) => {
            if (type === 'order') {
                const orderToApprove = orders.find(o => String(o.id) === String(id));
                if (orderToApprove?.isStockDeducted) { await updateInventoryStock(orderToApprove.items, 1); }
                await deleteDoc(doc(firestore, 'orders', String(id)));
            } else { await deleteDoc(doc(firestore, 'products', String(id))); }
        }, 
        addInstantProductsBatch: async(newProducts: any[]) => {
            try {
                const batch = writeBatch(firestore);
                newProducts.forEach((p, index) => {
                    const id = Date.now() + index;
                    const docRef = doc(firestore, 'products', String(id));
                    batch.set(docRef, cleanData({ ...p, id, isDeleted: false, isPendingDeletion: false, dateAdded: new Date().toISOString() }));
                });
                await batch.commit();
                return { success: true, message: 'تمت إضافة المنتجات بنجاح' };
            } catch (e: any) { return { success: false, message: 'فشل في حفظ المنتجات' }; }
        }, 
        addNews: async (title: string, content: string, videoUrl?: string, isPinned?: boolean, expiresAt?: string) => {
            if (!currentUser) return;
            const id = Date.now();
            const newNews: News = cleanData({ 
                id, 
                title, 
                content, 
                date: new Date().toISOString(), 
                authorId: currentUser.id, 
                seenBy: [], 
                videoUrl,
                isPinned,
                expiresAt
            });
            await setDoc(doc(firestore, 'news', String(id)), newNews);
        },
        updateNews: async (id: number, up: any) => { await updateDoc(doc(firestore, 'news', String(id)), cleanData(up) as any); },
        deleteNews: async (id: number) => { await deleteDoc(doc(firestore, 'news', String(id))); },
        sendChatMessage: async(msg: any, receiverId: number)=>{
            if (!currentUser || !receiverId) return;
            const isAdmin = currentUser.role === UserRole.Admin || currentUser.role === UserRole.SuperAdmin;
            const id = Date.now();
            const newMsg: ChatMessage = cleanData({ id, conversationId: isAdmin ? receiverId : currentUser.id, senderId: currentUser.id, senderName: currentUser.name, content: msg.content, timestamp: new Date().toISOString(), isRead: false, attachmentUrl: msg.attachmentUrl });
            await setDoc(doc(firestore, 'chatMessages', String(id)), newMsg);
            sendNotification(receiverId, `رسالة جديدة من ${currentUser.name}`, 'chat', '/support');
        }, 
        markMessagesAsRead: async(convoId: number) => {
            if (!currentUser) return;
            const batch = writeBatch(firestore);
            const unreadMsgs = chatMessages.filter(m => m.conversationId === convoId && !m.isRead && m.senderId !== currentUser.id);
            if (unreadMsgs.length === 0) return;
            unreadMsgs.forEach(m => { batch.update(doc(firestore, 'chatMessages', String(m.id)), { isRead: true, readAt: new Date().toISOString() }); });
            await batch.commit();
        }, 
        markNotificationsAsRead: async () => {
            if (!currentUser) return;
            const batch = writeBatch(firestore);
            const unread = notifications.filter(n => Number(n.userId) === Number(currentUser.id) && !n.isRead);
            if (unread.length === 0) return;
            unread.forEach(n => { batch.update(doc(firestore, 'notifications', String(n.id)), { isRead: true }); });
            await batch.commit();
        }, 
        markNotificationAsRead: async (nid: number | string) => { await updateDoc(doc(firestore, 'notifications', String(nid)), { isRead: true }); }, 
        addFinancialTransaction: async (data: any) => {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            await setDoc(doc(firestore, 'financialTransactions', String(id)), cleanData({ ...data, id }));
        },
        requestWithdrawal: async(amount: number) => {
            if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };
            const id = Date.now();
            const req: WithdrawalRequest = { id, userId: currentUser.id, amount, status: WithdrawalRequestStatus.Pending, requestDate: new Date().toISOString() };
            await setDoc(doc(firestore, 'withdrawalRequests', String(id)), req);
            return { success: true, message: 'تم تقديم الطلب' };
        }, 
        updateWithdrawalRequestStatus: async (id: number, status: WithdrawalRequestStatus, treasuryType?: TreasuryType, treasuryId?: string) => {
            const req = withdrawalRequests.find(r => r.id === id);
            if (req) { 
                await updateDoc(doc(firestore, 'withdrawalRequests', String(id)), { 
                    status, 
                    decisionDate: new Date().toISOString(), 
                    processedBy: currentUser?.id,
                    treasuryType: treasuryType || null,
                    treasuryId: treasuryId || null
                }); 

                if (status === WithdrawalRequestStatus.Approved && treasuryId) {
                    // Create a financial transaction for the withdrawal
                    const txId = Date.now() + Math.floor(Math.random() * 1000);
                    await setDoc(doc(firestore, 'financialTransactions', String(txId)), cleanData({
                        id: txId,
                        userId: req.userId,
                        type: TransactionType.Withdrawal,
                        amount: req.amount,
                        date: new Date().toISOString(),
                        notes: `سحب رصيد - طلب #${req.id}`,
                        processedBy: currentUser?.id || 0,
                        treasuryType,
                        treasuryId
                    }));
                }
            }
        }, 
        addBankAccount: async(bankName: string, accountNumber: string) => { const id = Date.now() + Math.floor(Math.random() * 1000); await setDoc(doc(firestore, 'bankAccounts', String(id)), { id, bankName, accountNumber }); },
        deleteBankAccount: async(id: number) => { await deleteDoc(doc(firestore, 'bankAccounts', String(id))); },
        addTreasury: async(data: any) => { 
            const id = `tr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
            await setDoc(doc(firestore, 'treasuries', id), { ...data, id }); 
        },
        updateTreasury: async(id: string, up: any) => { await updateDoc(doc(firestore, 'treasuries', id), cleanData(up)); },
        deleteTreasury: async(id: string) => { await deleteDoc(doc(firestore, 'treasuries', id)); },
        sendNotification: sendNotification,
        runAutoArchive: runAutoArchive,
        runNotificationCleanup: runNotificationCleanup,
        addClient: async(data: any) => {
            const id = String(Date.now() + Math.floor(Math.random() * 1000));
            const newClient: Client = { ...data, id, balance: 0, totalPurchases: 0, lastTransactionDate: new Date().toISOString() };
            await setDoc(doc(firestore, 'clients', id), newClient);
            return newClient;
        }, 
        addClientTransaction: async(clientId: string, amount: number, type: ClientTransactionType, notes: string, referenceId?: string) => {
            const id = String(Date.now() + Math.floor(Math.random() * 1000));
            const tx: ClientTransaction = cleanData({ 
                id, 
                clientId, 
                amount, 
                type, 
                notes, 
                referenceId: referenceId || null, 
                date: new Date().toISOString(), 
                processedBy: currentUser?.id || 0 
            });
            await setDoc(doc(firestore, 'clientTransactions', id), tx);
            return { success: true, transactionId: id };
        }, 
        addCompanyTransaction: async(data: any)=>{
            const id = String(Date.now() + Math.floor(Math.random() * 1000));
            await setDoc(doc(firestore, 'companyTransactions', id), cleanData({ ...data, id }));
        }, 
        updateCompanyTransaction: async(id: string, up: any)=>{ await updateDoc(doc(firestore, 'companyTransactions', String(id)), cleanData(up) as any); }, 
        deleteCompanyTransaction: async(id: string)=>{ await deleteDoc(doc(firestore, 'companyTransactions', String(id))); }, 
        addCurrencyTransaction: async (data: any) => { const id = String(Date.now() + Math.floor(Math.random() * 1000)); await setDoc(doc(firestore, 'currencyTransactions', id), cleanData({ ...data, id })); },
        deleteCurrencyTransaction: async (id: string) => { await deleteDoc(doc(firestore, 'currencyTransactions', String(id))); },
        addDeliveryPrice: async (data: any) => { const id = String(Date.now() + Math.floor(Math.random() * 1000)); await setDoc(doc(firestore, 'deliveryPrices', id), cleanData({ ...data, id })); },
        updateDeliveryPrice: async (id: string, up: any) => { await updateDoc(doc(firestore, 'deliveryPrices', id), cleanData(up)); },
        deleteDeliveryPrice: async (id: string) => { await deleteDoc(doc(firestore, 'deliveryPrices', id)); },
        refreshData: () => { window.location.reload(); },
        resetData,
        wipeProducts,
        changePassword: (id: number, o: string, n: string) => ({ success: true, message: '' }),
        requestPasswordReset: async () => ({ success: true, message: '', code: '', email: '' }),
        resetPassword: async () => ({ success: true, message: '' }),
        requestNewStore: async () => ({ success: true, message: '' }),
        bulkUpdateOrders: async () => { },
        requestOrderUpdate: async (orderId: string, updates: Partial<Order>, reason: string) => {
            if (!currentUser) return;
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            const updateRequest = {
                id: String(Date.now()),
                orderId,
                updates,
                reason,
                status: 'pending',
                requestedBy: currentUser.id,
                date: new Date().toISOString()
            };

            await updateDoc(doc(firestore, 'orders', orderId), {
                pendingUpdate: updateRequest
            });

            // Notify admins
            const admins = users.filter(u => u.role === UserRole.Admin || u.role === UserRole.SuperAdmin);
            for (const admin of admins) {
                await sendNotification(admin.id, `طلب تعديل فاتورة: ${order.id} من قبل ${currentUser.name}`, 'order_update_request', `/deletion-requests`);
            }
        },
        approveOrderUpdate: async (orderId: string) => {
            const order = orders.find(o => o.id === orderId);
            if (!order || !order.pendingUpdate) return;

            const { updates } = order.pendingUpdate;
            
            // Apply updates
            await updateDoc(doc(firestore, 'orders', orderId), {
                ...updates,
                pendingUpdate: deleteField()
            });

            // Notify requester
            await sendNotification(order.pendingUpdate.requestedBy, `تمت الموافقة على طلب تعديل الفاتورة: ${order.id}`, 'order_update_approved', `/orders/${orderId}`);
        },
        rejectOrderUpdate: async (orderId: string) => {
            const order = orders.find(o => o.id === orderId);
            if (!order || !order.pendingUpdate) return;

            await updateDoc(doc(firestore, 'orders', orderId), {
                pendingUpdate: deleteField()
            });

            // Notify requester
            await sendNotification(order.pendingUpdate.requestedBy, `تم رفض طلب تعديل الفاتورة: ${order.id}`, 'order_update_rejected', `/orders/${orderId}`);
        },
        addShipmentComment: async (orderId: string, comment: string) => {
            const order = orders.find(o => o.id === orderId);
            if (!order || !currentUser) return;
            
            const newComment = {
                comment,
                date: new Date().toISOString(),
                authorId: currentUser.id
            };
            
            const updatedComments = [...(order.shipmentComments || []), newComment];
            await updateDoc(doc(firestore, 'orders', orderId), { shipmentComments: updatedComments });
            
            // Send notification to the store owner/beneficiary
            if (currentUser.role === UserRole.SuperAdmin || currentUser.role === UserRole.Admin) {
                await sendNotification(order.beneficiaryId, `تحديث جديد على الشحنة #${orderId}: ${comment}`, 'shipment_update', `/orders/${orderId}`);
            }
        },
        requestDeletion: async () => { },
        rejectDeletion: async () => { },
        approveProductUpdate: async () => { },
        rejectProductUpdate: async () => { },
        addReview: async () => { },
        markNewsAsSeen: async (id: number) => {
            if (!currentUser) return;
            const item = news.find(n => n.id === id);
            if (!item) return;

            const updatedSeenBy = [...(item.seenBy || [])];
            if (!updatedSeenBy.includes(currentUser.id)) {
                updatedSeenBy.push(currentUser.id);
                
                const updates: any = { seenBy: updatedSeenBy };
                // إذا تمت مشاهدتها، تبدأ مهلة الـ 3 أيام للحذف النهائي
                if (!item.expiresAt) {
                    const expiry = new Date();
                    expiry.setDate(expiry.getDate() + 3);
                    updates.expiresAt = expiry.toISOString();
                }
                
                await updateDoc(doc(firestore, 'news', String(id)), updates);
            }
        },
        runNewsCleanup: async () => {
            if (news.length === 0) return;
            const now = new Date();
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(now.getDate() - 3);
            
            const batch = writeBatch(firestore);
            let count = 0;
            
            news.forEach(item => {
                const itemDate = new Date(item.date);
                const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
                
                // حذف الأخبار القديمة (أكثر من 3 أيام) - فقط إذا لم تكن مثبتة
                if (!item.isPinned && itemDate < threeDaysAgo) {
                    batch.delete(doc(firestore, 'news', String(item.id)));
                    count++;
                    return;
                }
                
                // حذف الأخبار التي انتهت مهلتها (سواء مثبتة أو لا)
                if (expiresAt && expiresAt < now) {
                    batch.delete(doc(firestore, 'news', String(item.id)));
                    count++;
                }
            });
            
            // تنظيف تعليقات الشحنات القديمة في الطلبات (أكثر من 3 أيام)
            orders.forEach(order => {
                if (order.shipmentComments && order.shipmentComments.length > 0) {
                    const originalCount = order.shipmentComments.length;
                    const filteredComments = order.shipmentComments.filter(c => {
                        const commentDate = new Date(c.date);
                        return commentDate >= threeDaysAgo;
                    });
                    
                    if (filteredComments.length !== originalCount) {
                        batch.update(doc(firestore, 'orders', String(order.id)), { shipmentComments: filteredComments });
                        count++;
                    }
                }
            });
            
            if (count > 0) {
                await batch.commit();
            }
        },
        recalculateClientBalance: async () => { },
        deleteClient: async () => { },
        deleteClientTransaction: async (txId: string) => { await deleteDoc(doc(firestore, 'clientTransactions', String(txId))); },
        syncAllOrdersWithMasterData: async () => ({ success: true, count: 0, message: '' }),
        syncOrderWithMasterData: async () => ({ success: true, message: '' }),
        settleCompanyDebt: async () => { },
        deleteCustomer: async () => { },
        sendContactFormMessage: async () => ({ success: true, message: '' }),
        updateHeroImages: () => { },
        updateSalePeriodStatus: () => { },
        updateSalePeriodStatusAction: () => { },
        updateCalculatorSettings: async () => { },
        getExchangeRateForDate: (d: string) => exchangeRate,
        addShippingOrigin: async(origin: ShippingOrigin) => { await setDoc(doc(firestore, 'shippingOrigins', origin.id), cleanData(origin)); },
        updateShippingOrigin: async(id: string, updates: Partial<ShippingOrigin>) => { await updateDoc(doc(firestore, 'shippingOrigins', id), cleanData(updates)); },
        deleteShippingOrigin: async(id: string) => { await deleteDoc(doc(firestore, 'shippingOrigins', id)); },
        addShoppingBrand: async(brand: ShoppingBrand) => { await setDoc(doc(firestore, 'shoppingBrands', brand.id), cleanData(brand)); },
        updateShoppingBrand: async(id: string, updates: Partial<ShoppingBrand>) => { await updateDoc(doc(firestore, 'shoppingBrands', id), cleanData(updates)); },
        deleteShoppingBrand: async(id: string) => { await deleteDoc(doc(firestore, 'shoppingBrands', id)); },
        resetSystemDefaults: async () => { },
        fixInvoiceIds: async () => ({ success: true, message: '' }),
        resequence2026Invoices: async () => ({ success: true, message: '', count: 0 }),
        fixAllProductsStock: async () => {
            try {
                const productsRef = collection(firestore, 'products');
                const snapshot = await getDocs(productsRef);
                let count = 0;
                const batch = writeBatch(firestore);

                snapshot.docs.forEach(docSnap => {
                    const product = docSnap.data() as Product;
                    if (product.sizes && product.sizes.length > 0) {
                        const calculatedStock = product.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
                        if (product.stock !== calculatedStock) {
                            batch.update(docSnap.ref, { stock: calculatedStock });
                            count++;
                        }
                    }
                });

                if (count > 0) {
                    await batch.commit();
                }

                return { success: true, message: `تم تحديث مخزون ${count} منتج بنجاح.` };
            } catch (error) {
                console.error("Error fixing all products stock:", error);
                return { success: false, message: "حدث خطأ أثناء تحديث المخزون." };
            }
        },
        fixStockForOrder: async (orderId: string) => {
            const order = orders.find(o => o.id === orderId);
            if (!order) return { success: false, message: 'الفاتورة غير موجودة' };
            
            const batch = writeBatch(firestore);
            const productIds: string[] = Array.from(new Set(order.items.map(item => String(item.productId))));
            
            try {
                const productSnaps = await Promise.all(productIds.map((id: string) => getDoc(doc(firestore, 'products', id))));
                let fixedCount = 0;
                
                productSnaps.forEach(snap => {
                    if (snap.exists()) {
                        const data = snap.data() as Product;
                        if (data.sizes && data.sizes.length > 0) {
                            const actualTotal = data.sizes.reduce((sum, s) => sum + s.stock, 0);
                            if (actualTotal !== data.stock) {
                                batch.update(snap.ref, { stock: actualTotal } as any);
                                fixedCount++;
                            }
                        }
                    }
                });
                
                if (fixedCount > 0) {
                    await batch.commit();
                    return { success: true, message: `تم تصحيح المخزون لـ ${fixedCount} منتج مرتبط بهذه الفاتورة.` };
                }
                return { success: true, message: 'المخزون متزامن بالفعل لجميع منتجات هذه الفاتورة.' };
            } catch (error) {
                console.error("Fix Stock Error:", error);
                return { success: false, message: 'فشل في تصحيح المخزون' };
            }
        },
        fixStockForAllOrders: async () => ({ success: true, message: '', count: 0 }),
        fixStockStartingFrom: async () => ({ success: true, message: '', count: 0 }),
        runSpecificStockCorrection_143_178: async () => ({ success: true, message: '', processed: 0, skipped: 0 }),
    }), [
        currentUser, isLoading, users, stores, products, orders, news, notifications,
        chatMessages, financialTransactions, withdrawalRequests, bankAccounts, treasuries, cart, systemSettings,
        shippingOrigins, shoppingBrands, deliveryPrices, landingImages, saleLandingImages, isSalePeriodActive,
        exchangeRate, treasuryBalances, highValueOrderContact, deletedCustomers, theme, language, t, clients, clientTransactions,
        companyTransactions, companyInfo, currencyTransactions, currencyBalances
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
export const useAppContext = () => useContext(AppContext);