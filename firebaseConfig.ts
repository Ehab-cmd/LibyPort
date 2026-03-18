
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// إعدادات مشروع Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyArgzirx_3ISpQrCs1zWoHVJdw_4Wdy5Jk",
  authDomain: "libyport-c0c5c.firebaseapp.com",
  projectId: "libyport-c0c5c",
  storageBucket: "libyport-c0c5c.firebasestorage.app",
  messagingSenderId: "417515914521",
  appId: "1:417515914521:web:38a5100a468d40632af188",
  measurementId: "G-PXTG1RXTGY"
};

// تهيئة تطبيق Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// تهيئة Firestore مع تفعيل التخزين المحلي الدائم لأقصى سرعة (Persistence)
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const auth = getAuth(app);

export { firestore, auth };
