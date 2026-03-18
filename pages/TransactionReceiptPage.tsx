import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TransactionType } from '../types';

import { useNotification } from '../context/NotificationContext';

const TransactionReceiptPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { financialTransactions, users } = useAppContext();
    const { showToast } = useNotification();

    const transaction = financialTransactions.find(t => t.id === Number(id));
    const user = transaction ? users.find(u => u.id === transaction.userId) : null;
    const processor = transaction ? users.find(u => u.id === transaction.processedBy) : null;

    if (!transaction || !user) {
        return (
            <div className="container mx-auto p-6 text-center" dir="rtl">
                <h1 className="text-2xl font-bold">الإيصال غير موجود</h1>
                <ReactRouterDOM.Link to="/financials" className="text-yellow-600 hover:underline mt-4 inline-block">
                    العودة إلى الحسابات المالية
                </ReactRouterDOM.Link>
            </div>
        );
    }

    const isWithdrawal = transaction.type === TransactionType.Withdrawal;

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (!printWindow) {
                showToast('الرجاء السماح بالنوافذ المنبثقة لطباعة الإيصال.', 'error');
                return;
            }
            printWindow.document.write('<html><head><title>طباعة إيصال</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
            printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">');
            printWindow.document.write(`
                <style>
                    body { 
                        font-family: 'Cairo', sans-serif;
                        direction: rtl; 
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
            printWindow.document.write('<body class="bg-white">');
            printWindow.document.write('<div class="p-8 sm:p-12">');
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

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-8" dir="rtl">
            <div className="max-w-3xl mx-auto">
                <div className="no-print flex justify-between items-center mb-6">
                    <button onClick={() => navigate(-1)} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">
                        رجوع
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        معاينة الإيصال
                    </h1>
                    <button onClick={handlePrint} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600">
                        طباعة
                    </button>
                </div>

                <div id="receipt-area" className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-lg shadow-md">
                    <header className="flex justify-between items-start pb-6 border-b-2 border-gray-100 dark:border-gray-700">
                        <div>
                            <h1 className="text-3xl font-bold text-yellow-500">LibyPort</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">بوابة طرابلس العالمية</p>
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{transaction.type}</h2>
                            <p className="text-gray-500 dark:text-gray-400">رقم: <span className="font-mono text-gray-700 dark:text-gray-300">#{transaction.id}</span></p>
                            <p className="text-gray-500 dark:text-gray-400">تاريخ: <span className="text-gray-700 dark:text-gray-300">{new Date(transaction.date).toLocaleDateString('ar-LY')}</span></p>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 gap-8 my-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                {isWithdrawal ? 'تم السحب بواسطة' : 'تم السداد بواسطة'}
                            </h3>
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{user.name}</p>
                            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                {isWithdrawal ? 'تم استلام المبلغ من' : 'تم تسليم المبلغ إلى'}
                            </h3>
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">إدارة LibyPort</p>
                            {processor && <p className="text-gray-600 dark:text-gray-300">المسؤول: {processor.name}</p>}
                        </div>
                    </section>

                    <section className="my-8">
                        <div className={`p-6 rounded-lg text-center ${isWithdrawal ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">المبلغ</p>
                            <p className={`text-4xl font-bold mt-2 ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                                {transaction.amount.toLocaleString()} د.ل
                            </p>
                        </div>
                    </section>
                    
                    {transaction.notes && (
                         <section className="mt-8">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">ملاحظات</h3>
                            <p className="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">{transaction.notes}</p>
                        </section>
                    )}

                    <footer className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">شكراً لتعاملكم معنا!</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default TransactionReceiptPage;