import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const PaymentResultPage: React.FC = () => {
    const [searchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();
    const { updateOrder } = useAppContext();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('جاري التحقق من عملية الدفع...');

    // Get params from URL
    const orderId = searchParams.get('orderId');
    const responseCode = searchParams.get('response_code');
    const transactionId = searchParams.get('transaction_id') || searchParams.get('payment_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!orderId) {
                setStatus('failed');
                setMessage('رقم الفاتورة مفقود.');
                return;
            }

            // '00' or 'approved' usually indicates success in Tlync/MobiCash
            if (responseCode === '00' || responseCode === 'approved' || responseCode === 'success') {
                await updateOrder(orderId, { 
                    isPaymentConfirmed: true, 
                    notes: `تم الدفع إلكترونياً via Tlync. مرجع: ${transactionId}` 
                });
                setStatus('success');
                setMessage('تمت عملية الدفع بنجاح!');
            } else {
                setStatus('failed');
                setMessage('فشلت عملية الدفع أو تم إلغاؤها.');
            }
        };

        verifyPayment();
    }, [orderId, responseCode, updateOrder]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">جاري التحقق...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in-up">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">عملية ناجحة</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <button 
                            onClick={() => navigate(`/orders/${orderId}`)}
                            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors"
                        >
                            العودة للفاتورة
                        </button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="animate-fade-in-up">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">خطأ في الدفع</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <button 
                            onClick={() => navigate(`/orders/${orderId}`)}
                            className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                        >
                            العودة والمحاولة مجدداً
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentResultPage;