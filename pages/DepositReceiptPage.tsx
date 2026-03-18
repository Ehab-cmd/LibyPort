
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

import { useNotification } from '../context/NotificationContext';

const DepositReceiptPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { orders, getStoreNames } = useAppContext();
    const { showToast } = useNotification();

    const order = orders.find(o => String(o.id) === id);

    if (!order) {
        return (
            <div className="container mx-auto p-6 text-center" dir="rtl">
                <h1 className="text-2xl font-bold">الفاتورة غير موجودة</h1>
                <ReactRouterDOM.Link to="/orders" className="text-yellow-600 hover:underline mt-4 inline-block">
                    العودة إلى الفواتير
                </ReactRouterDOM.Link>
            </div>
        );
    }

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (!printWindow) {
                showToast('الرجاء السماح بالنوافذ المنبثقة لطباعة الإيصال.', 'error');
                return;
            }
            printWindow.document.write('<html><head><title>إيصال استلام عربون</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
            printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">');
            printWindow.document.write(`
                <style>
                    body { 
                        font-family: 'Cairo', sans-serif;
                        direction: rtl; 
                        background-color: white;
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="p-8">');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1000);
        }
    };

    const netReceived = Math.max(0, (order.deposit || 0) - (order.depositCommission || 0));

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-8" dir="rtl">
            <div className="max-w-2xl mx-auto">
                <div className="no-print flex justify-between items-center mb-6">
                    <button onClick={() => navigate(-1)} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">
                        رجوع
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        معاينة إيصال العربون
                    </h1>
                    <button onClick={handlePrint} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        طباعة
                    </button>
                </div>

                <div id="receipt-area" className="bg-white p-10 rounded-lg shadow-lg border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-yellow-500 pb-6 mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-yellow-600">LibyPort</h1>
                            <p className="text-gray-500 text-sm tracking-widest mt-1">بوابة طرابلس العالمية</p>
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-gray-800">إيصال استلام عربون</h2>
                            <p className="text-gray-600 text-sm mt-1">Receipt #: DEP-${order.id}</p>
                            <p className="text-gray-600 text-sm">التاريخ: {new Date().toLocaleDateString('ar-LY')}</p>
                        </div>
                    </div>

                    {/* Receipt Details */}
                    <div className="space-y-6">
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-sm mb-2">استلمنا من السيد/السيدة</p>
                            <h3 className="text-2xl font-bold text-gray-900">{order.customerName}</h3>
                            <p className="text-gray-600 mt-2 font-mono">{order.phone1}</p>
                        </div>

                        <div className="p-6 bg-yellow-50 rounded-[2rem] border border-yellow-100 text-center">
                            <p className="text-gray-600 text-sm font-semibold mb-1">إجمالي المبلغ المقبوض من الزبون</p>
                            <p className="text-4xl font-black text-yellow-600">{order.deposit?.toLocaleString()} د.ل</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border">
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">المقيد في الحساب (الصافي)</p>
                                <p className="text-xl font-bold text-green-700">{netReceived.toLocaleString()} د.ل</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">عمولة استلام إدارية</p>
                                <p className="text-xl font-bold text-red-600">{order.depositCommission?.toLocaleString() || 0} د.ل</p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-600 text-sm font-semibold mb-2">تفاصيل الطلب المرجعي:</p>
                            <div className="flex justify-between items-center text-sm">
                                <span>رقم الفاتورة: <span className="font-bold">#${order.id}</span></span>
                                <span>المتجر: <span className="font-bold">{getStoreNames([order.storeId])}</span></span>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                <p>البيان: دفعة مقدمة (عربون) لتأكيد الطلب. المبلغ المذكور في الأعلى هو إجمالي ما تم استلامه من الزبون ويخصم من مديونيته كاملة.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="mt-12 pt-8 border-t border-dashed border-gray-300 flex justify-between items-end">
                        <div className="text-center">
                            <p className="font-bold text-gray-800 text-sm mb-4">توقيع المستلم (الشركة)</p>
                            <div className="h-16 flex items-end justify-center">
                                <span className="text-yellow-600 font-serif italic text-lg">LibyPort Admin</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-800 text-sm mb-4">ختم الشركة</p>
                            <div className="w-20 h-20 border-2 border-blue-900 rounded-full flex items-center justify-center transform -rotate-12 opacity-80">
                                <div className="text-[8px] text-blue-900 font-bold text-center leading-tight uppercase">
                                    LIBYPORT<br/>OFFICIAL<br/>SEAL
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-gray-400">
                        <p>شكراً لثقتكم بنا | بوابة طرابلس العالمية | طرابلس، ليبيا</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositReceiptPage;
