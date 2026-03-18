
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

const PRODUCTS: Product[] = [];

const ORDERS: Order[] = [];
const NEWS: News[] = [];
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
