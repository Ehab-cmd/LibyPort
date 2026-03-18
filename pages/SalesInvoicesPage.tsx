import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, OrderType, PurchaseTrackingStatus, DeliveryTrackingStatus, Order } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

// --- Professional Icons ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
// Fix: Added missing PlusIcon definition.
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

const DeleteConfirmationModal: React.FC<{
    orderId: string;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ orderId, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up border border-gray-100 dark:border-gray-700">
            <div className="flex justify-center text-red-500 mb-4"><TrashIcon /></div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 text-center mb-2">تأكيد حذف الفاتورة</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف فاتورة المبيعات الخاصة رقم <span className="font-black text-gray-900 dark:text-white">#{orderId}</span>؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-center gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold transition-all">إلغاء</button>
                <button type="button" onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black shadow-lg shadow-red-500/20 hover:bg-red-700">نعم، حذف الفاتورة</button>
            </div>
        </div>
    </div>
);

const SalesInvoicesPage: React.FC = () => {
    const { orders, currentUser, deleteOrderDirectly } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [visibleCount, setVisibleCount] = useState(50);

    const isAdmin = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;

    // Filter only "Procurement" (Sales Invoices)
    const salesInvoices = useMemo(() => {
        return orders
            .filter(o => 
                !o.isDeleted && 
                o.orderType === OrderType.Procurement &&
                (isAdmin || (currentUser?.storeIds || []).includes(o.storeId))
            )
            .filter(o => 
                searchTerm === '' ||
                o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.phone1.includes(searchTerm)
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, isAdmin, currentUser, searchTerm]);

    const stats = useMemo(() => {
        const purchased = salesInvoices.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased);
        const totalAmount = purchased.reduce((sum, o) => sum + o.total, 0);
        const pendingCount = salesInvoices.filter(o => o.purchaseTrackingStatus === PurchaseTrackingStatus.Pending).length;
        return { totalAmount, count: salesInvoices.length, purchasedCount: purchased.length, pendingCount };
    }, [salesInvoices]);

    const displayedOrders = useMemo(() => salesInvoices.slice(0, visibleCount), [salesInvoices, visibleCount]);

    const handleDelete = async () => {
        if (orderToDelete) {
            await deleteOrderDirectly(orderToDelete.id);
            setOrderToDelete(null);
        }
    };

    const getStatusColor = (status: PurchaseTrackingStatus) => {
        switch(status) {
            case PurchaseTrackingStatus.Purchased: return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-100 dark:border-green-800';
            case PurchaseTrackingStatus.Processing: return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-100 dark:border-orange-800';
            case PurchaseTrackingStatus.Pending: return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800';
            case PurchaseTrackingStatus.Cancelled: return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800';
            default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-100';
        }
    };

    if (!isAdmin) return <div className="p-10 text-center text-red-500 font-black">🚫 غير مصرح لك بالوصول لهذه الصفحة.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-10" dir="rtl">
            {orderToDelete && (
                <DeleteConfirmationModal 
                    orderId={orderToDelete.id} 
                    onClose={() => setOrderToDelete(null)} 
                    onConfirm={handleDelete} 
                />
            )}

            {/* Cinematic Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">فواتير المبيعات الخاصة</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">إدارة الطلبيات المباشرة، الشراء من الخارج، وحسابات شركة LibyPort.</p>
                </div>
                <ReactRouterDOM.Link 
                    to="/sales-invoices/new" 
                    className="w-full lg:w-auto bg-purple-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:bg-purple-700 hover:-translate-y-1 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <PlusIcon /> فاتورة مبيعات جديدة
                </ReactRouterDOM.Link>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600"><ShoppingBagIcon /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي المبيعات الخاصة</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono">{stats.totalAmount.toLocaleString()} <span className="text-xs font-normal">د.ل</span></h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><ChartBarIcon /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عدد الفواتير الكلي</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.count}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 border-r-4 border-r-green-500">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تم الشراء</p>
                        <h3 className="text-2xl font-black text-green-600">{stats.purchasedCount}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 border-r-4 border-r-amber-500">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">بانتظار الشراء</p>
                        <h3 className="text-2xl font-black text-amber-600">{stats.pendingCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="ابحث برقم الفاتورة، اسم العميل، أو رقم الهاتف..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pr-12 border-none bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-purple-500 font-bold dark:text-white"
                    />
                    <div className="absolute right-4 top-4.5 text-gray-400"><SearchIcon /></div>
                </div>
            </div>

            {/* Main Content View */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-gray-700 overflow-hidden">
                {/* Desktop View Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-6"># الفاتورة</th>
                                <th className="px-6 py-6">العميل</th>
                                <th className="px-6 py-6">التاريخ</th>
                                <th className="px-6 py-6">الإجمالي</th>
                                <th className="px-6 py-6">حالة الشراء</th>
                                <th className="px-6 py-6">حالة التوصيل</th>
                                <th className="px-8 py-6 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {displayedOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-6 font-mono font-black text-yellow-600 tracking-tighter">#{order.id}</td>
                                    <td className="px-6 py-6">
                                        <div className="font-black text-gray-900 dark:text-white leading-tight group-hover:text-purple-600 transition-colors">{order.customerName}</div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-1 font-mono">{order.phone1}</div>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-gray-400 font-bold">{new Date(order.date).toLocaleDateString('ar-LY')}</td>
                                    <td className="px-6 py-6 font-black text-gray-900 dark:text-white text-base">
                                        {order.total.toLocaleString()} <span className="text-[10px] font-normal opacity-50">د.ل</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusColor(order.purchaseTrackingStatus)}`}>
                                            {order.purchaseTrackingStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bold bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
                                            {order.deliveryTrackingStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => navigate(`/orders/${order.id}`)} 
                                                className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="عرض التفاصيل"
                                            >
                                                <EyeIcon />
                                            </button>
                                            <button 
                                                onClick={() => setOrderToDelete(order)} 
                                                className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                title="حذف"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {displayedOrders.map(order => (
                        <div key={order.id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 relative animate-fade-in-up">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="font-mono font-black text-yellow-600 text-xs">#{order.id}</span>
                                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight mt-0.5">{order.customerName}</h3>
                                    <p className="text-xs text-gray-400 font-bold font-mono">{order.phone1}</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-purple-600 text-xl font-mono">{order.total.toLocaleString()} د.ل</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(order.date).toLocaleDateString('ar-LY')}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-6 border-t dark:border-gray-700 pt-4">
                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black border ${getStatusColor(order.purchaseTrackingStatus)}`}>
                                    {order.purchaseTrackingStatus}
                                </span>
                                <span className="text-[8px] bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black px-2 py-1 rounded-lg shadow-sm border dark:border-gray-600">
                                    {order.deliveryTrackingStatus}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2"
                                >
                                    <EyeIcon /> عرض الفاتورة
                                </button>
                                <button 
                                    onClick={() => setOrderToDelete(order)}
                                    className="bg-red-50 text-red-500 py-3 rounded-2xl font-black text-xs border border-red-100 flex items-center justify-center gap-2"
                                >
                                    <TrashIcon /> حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {visibleCount < salesInvoices.length && (
                    <div className="p-8 border-t dark:border-gray-700 flex justify-center bg-gray-50/50 dark:bg-gray-900/50">
                        <button 
                            onClick={() => setVisibleCount(prev => prev + 50)}
                            className="bg-white dark:bg-gray-800 px-10 py-3 rounded-2xl font-black text-sm shadow-md hover:-translate-y-1 transition-all border dark:border-gray-700"
                        >
                            عرض المزيد من الفواتير ({salesInvoices.length - visibleCount})
                        </button>
                    </div>
                )}

                {salesInvoices.length === 0 && (
                    <div className="text-center py-40 bg-white dark:bg-gray-800">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <ShoppingBagIcon />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white">لا توجد مبيعات خاصة بعد</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">عند إضافة فاتورة مبيعات خاصة جديدة ستظهر تفاصيلها في هذا السجل الموحد.</p>
                    </div>
                )}
            </div>
            
            <div className="h-20"></div>
        </div>
    );
};

export default SalesInvoicesPage;
