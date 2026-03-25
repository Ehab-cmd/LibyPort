
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";
import firebaseConfigData from './firebase-applet-config.json';

// إعدادات مشروع Firebase من الملف المرجعي
export const firebaseConfig = firebaseConfigData;

// تهيئة تطبيق Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// تهيئة Firestore مع تفعيل Long Polling لضمان الموثوقية السحابية المباشرة
const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const auth = getAuth(app);

export { firestore, auth };
