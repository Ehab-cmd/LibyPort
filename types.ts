export enum UserRole {
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin',
    Store = 'Store',
    Employee = 'Employee',
}

export enum AccountingSystem {
    Margin = 'Margin', 
    Commission = 'Commission',
}

export enum OrderType {
    NewPurchase = 'شراء جديد',
    DepositPurchase = 'شراء بعربون',
    InstantDelivery = 'توصيل فوري',
    Procurement = 'مبيعات خاصة (شراء من الخارج)', 
}

export enum ProductCategory {
    WomenClothing = 'ملابس نسائية',
    MenClothing = 'ملابس رجالية',
    KidsClothing = 'ملابس أطفال',
    BabyClothing = 'ملابس رضع',
    WomenShoes = 'أحذية نسائية',
    MenShoes = 'أحذية رجالية',
    KidsShoes = 'أحذية أطفال',
    Bags = 'حقائب',
    Accessories = 'اكسسوارات',
    Miscellaneous = 'متنوعة',
}

export enum PaymentMethod {
    Cash = 'نقدا',
    BankCard = 'بطاقة مصرفية',
    BankTransfer = 'تحويل مصرفي',
    OnlinePayment = 'الدفع الالكتروني عبر الانترنت',
}

export enum PurchaseTrackingStatus {
    Pending = 'قيد الانتظار',
    Processing = 'قيد التجهيز',
    Purchased = 'تم الشراء',
    OnHold = 'معلق',
    Cancelled = 'ملغي',
}

export enum DeliveryTrackingStatus {
    Pending = 'قيد التجهيز',
    InternationalShipping = 'شحن دولي',
    Arrived = 'وصلت للمخزن',
    LocalShipping = 'شحن محلي',
    Delivered = 'تم التسليم',
    ReturnedToCompany = 'مرتجع في شركة التوصيل',
    Returned = 'مرتجع',
}

export enum TreasuryType {
    Cash = 'خزينة نقدية (عهدة موظف)',
    Bank = 'حساب مصرفي',
    DeliveryCompany = 'ذمة شركة توصيل',
    POS = 'خزينة البطاقات (POS)',
    Online = 'بوابات الدفع الإلكتروني'
}

export enum CurrencyType {
    USD = 'USD',
    EUR = 'EUR',
    AED = 'AED',
    SAR = 'SAR',
    LYD = 'LYD'
}

export enum CurrencyTxType {
    Buy = 'شراء عملة',
    Spend = 'شراء بضاعة (صرف رصيد)',
    Adjustment = 'تسوية رصيد/إيداع'
}

export interface CurrencyTransaction {
    id: string;
    date: string;
    type: CurrencyTxType;
    currency: CurrencyType;
    amount: number;
    rateToLYD?: number; 
    lydAmount?: number; 
    description: string;
    orderId?: string;
}

export enum TransactionType {
    Payment = 'إيصال سداد مشتريات',
    Withdrawal = 'إيصال سحب رصيد',
    SubscriptionFee = 'خصم اشتراك شهري',
    Collection = 'تحصيل مبيعات',
}

export enum ClientTransactionType {
    Invoice = 'فاتورة مبيعات',
    Payment = 'سند قبض (دفعة)',
    Return = 'مرتجع',
    OpeningBalance = 'رصيد افتتاحي'
}

export interface Treasury {
    id: string;
    name: string;
    type: TreasuryType;
    isActive: boolean;
    userId?: number;
    bankId?: number;
    initialBalance?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    storeIds: number[];
    isApproved: boolean;
    isActive: boolean;
    isDeleted: boolean;
    hasSeenTutorial?: boolean; 
    phone: string;
    city: string;
    address: string;
    profilePicture?: string;
    lastActive?: string; 
    subscriptionType?: SubscriptionType;
    accountingSystem?: AccountingSystem; 
    contractUrl?: string; 
    fixedSalary?: number;
    customExchangeRate?: number;
    isSubscriptionExempt?: boolean;
    isCommissionExempt?: boolean;
}

export interface OrderItem {
    productId: number;
    name: string;
    quantity: number;
    price: number;
    basePriceSnapshot?: number; // السعر الأصلي في النظام (للفوري)
    size?: string;
    image?: string;
    url?: string;
    sku?: string;
    costInUSD?: number;
    sourceWebsite?: string; 
    purchaseReference?: string;
    notes?: string;
    weight?: number;
    brandId?: string;
}

export interface Order {
    id: string;
    storeId: number;
    beneficiaryId: number; 
    customerName: string;
    phone1: string;
    phone2?: string;
    city: string;
    address: string;
    items: OrderItem[];
    total: number;
    date: string;
    orderType: OrderType;
    productType: ProductCategory;
    paymentMethod: PaymentMethod;
    bankTransferDetails?: string;
    bankTransferReceiptUrl?: string;
    isPaymentConfirmed?: boolean;
    deposit?: number;
    depositCommission?: number; 
    depositTreasuryType?: TreasuryType;
    depositTreasuryId?: string;
    discount?: number;
    shippingCost?: number;
    adsCost?: number;
    costInUSD?: number;
    exchangeRateSnapshot?: number;
    notes?: string;
    purchaseTrackingStatus: PurchaseTrackingStatus;
    deliveryTrackingStatus: DeliveryTrackingStatus;
    internationalTrackingNumber?: string;
    localTrackingNumber?: string;
    isPendingDeletion: boolean;
    isDeleted: boolean;
    isArchived?: boolean;
    deletionReason?: string;
    isPendingUpdate?: boolean;
    updateReason?: string;
    pendingUpdate?: {
        requestedBy: number;
        requestedAt: string;
        reason: string;
        updates: Partial<Order>;
    };
    isDepositPaid?: boolean;
    depositTrackingNumber?: string;
    shipmentComments?: { comment: string; date: string; authorId: number; }[];
    isStockDeducted?: boolean;
    expectedDeliveryDate?: string;
    isCollectedByCompany?: boolean; 
    collectedToTreasury?: TreasuryType; 
    collectionTreasuryId?: string; 
    deliveryCompanyId?: string;
}

export interface Store {
    id: number;
    name: string;
    ownerId: number;
    isApproved: boolean;
}

export interface ProductVariant {
    size: string;
    stock: number;
}

// Added missing Review interface
export interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

// Added missing BankAccount interface
export interface BankAccount {
    id: number;
    bankName: string;
    accountNumber: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: ProductCategory;
    storeId: number;
    sku: string;
    isPendingDeletion: boolean;
    isDeleted: boolean;
    deletionReason?: string;
    url?: string;
    image?: string;
    images?: string[]; 
    costInUSD?: number;
    isInstant: boolean;
    size?: string;
    sizes?: ProductVariant[];
    createdBy?: number;
    creatorName?: string;
    isPendingUpdate?: boolean;
    updateReason?: string;
    pendingUpdates?: string;
    isAggregated?: boolean;
    description?: string;
    brandId?: string;
    weight?: number;
    // Updated Product interface to include reviews and averageRating
    reviews?: Review[];
    averageRating?: number;
}

export enum WithdrawalRequestStatus {
    Pending = 'قيد المراجعة',
    Approved = 'تمت الموافقة',
    Rejected = 'مرفوض',
}

export enum SubscriptionType {
    None = 'بدون',
    VIP = 'LibyPort VIP Store',
    Standard = 'LibyPort Store',
}

export enum CompanyTxType {
    Income = 'إيراد/إيداع',
    Expense = 'مصروف تشغيلي',
    Purchase = 'شراء بضاعة (صرف رصيد)',
    DebtPayment = 'سداد دين مورد',
    TreasuryTransfer = 'تحويل داخلي بين الخزائن',
    SaleCollection = 'تحصيل مبيعات',
    StoreDeduction = 'خصم مصاريف من المتجر', 
}

export enum ExpenseCategory {
    Rent = 'إيجارات',
    Salaries = 'رواتب وأجور',
    Marketing = 'تسويق وإعلانات',
    Logistics = 'مصاريف شحن وتغليف',
    Utilities = 'كهرباء وإنترنت',
    General = 'نثريات ومصاريف عامة'
}

export enum PaymentStatus {
    Paid = 'مدفوع نقداً',
    Unpaid = 'آجل / على الحساب',
    Partial = 'مدفوع جزئياً'
}

export interface DeliveryCompany {
    id: string;
    name: string;
    isActive: boolean;
}

export interface DeliveryPrice {
    id: string;
    title: string;
    cityCode: string;
    regionCode: string;
    price: number;
    lastUpdated?: string;
}

export interface CompanyTransaction {
    id: string;
    type: CompanyTxType;
    expenseCategory?: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
    beneficiary: string;
    paymentStatus: PaymentStatus;
    fromTreasury?: TreasuryType;
    fromTreasuryId?: string;
    toTreasury?: TreasuryType;
    toTreasuryId?: string;
    notes?: string;
    isVerified?: boolean;
    storeId?: number; 
    targetUserId?: number; 
    orderId?: string;
    processedBy?: number;
    treasuryId?: string; 
    treasuryType?: TreasuryType;
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    phone2?: string;
    city: string;
    address: string;
    balance: number;
    totalPurchases: number;
    lastTransactionDate: string;
    notes?: string;
}

export interface ClientTransaction {
    id: string;
    clientId: string;
    type: ClientTransactionType;
    amount: number;
    date: string;
    referenceId?: string;
    notes?: string;
    processedBy: number;
}

export interface News {
    id: number;
    title: string;
    content: string;
    date: string;
    authorId: number;
    seenBy: number[];
    videoUrl?: string;
    expiresAt?: string;
    isPinned?: boolean;
}

export interface AppNotification {
    id: number;
    userId: number;
    message: string;
    isRead: boolean;
    date: string;
    type?: string;
    link?: string;
}

export interface ChatMessage {
    id: number;
    conversationId: number;
    senderId: number;
    senderName?: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    readAt?: string; 
    attachmentUrl?: string;
}

export interface FinancialTransaction {
    id: number;
    userId: number;
    type: TransactionType;
    amount: number;
    date: string;
    notes?: string;
    processedBy: number;
    treasuryType?: TreasuryType;
    treasuryId?: string;
}

export interface WithdrawalRequest {
    id: number;
    userId: number;
    amount: number;
    status: WithdrawalRequestStatus;
    requestDate: string;
    decisionDate?: string;
    processedBy?: number;
}

export interface ShippingOrigin {
    id: string;
    name: string;
    ratePerKgUSD: number;
    isActive: boolean;
    estimatedDeliveryTime?: string;
}

export interface ShoppingBrand {
    id: string;
    name: string;
    isActive: boolean;
    defaultInternalShippingCost: number;
}

export interface ExchangeRateRecord {
    rate: number;
    date: string;
}

export interface SystemSettings {
    vipSubscriptionFee: number;
    purchaseCommissionPercentage: number;
    exchangeRateHistory: ExchangeRateRecord[];
    deliveryCompanies: DeliveryCompany[];
    contractText?: string;     
    contractVersion?: number;  
}

export interface CompanyInfo {
    name: string;
    specialization: string;
    address: string;
    email: string;
    phone: string;
    logoUrl?: string;
    developerName?: string;
}

// Fix: Added missing Language type used in context/AppContext.tsx
export type Language = 'ar' | 'en';