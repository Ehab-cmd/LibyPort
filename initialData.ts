
import { User, Store, Product, Order, News, AppNotification, ChatMessage, FinancialTransaction, WithdrawalRequest, BankAccount, UserRole, OrderType, ProductCategory, PaymentMethod, PurchaseTrackingStatus, DeliveryTrackingStatus, TransactionType, WithdrawalRequestStatus, AccountingSystem } from './types';

const STORES: Store[] = [
    { id: 1, name: 'LibyPort', ownerId: 1, isApproved: true },
];

const USERS: User[] = [
    { 
        id: 1, 
        name: 'ايهاب قنيدي', 
        email: 'eganidi96@gmail.com', 
        password: '032897', 
        role: UserRole.SuperAdmin, 
        storeIds: [1], 
        isApproved: true, 
        isActive: true, 
        isDeleted: false, 
        phone: '0944400399', 
        city: 'طرابلس', 
        address: 'جنزور', 
    },
    { 
        id: 2, 
        name: 'hanno essid', 
        email: 'hanno@libyport.com', 
        role: UserRole.Employee, 
        storeIds: [1], 
        isApproved: true, 
        isActive: false, 
        isDeleted: false, 
        phone: '0900000000', 
        city: 'طرابلس', 
        address: 'غير محدد', 
        accountingSystem: AccountingSystem.Commission,
    },
];

const PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'ساعة ذكية Ultra 2',
        description: 'ساعة ذكية متطورة مع شاشة Retina وميزات تتبع الصحة.',
        price: 1250,
        category: ProductCategory.Accessories,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop',
        stock: 15,
        storeId: 1,
        sku: 'W-ULTRA-2',
        isPendingDeletion: false,
        isInstant: true,
        isDeleted: false,
    },
    {
        id: 2,
        name: 'سماعات AirPods Pro',
        description: 'سماعات لاسلكية مع ميزة إلغاء الضوضاء النشطة.',
        price: 850,
        category: ProductCategory.Accessories,
        image: 'https://images.unsplash.com/photo-1588423770113-969239785831?q=80&w=1000&auto=format&fit=crop',
        stock: 20,
        storeId: 1,
        sku: 'A-PRO-2',
        isPendingDeletion: false,
        isInstant: true,
        isDeleted: false,
    },
    {
        id: 3,
        name: 'حقيبة ظهر جلدية فاخرة',
        description: 'حقيبة ظهر مصنوعة من الجلد الطبيعي بتصميم عصري.',
        price: 450,
        category: ProductCategory.Bags,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
        stock: 10,
        storeId: 1,
        sku: 'B-LEATHER-1',
        isPendingDeletion: false,
        isInstant: true,
        isDeleted: false,
    }
];

const ORDERS: Order[] = [
    {
        id: '1001',
        customerName: 'أحمد محمد',
        phone1: '0912345678',
        city: 'طرابلس',
        address: 'حي الأندلس',
        storeId: 1,
        beneficiaryId: 1,
        items: [
            { productId: 1, name: 'ساعة ذكية Ultra 2', price: 1250, quantity: 1 }
        ],
        total: 1250,
        orderType: OrderType.InstantDelivery,
        productType: ProductCategory.Accessories,
        paymentMethod: PaymentMethod.Cash,
        purchaseTrackingStatus: PurchaseTrackingStatus.Purchased,
        deliveryTrackingStatus: DeliveryTrackingStatus.Arrived,
        date: new Date().toISOString(),
        isPendingDeletion: false,
        isDeleted: false,
        isDepositPaid: true,
    }
];

const NEWS: News[] = [
    {
        id: 1,
        title: 'تخفيضات الربيع الكبرى',
        content: 'استمتع بخصومات تصل إلى 30% على جميع المنتجات في متجرنا.',
        date: new Date().toISOString(),
        authorId: 1,
        seenBy: [],
    },
    {
        id: 2,
        title: 'تحديث جديد لنظام التتبع',
        content: 'يمكنكم الآن تتبع شحناتكم بدقة أعلى عبر تطبيقنا.',
        date: new Date().toISOString(),
        authorId: 1,
        seenBy: [],
    }
];
const NOTIFICATIONS: AppNotification[] = [];
const CHAT_MESSAGES: ChatMessage[] = [];
const FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [];
const WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [];

const BANK_ACCOUNTS: BankAccount[] = [
    { id: 1, bankName: 'مصرف الجمهورية', accountNumber: '141201000012314' },
    { id: 2, bankName: 'مصرف الاسلامي', accountNumber: '137912443404016' },
    { id: 3, bankName: 'مصرف النوران', accountNumber: '10207486020601' },
    { id: 4, bankName: 'مصرف السريا', accountNumber: '10000000816513' },
];

const DELETED_CUSTOMERS: string[] = [];

export const initialData = {
    users: USERS,
    stores: STORES,
    products: PRODUCTS,
    orders: ORDERS,
    news: NEWS,
    notifications: NOTIFICATIONS,
    chatMessages: CHAT_MESSAGES,
    financialTransactions: FINANCIAL_TRANSACTIONS,
    withdrawalRequests: WITHDRAWAL_REQUESTS,
    bankAccounts: BANK_ACCOUNTS,
    deletedCustomers: DELETED_CUSTOMERS,
};
