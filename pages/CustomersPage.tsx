
import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { UserRole } from '../types';

interface CustomerSummary {
    name: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string;
}

// --- Professional Icons ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const SuccessModal: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-md text-center transform transition-all animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white">تم بنجاح</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 my-4 font-bold">{message}</p>
            <button onClick={onClose} className="w-full bg-yellow-500 text-white py-3 rounded-2xl font-black shadow-lg hover:bg-yellow-600 transition-all">موافق</button>
        </div>
    </div>
);

const DeleteConfirmationModal: React.FC<{
    customerName: string;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ customerName, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-md transform transition-all border border-red-100 dark:border-red-900/30">
            <div className="flex justify-center mb-4 text-red-500"><TrashIcon /></div>
            <h2 className="text-lg font-black text-gray-800 dark:text-white text-center">تأكيد الحذف</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center my-4 leading-relaxed font-medium">هل أنت متأكد من رغبتك في حذف الزبون <span className="font-black text-gray-900 dark:text-white">"{customerName}"</span>؟ سيتم إخفاء بياناته من القائمة فقط.</p>
            <div className="flex justify-center gap-4 mt-8">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold">إلغاء</button>
                <button type="button" onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black shadow-lg shadow-red-500/20">نعم، حذف</button>
            </div>
        </div>
    </div>
);

const CustomersPage: React.FC = () => {
    const { orders, currentUser, deletedCustomers, deleteCustomer } = useAppContext();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();

    const urlSearchTerm = searchParams.get('search') || '';
    const [localSearchTerm, setLocalSearchTerm] = useState(urlSearchTerm);
    const cityFilter = searchParams.get('city') || 'all';
    const sortBy = searchParams.get('sort') || 'lastOrderDate_desc';

    const [customerToDelete, setCustomerToDelete] = useState<CustomerSummary | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(50);

    const normalizePhone = (p: any) => String(p || '').replace(/\D/g, '').trim();

    useEffect(() => { setLocalSearchTerm(urlSearchTerm); }, [urlSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchTerm !== urlSearchTerm) {
                setSearchParams(prev => {
                    if (localSearchTerm === '') { prev.delete('search'); } else { prev.set('search', localSearchTerm); }
                    return prev;
                }, { replace: true });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearchTerm, urlSearchTerm, setSearchParams]);

    useEffect(() => { setVisibleCount(50); }, [localSearchTerm, cityFilter, sortBy]);

    const updateSearchParam = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value === 'all' || value === '') { prev.delete(key); } else { prev.set(key, value); }
            return prev;
        }, { replace: true });
    };

    const { customers, uniqueCities, stats } = useMemo(() => {
        const customerMap = new Map<string, CustomerSummary>();
        const isAdmin = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;
        const userStoreIds = currentUser?.storeIds || [];
        const activeOrders = orders.filter(o => !o.isDeleted);
        const relevantOrders = isAdmin ? activeOrders : activeOrders.filter(order => userStoreIds.includes(order.storeId));

        relevantOrders.forEach(order => {
            // توحيد رقم الهاتف لضمان عدم التكرار
            const phoneKey = normalizePhone(order.phone1);
            if (!phoneKey) return;

            if (!customerMap.has(phoneKey)) {
                customerMap.set(phoneKey, { 
                    phone: phoneKey, 
                    name: order.customerName, 
                    city: order.city, 
                    orderCount: 0, 
                    totalSpent: 0, 
                    lastOrderDate: '1970-01-01' 
                });
            }
            
            const customer = customerMap.get(phoneKey)!;
            customer.orderCount++;
            customer.totalSpent += order.total;
            
            // تحديث البيانات بناءً على أحدث فاتورة
            if (new Date(order.date) >= new Date(customer.lastOrderDate)) {
                 customer.lastOrderDate = order.date;
                 customer.name = order.customerName; // نأخذ أحدث اسم مسجل لهذا الرقم
                 customer.city = order.city;
            }
        });

        const customerList = Array.from(customerMap.values());
        const uniqueCities = ['all', ...Array.from(new Set(customerList.map(c => c.city)))];

        // Filtering
        let filtered = customerList.filter(c => 
            !deletedCustomers.includes(c.phone) &&
            (String(c.name || '').toLowerCase().includes(urlSearchTerm.toLowerCase()) || String(c.phone || '').includes(urlSearchTerm)) &&
            (cityFilter === 'all' || c.city === cityFilter)
        );
        
        // Sorting
        const [sortKey, sortDirection] = sortBy.split('_');
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortKey) {
                case 'name': comparison = a.name.localeCompare(b.name, 'ar'); break;
                case 'totalSpent': comparison = b.totalSpent - a.totalSpent; break;
                case 'orderCount': comparison = b.orderCount - a.orderCount; break;
                default: comparison = new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime(); break;
            }
            return sortDirection === 'asc' ? -comparison : comparison;
        });

        // Stats calculation
        const totalCustomers = customerList.length;
        const topCustomer = customerList.length > 0 ? [...customerList].sort((a,b) => b.totalSpent - a.totalSpent)[0] : null;
        const mainCity = uniqueCities.length > 1 ? uniqueCities[1] : '-';

        return { customers: filtered, uniqueCities, stats: { totalCustomers, topCustomer, mainCity } };
    }, [orders, currentUser, urlSearchTerm, cityFilter, sortBy, deletedCustomers]);
    
    const displayedCustomers = useMemo(() => customers.slice(0, visibleCount), [customers, visibleCount]);

    const handleConfirmDelete = () => {
        if (customerToDelete) {
            deleteCustomer(customerToDelete.phone).then(() => {
                setSuccessMessage(`تم حذف الزبون "${customerToDelete.name}" بنجاح.`);
                setCustomerToDelete(null);
            });
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {successMessage && <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />}
            {customerToDelete && (
                <DeleteConfirmationModal
                    customerName={customerToDelete.name}
                    onClose={() => setCustomerToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
            
            <div className="mb-6 md:mb-10">
                <div className="flex flex-row justify-between items-center gap-2 mb-2">
                    <div className="animate-fade-in-up">
                        <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">إدارة الجمهور</h1>
                        <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">متابعة سجلات الزبائن الموحدة، التوزيع الجغرافي، ومعدلات الولاء.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ReactRouterDOM.Link to="/orders/new" className="bg-yellow-500 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center gap-1.5 text-[9px] md:text-xs whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            إضافة زبون (طلب جديد)
                        </ReactRouterDOM.Link>
                        <span className="hidden sm:inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">{customers.length} زبون</span>
                    </div>
                </div>
                <p className="md:hidden text-[10px] text-gray-400 font-bold leading-tight">متابعة سجلات الزبائن وتوزيعهم الجغرافي.</p>
            </div>

            {/* Insight Stats Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8 md:mb-12">
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-5 text-center md:text-right">
                    <div className="p-2 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg md:rounded-2xl text-blue-600 dark:text-blue-400 scale-[0.8] md:scale-100"><UserGroupIcon /></div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest leading-tight mb-1">إجمالي الجمهور</p>
                        <h3 className="text-[10px] md:text-xl font-black text-gray-900 dark:text-white leading-none">{stats.totalCustomers} <span className="hidden md:inline text-xs font-normal text-gray-400">عميل</span></h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-5 text-center md:text-right">
                    <div className="p-2 md:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg md:rounded-2xl text-yellow-600 dark:text-yellow-400 scale-[0.8] md:scale-100"><StarIcon /></div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest leading-tight mb-1">الأكثر إنفاقاً</p>
                        <h3 className="text-[10px] md:text-lg font-black text-gray-900 dark:text-white truncate leading-none">{stats.topCustomer?.name.split(' ')[0] || 'لا يوجد'}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-5 text-center md:text-right">
                    <div className="p-2 md:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg md:rounded-2xl text-purple-600 dark:text-purple-400 scale-[0.8] md:scale-100"><MapPinIcon /></div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest leading-tight mb-1">المدينة الأكثر</p>
                        <h3 className="text-[10px] md:text-xl font-black text-gray-900 dark:text-white leading-none truncate">{stats.mainCity}</h3>
                    </div>
                </div>
            </div>

            {/* Professional Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 mb-6 md:mb-8 flex flex-col lg:flex-row items-center gap-3 md:gap-4">
                <div className="relative flex-grow w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        className="w-full p-3 md:p-4 pr-10 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold text-gray-900 dark:text-white text-xs md:text-sm"
                    />
                    <div className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-400 scale-75 md:scale-100"><SearchIcon /></div>
                </div>
                
                <div className="flex gap-2 md:gap-3 w-full lg:w-auto">
                    <select 
                        value={cityFilter}
                        onChange={e => updateSearchParam('city', e.target.value)}
                        className="flex-1 lg:w-48 p-2.5 md:p-3 border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 text-[10px] md:text-xs font-bold"
                    >
                        {uniqueCities.map(city => <option key={city} value={city}>{city === 'all' ? '🏙️ كل المدن' : city}</option>)}
                    </select>
                    
                    <select
                        value={sortBy}
                        onChange={e => updateSearchParam('sort', e.target.value)}
                        className="flex-1 lg:w-64 p-2.5 md:p-3 border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 text-[10px] md:text-xs font-bold"
                    >
                        <option value="lastOrderDate_desc">📅 الأحدث أولاً</option>
                        <option value="lastOrderDate_asc">📅 الأقدم أولاً</option>
                        <option value="totalSpent_desc">💰 الأعلى إنفاقاً</option>
                        <option value="orderCount_desc">📦 الأكثر طلباً</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-gray-700 overflow-hidden">
                {/* Desktop View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-6">بيانات الزبون</th>
                                <th className="px-6 py-6">المدينة</th>
                                <th className="px-6 py-6 text-center">الطلبيات</th>
                                <th className="px-6 py-6">إجمالي المشتريات</th>
                                <th className="px-6 py-6">تاريخ آخر تعامل</th>
                                <th className="px-8 py-6 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {displayedCustomers.map(customer => (
                                <tr key={customer.phone} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-gray-500 group-hover:bg-yellow-500 group-hover:text-white transition-all">{customer.name.charAt(0)}</div>
                                            <div>
                                                <ReactRouterDOM.Link to={`/customers/${customer.phone}`} className="font-black text-gray-900 dark:text-white hover:text-yellow-600 block leading-tight text-sm">
                                                    {customer.name}
                                                </ReactRouterDOM.Link>
                                                <span className="text-xs text-gray-400 font-bold font-mono">{customer.phone}</span>
                                            </div>
                                            {customer.orderCount >= 5 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full uppercase border border-yellow-200">💎 VIP</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-600 dark:text-gray-300 font-bold text-xs">{customer.city}</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-black text-xs">{customer.orderCount}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-black text-gray-900 dark:text-white text-lg font-mono">
                                            {customer.totalSpent.toLocaleString()} <span className="text-xs font-bold text-gray-400">د.ل</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 font-bold text-xs">
                                        {new Date(customer.lastOrderDate).toLocaleDateString('ar-LY')}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button onClick={() => setCustomerToDelete(customer)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all" title="حذف الزبون">
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="md:hidden p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {displayedCustomers.map(customer => (
                        <div key={customer.phone} className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 relative animate-fade-in-up hover:shadow-md transition-shadow">
                            <ReactRouterDOM.Link to={`/customers/${customer.phone}`} className="block">
                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                    <div className="flex items-center gap-2.5 md:gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-yellow-600 shadow-sm border dark:border-gray-700 text-xs md:text-base">{customer.name.charAt(0)}</div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-sm md:text-base text-gray-900 dark:text-white truncate">{customer.name}</h3>
                                            <p className="text-[10px] md:text-xs text-gray-400 font-bold font-mono">{customer.phone}</p>
                                        </div>
                                    </div>
                                    {customer.orderCount >= 5 && <span className="bg-yellow-500 text-white text-[8px] md:text-[10px] font-black px-2 py-1 rounded-lg">VIP</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2 md:gap-4 border-t dark:border-gray-700 pt-3 md:pt-4">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase mb-0.5">المدينة</p>
                                        <p className="font-bold text-gray-700 dark:text-gray-200 text-[10px] md:text-sm">{customer.city}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase mb-0.5">إجمالي المشتريات</p>
                                        <p className="font-black text-green-600 text-xs md:text-lg">{customer.totalSpent.toLocaleString()} <span className="text-[10px] md:text-xs font-normal">د.ل</span></p>
                                    </div>
                                </div>
                            </ReactRouterDOM.Link>
                            <button
                                onClick={() => setCustomerToDelete(customer)}
                                className="absolute top-3 left-3 md:top-4 md:left-4 p-1.5 text-red-300 hover:text-red-500 transition-colors"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>

                {visibleCount < customers.length && (
                    <div className="p-8 border-t dark:border-gray-700 flex justify-center bg-gray-50/50 dark:bg-gray-900/50">
                        <button 
                            onClick={() => setVisibleCount(prev => prev + 50)} 
                            className="bg-white dark:bg-gray-800 px-8 py-3 rounded-2xl font-black text-xs shadow-md hover:-translate-y-1 transition-all border dark:border-gray-700"
                        >
                            عرض المزيد من الزبائن ({customers.length - visibleCount})
                        </button>
                    </div>
                )}
                
                {customers.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-gray-800">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><UserGroupIcon /></div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white">لم يتم العثور على زبائن</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">جرب تغيير معايير البحث أو الفلترة لتظهر لك النتائج.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersPage;
