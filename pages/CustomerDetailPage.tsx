
import React, { useMemo } from 'react';
// Fix: Use named imports for react-router-dom hooks and components.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';

const CustomerDetailPage: React.FC = () => {
    const { phone } = ReactRouterDOM.useParams<{ phone: string }>();
    const { orders, getStoreNames, currentUser } = useAppContext();

    const customerOrders = useMemo(() => {
        const isAdmin = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;
        const userStoreIds = currentUser?.storeIds || [];

        const relevantOrders = isAdmin 
            ? orders 
            : orders.filter(order => userStoreIds.includes(order.storeId));

        return relevantOrders.filter(o => o.phone1 === phone).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, phone, currentUser]);

    if (customerOrders.length === 0) {
        return (
            <div className="container mx-auto" dir="rtl">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">لم يتم العثور على زبون</h1>
                <p>لا يوجد زبون بالرقم {phone} أو ليس لديك صلاحية لعرضه.</p>
                <ReactRouterDOM.Link to="/customers" className="text-yellow-600 hover:underline mt-4 inline-block">العودة إلى قائمة الزبائن</ReactRouterDOM.Link>
            </div>
        );
    }

    const customer = customerOrders[0];
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: 'لوحة التحكم', path: '/dashboard' }, 
                    { label: 'الجمهور', path: '/customers' }, 
                    { label: customer.customerName, path: undefined }
                ]} />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">تفاصيل الزبون: {customer.customerName}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b dark:border-gray-700">بيانات الزبون</h2>
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-800 dark:text-gray-200"><strong>الاسم:</strong> {customer.customerName}</p>
                        <p className="text-gray-800 dark:text-gray-200"><strong>الهاتف:</strong> {customer.phone1}</p>
                        <p className="text-gray-800 dark:text-gray-200"><strong>المدينة:</strong> {customer.city}</p>
                        <p className="text-gray-800 dark:text-gray-200"><strong>العنوان:</strong> {customer.address}</p>
                        <hr className="my-4 dark:border-gray-700"/>
                        <p className="text-gray-800 dark:text-gray-200"><strong>إجمالي الطلبات:</strong> {customerOrders.length}</p>
                        <p className="text-gray-800 dark:text-gray-200"><strong>إجمالي المشتريات:</strong> {totalSpent.toLocaleString()} د.ل</p>
                    </div>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                     <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b dark:border-gray-700">سجل الطلبات</h2>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-4 py-3">رقم الطلب</th>
                                    <th scope="col" className="px-4 py-3">التاريخ</th>
                                    <th scope="col" className="px-4 py-3">المتجر</th>
                                    <th scope="col" className="px-4 py-3">الإجمالي</th>
                                    <th scope="col" className="px-4 py-3">حالة التسليم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {customerOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3">
                                            <ReactRouterDOM.Link to={`/orders/${order.id}`} className="text-yellow-600 hover:underline font-bold">
                                                #{order.id}
                                            </ReactRouterDOM.Link>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(order.date).toLocaleDateString('ar-LY')}</td>
                                        <td className="px-4 py-3">{getStoreNames([order.storeId])}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{order.total.toLocaleString()} د.ل</td>
                                        <td className="px-4 py-3 text-xs">{order.deliveryTrackingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="h-20"></div>
        </div>
    );
};

export default CustomerDetailPage;
