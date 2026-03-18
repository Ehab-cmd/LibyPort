import React from 'react';

const FirebaseSetupGuide: React.FC = () => {
    const configText = `
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
    `;
    
    const rulesText = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
    `;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-6 text-white" dir="rtl">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-3xl w-full border border-yellow-500 overflow-y-auto max-h-full">
                <h1 className="text-3xl font-bold text-yellow-400 mb-4 text-center">خطوة هامة: إعداد قاعدة البيانات</h1>
                <p className="text-lg text-gray-300 mb-6 text-center">
                    التطبيق غير متصل بقاعدة بيانات حقيقية بعد. لحل الأخطاء التي تظهر لك وتشغيل التطبيق، يرجى اتباع الخطوات التالية بدقة.
                </p>

                <div className="bg-red-900 border border-red-500 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-red-300">هل ترى خطأ "The database does not exist"؟</h3>
                    <p className="text-red-200 mt-2">
                        هذا الخطأ يعني أنك لم تقم بتفعيل قاعدة بيانات Firestore في مشروعك على Firebase.
                        <br />
                        <strong>الحل هو إكمال الخطوة رقم 5 أدناه.</strong>
                    </p>
                </div>


                <div className="space-y-4 text-gray-200">
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                            <h2 className="font-bold text-xl">اذهب إلى Firebase</h2>
                            <p>افتح الرابط التالي في متصفحك لإنشاء مشروع جديد أو استخدام مشروع موجود: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://console.firebase.google.com/</a></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                         <div>
                            <h2 className="font-bold text-xl">أضف تطبيق ويب</h2>
                            <p>في لوحة تحكم مشروعك، اذهب إلى "إعدادات المشروع" (Project Settings) ثم "تطبيقاتك" (Your apps) وأضف تطبيق ويب جديد (Add app ➡️ Web).</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                            <h2 className="font-bold text-xl">انسخ إعداداتك</h2>
                            <p>بعد إنشاء تطبيق الويب، ستعرض Firebase كائن إعدادات يسمى <code>firebaseConfig</code>. انسخ هذا الكائن بالكامل.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                        <div>
                            <h2 className="font-bold text-xl">استبدل الإعدادات في الكود</h2>
                            <p>افتح ملف <code className="bg-gray-700 p-1 rounded text-yellow-300">firebaseConfig.ts</code> في مشروعك واستبدل محتويات المتغير `firebaseConfig` بالإعدادات التي نسختها.</p>
                            <pre className="bg-gray-900 p-4 rounded-md mt-2 text-sm text-left overflow-x-auto" dir="ltr">
                                <code>{configText}</code>
                            </pre>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 border-2 border-yellow-400 rounded-lg p-4">
                         <div className="bg-yellow-400 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
                         <div>
                            <h2 className="font-bold text-xl text-yellow-300">الأهم: فعل Firestore وحدّث القواعد</h2>
                            <p>في لوحة تحكم Firebase، اذهب إلى <code className="bg-gray-700 p-1 rounded">Build ➡️ Firestore Database</code>، اضغط على "Create database"، اختر وضع الإنتاج (Production mode) والموقع الجغرافي، ثم اذهب إلى تبويب <code className="bg-gray-700 p-1 rounded">Rules</code> (القواعد) والصق القواعد التالية للسماح بالوصول أثناء التطوير:</p>
                            <pre className="bg-gray-900 p-4 rounded-md mt-2 text-sm text-left overflow-x-auto" dir="ltr">
                                <code>{rulesText}</code>
                             </pre>
                        </div>
                    </div>
                </div>
                <p className="mt-8 text-center text-yellow-400 font-semibold">
                    بعد إتمام هذه الخطوات، قم بإعادة تحميل الصفحة، وسيعمل التطبيق بشكل صحيح.
                </p>
            </div>
        </div>
    );
};

export default FirebaseSetupGuide;