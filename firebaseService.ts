
import * as Firestore from 'firebase/firestore';
import { firestore, auth } from './firebaseConfig';
import { initialData } from './initialData';
import { Order, DeliveryPrice } from './types';

const { collection, getDocs, getDoc, writeBatch, doc, query, where, limit, getCountFromServer, getDocFromServer } = Firestore;

export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

export interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId: string | undefined;
        email: string | null | undefined;
        emailVerified: boolean | undefined;
        isAnonymous: boolean | undefined;
        tenantId: string | null | undefined;
        providerInfo: {
            providerId: string;
            displayName: string | null;
            email: string | null;
            photoUrl: string | null;
        }[];
    }
}

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData.map(provider => ({
                providerId: provider.providerId,
                displayName: provider.displayName,
                email: provider.email,
                photoUrl: provider.photoURL
            })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
};

export const testConnection = async () => {
    try {
        await getDocFromServer(doc(firestore, 'test', 'connection'));
        return true;
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration. The client is offline.");
            return false;
        }
        // Other errors are fine for a connection test
        return true;
    }
};

const INITIAL_DELIVERY_PRICES: Omit<DeliveryPrice, 'id'>[] = [
    // --- طرابلس والمناطق المجاورة (TIP) ---
    { title: 'طرابلس', cityCode: 'TIP', regionCode: '-', price: 15 },
    { title: 'السياحية', cityCode: 'TIP', regionCode: '70', price: 15 },
    { title: 'الظهرة', cityCode: 'TIP', regionCode: '73', price: 15 },
    { title: 'زاوية الدهماني', cityCode: 'TIP', regionCode: '74', price: 15 },
    { title: 'النوفليين', cityCode: 'TIP', regionCode: '75', price: 15 },
    { title: 'بن عاشور', cityCode: 'TIP', regionCode: '76', price: 15 },
    { title: 'شارع الجرابة', cityCode: 'TIP', regionCode: '77', price: 15 },
    { title: 'شارع الزاوية', cityCode: 'TIP', regionCode: '78', price: 15 },
    { title: 'شارع الجمهورية', cityCode: 'TIP', regionCode: '79', price: 15 },
    { title: 'شارع النصر', cityCode: 'TIP', regionCode: '80', price: 15 },
    { title: 'باب بن غشير', cityCode: 'TIP', regionCode: '81', price: 15 },
    { title: 'قرقارش', cityCode: 'TIP', regionCode: '82', price: 15 },
    { title: 'غوط الشعال', cityCode: 'TIP', regionCode: '83', price: 15 },
    { title: 'السراج', cityCode: 'TIP', regionCode: '84', price: 15 },
    { title: 'الدريبي', cityCode: 'TIP', regionCode: '85', price: 15 },
    { title: 'قرجي', cityCode: 'TIP', regionCode: '86', price: 15 },
    { title: 'أبوسليم', cityCode: 'TIP', regionCode: '88', price: 15 },
    { title: 'الفلاح', cityCode: 'TIP', regionCode: '90', price: 15 },
    { title: 'غرغور', cityCode: 'TIP', regionCode: '91', price: 15 },
    { title: 'حي الزهور', cityCode: 'TIP', regionCode: '92', price: 15 },
    { title: 'طريق المطار', cityCode: 'TIP', regionCode: '93', price: 20 },
    { title: 'صلاح الدين', cityCode: 'TIP', regionCode: '95', price: 15 },
    { title: 'خلة الفرجان', cityCode: 'TIP', regionCode: '96', price: 20 },
    { title: 'طريق الشوك', cityCode: 'TIP', regionCode: '97', price: 15 },
    { title: 'الفرناج', cityCode: 'TIP', regionCode: '98', price: 15 },
    { title: 'زناتة', cityCode: 'TIP', regionCode: '102', price: 15 },
    { title: 'جامع الصقع', cityCode: 'TIP', regionCode: '103', price: 15 },
    { title: 'الهاني', cityCode: 'TIP', regionCode: '104', price: 15 },
    { title: 'عرادة', cityCode: 'TIP', regionCode: '105', price: 15 },
    { title: 'سوق الجمعة', cityCode: 'TIP', regionCode: '107', price: 15 },
    { title: 'الغرارات', cityCode: 'TIP', regionCode: '109', price: 15 },
    { title: 'بوسليم', cityCode: 'TIP', regionCode: '110', price: 15 },
    { title: 'طريق الشط', cityCode: 'TIP', regionCode: '111', price: 15 },
    { title: '11 يونيو', cityCode: 'TIP', regionCode: '113', price: 15 },
    { title: 'السبعة', cityCode: 'TIP', regionCode: '114', price: 15 },
    { title: 'حي دمشق', cityCode: 'TIP', regionCode: '116', price: 15 },
    { title: 'عين زارة', cityCode: 'TIP', regionCode: '119', price: 20 },
    { title: 'طريق السور', cityCode: 'TIP', regionCode: '147', price: 15 },
    { title: 'بوابة الجبس', cityCode: 'TIP', regionCode: '148', price: 15 },
    { title: 'شارع الصريم', cityCode: 'TIP', regionCode: '159', price: 15 },
    { title: 'فشلوم', cityCode: 'TIP', regionCode: '698', price: 15 },
    { title: 'المنصورة', cityCode: 'TIP', regionCode: '700', price: 15 },
    { title: 'عمر المختار', cityCode: 'TIP', regionCode: '702', price: 15 },

    // --- بنغازي والمناطق الشرقية (BEN) ---
    { title: 'بنغازي', cityCode: 'BEN', regionCode: '-', price: 30 },
    { title: 'راس عبيدة', cityCode: 'BEN', regionCode: '122', price: 30 },
    { title: 'بوزغيبة', cityCode: 'BEN', regionCode: '123', price: 30 },
    { title: 'حي السلام', cityCode: 'BEN', regionCode: '124', price: 30 },
    { title: 'شبنة', cityCode: 'BEN', regionCode: '125', price: 30 },
    { title: 'طريق النهر', cityCode: 'BEN', regionCode: '126', price: 30 },
    { title: 'الماجوري', cityCode: 'BEN', regionCode: '127', price: 30 },
    { title: 'سيدي حسين', cityCode: 'BEN', regionCode: '128', price: 30 },
    { title: 'البركة', cityCode: 'BEN', regionCode: '129', price: 30 },
    { title: 'الحدائق', cityCode: 'BEN', regionCode: '130', price: 30 },
    { title: 'السلماني', cityCode: 'BEN', regionCode: '132', price: 30 },
    { title: 'طابلينو', cityCode: 'BEN', regionCode: '136', price: 30 },
    { title: 'الليثي', cityCode: 'BEN', regionCode: '140', price: 30 },
    { title: 'بوعطني', cityCode: 'BEN', regionCode: '143', price: 30 },
    { title: 'قنفودة', cityCode: 'BEN', regionCode: '153', price: 30 },
    { title: 'الهواري', cityCode: 'BEN', regionCode: '156', price: 30 },
    { title: 'الكيش', cityCode: 'BEN', regionCode: '160', price: 30 },
    { title: 'جردينة', cityCode: 'BEN', regionCode: '673', price: 35 },
    { title: 'الصابري', cityCode: 'BEN', regionCode: '1143', price: 30 },
    { title: 'القوارشة', cityCode: 'BEN', regionCode: '1148', price: 30 },

    // --- مصراتة (MSR) ---
    { title: 'مصراتة', cityCode: 'MSR', regionCode: '-', price: 25 },
    { title: 'الدافنية', cityCode: 'MSR', regionCode: '405', price: 25 },
    { title: 'زريق', cityCode: 'MSR', regionCode: '421', price: 25 },
    { title: 'قصر حمد', cityCode: 'MSR', regionCode: '383', price: 25 },
    { title: 'الرويسات - مصراتة', cityCode: 'MSR', regionCode: '420', price: 25 },

    // --- مدن أخرى ---
    { title: 'الزاوية', cityCode: 'ZWY', regionCode: '-', price: 25 },
    { title: 'صبراتة', cityCode: 'SUB', regionCode: '-', price: 25 },
    { title: 'زليتن', cityCode: 'ZLN', regionCode: '-', price: 20 },
    { title: 'الخمس', cityCode: 'KHS', regionCode: '-', price: 20 },
    { title: 'سبها', cityCode: 'SBH', regionCode: '-', price: 35 },
    { title: 'غريان', cityCode: 'GRY', regionCode: '-', price: 30 },
    { title: 'ترهونة', cityCode: 'TRH', regionCode: '-', price: 30 },
    { title: 'بني وليد', cityCode: 'BWL', regionCode: '-', price: 30 },
    { title: 'البيضاء', cityCode: 'BLA', regionCode: '-', price: 35 },
    { title: 'طبرق', cityCode: 'TOB', regionCode: '-', price: 40 },
    { title: 'درنة', cityCode: 'DRN', regionCode: '-', price: 40 },
    { title: 'إجدابيا', cityCode: 'EJD', regionCode: '-', price: 35 },
    { title: 'سرت', cityCode: 'SRT', regionCode: '-', price: 30 },
    { title: 'زوارة', cityCode: 'ZWR', regionCode: '-', price: 30 },

    // --- فروع التسليم (VNX) ---
    { title: 'تسليم بفرع الجرابة', cityCode: 'JVNX', regionCode: '-', price: 8 },
    { title: 'تسليم بفرع السراج', cityCode: 'SVNX', regionCode: '-', price: 8 },
    { title: 'تسليم بفرع سوق الجمعة', cityCode: 'SQVNX', regionCode: '-', price: 8 },
    { title: 'تسليم بفرع بنغازي', cityCode: 'BVNX', regionCode: '-', price: 20 },
];

const seedCollectionIfNeeded = async (collectionName: string, data: any[]) => {
    try {
        const colRef = collection(firestore, collectionName);
        const countSnap = await getCountFromServer(colRef);
        const currentCount = countSnap.data().count;
        
        if (currentCount === 0 || (collectionName === 'deliveryPrices' && currentCount < 50)) {
            console.log(`Seeding/Updating collection: ${collectionName}`);
            const batch = writeBatch(firestore);
            data.forEach((item, index) => {
                const docId = item.title ? `p_${item.cityCode}_${item.regionCode}_${index}` : `init_${collectionName}_${index}`;
                const docRef = doc(colRef, docId);
                batch.set(docRef, { ...item });
            });
            await batch.commit();
        }
    } catch (e: any) {
        console.warn(`Failed to seed collection ${collectionName}:`, e);
    }
};

export const seedDatabaseIfNeeded = async () => {
    // تخطي الفحص إذا تم بالفعل في هذه الجلسة لتقليل استهلاك البيانات والوقت
    const lastCheck = localStorage.getItem('lp_db_seeded');
    const now = Date.now();
    if (lastCheck && now - parseInt(lastCheck) < 1000 * 60 * 60 * 24) { // مرة واحدة كل 24 ساعة
        return;
    }

    try {
        const collectionsToSeed = [
            { name: 'users', data: initialData.users },
            { name: 'stores', data: initialData.stores },
            { name: 'products', data: initialData.products },
            { name: 'bankAccounts', data: initialData.bankAccounts },
            { name: 'deliveryPrices', data: INITIAL_DELIVERY_PRICES },
            { name: 'treasuries', data: [
                { id: 'main', name: 'الخزينة الرئيسية', type: 'cash', isActive: true },
                { id: 'bank', name: 'حساب المصرف', type: 'bank', isActive: true }
            ]}
        ];

        // تشغيل كافة عمليات الفحص بالتوازي لسرعة البرق
        await Promise.all(collectionsToSeed.map(col => seedCollectionIfNeeded(col.name, col.data)));
        
        localStorage.setItem('lp_db_seeded', now.toString());
    } catch (error: any) {
        console.warn("Database check bypassed:", error.message);
    }
};

export const db = {
    testConnection,
    queryOrdersByTracking: async (trackingNumber: string): Promise<Order | null> => {
        try {
            const ordersRef = collection(firestore, 'orders');
            
            // 1. محاولة البحث برقم الفاتورة مباشرة (Document ID)
            const docRef = doc(ordersRef, trackingNumber.toUpperCase());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) return { ...docSnap.data() as Order, id: docSnap.id };

            // 2. البحث برقم التتبع الدولي
            const q1 = query(ordersRef, where('internationalTrackingNumber', '==', trackingNumber), limit(1));
            const snap1 = await getDocs(q1);
            if (!snap1.empty) return { ...snap1.docs[0].data() as Order, id: snap1.docs[0].id };

            // 3. البحث برقم التتبع المحلي
            const q2 = query(ordersRef, where('localTrackingNumber', '==', trackingNumber), limit(1));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) return { ...snap2.docs[0].data() as Order, id: snap2.docs[0].id };

            return null;
        } catch (e) {
            handleFirestoreError(e, OperationType.GET, 'orders');
            return null; // Should not reach here as handleFirestoreError throws
        }
    }
};
