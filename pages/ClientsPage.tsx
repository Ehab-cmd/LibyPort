
import React, { useState, useMemo, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Client, ClientTransactionType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { LIBYAN_CITIES } from '../constants';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

// الدالة الموحدة لمعالجة أرقام الهواتف لضمان الربط الصحيح بين كافة السجلات
const superNormalizePhone = (p: any) => String(p || '').replace(/\D/g, '').replace(/^218/, '').replace(/^0+/, '').trim();

const SuccessClientModal: React.FC<{ clientName: string; onClose: () => void }> = ({ clientName, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center transform transition-all animate-fade-in-up border dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/30 mb-6 text-green-500">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم إضافة العميل بنجاح</h2>
            <button onClick={onClose} className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-yellow-600 transition-all mt-4">موافق</button>
        </div>
    </div>
);

const AddClientModal: React.FC<{ onClose: () => void; onSave: (data: any) => Promise<void> }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ name, phone, city, address });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-fade-in-up border dark:border-gray-700">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">إضافة عميل مالي جديد</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="اسم العميل (التاجر)" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white" required />
                    <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 font-mono font-bold dark:text-white" required />
                    <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white" required>
                        <option value="">-- اختر مدينة --</option>
                        {LIBYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="العنوان بالتفصيل (اختياري)" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white" />
                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl transition-all">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="flex-2 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl hover:bg-yellow-600 disabled:bg-gray-400">
                            {isSaving ? 'جاري الحفظ...' : 'حفظ العميل'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientsPage: React.FC = () => {
    const { clients, clientTransactions, orders, addClient } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addedClientName, setAddedClientName] = useState<string | null>(null);
    const navigate = ReactRouterDOM.useNavigate();

    // حفظ واستعادة موقع التمرير
    const handleClientClick = (id: string) => {
        const container = document.getElementById('main-content');
        if (container) {
            sessionStorage.setItem('clients_scroll_pos', container.scrollTop.toString());
        }
        navigate(`/clients/${id}`);
    };

    useLayoutEffect(() => {
        const savedPos = sessionStorage.getItem('clients_scroll_pos');
        if (savedPos && clients.length > 0) {
            const container = document.getElementById('main-content');
            if (container) {
                const top = parseInt(savedPos);
                const attemptScroll = () => {
                    if (container) {
                        container.scrollTo({ top, behavior: 'instant' });
                    }
                };

                // محاولات متعددة لضمان استقرار التمرير بعد رندر العناصر
                attemptScroll();
                const t1 = setTimeout(attemptScroll, 50);
                const t2 = setTimeout(attemptScroll, 150);
                const t3 = setTimeout(() => {
                    attemptScroll();
                    sessionStorage.removeItem('clients_scroll_pos');
                }, 400);

                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                };
            }
        }
    }, [clients.length]);

    const clientsWithCalculatedData = useMemo(() => {
        const uniqueClientsGroup = new Map<string, any>();

        clients.forEach(client => {
            const phoneKey = superNormalizePhone(client.phone);
            if (!phoneKey) return;
            if (!uniqueClientsGroup.has(phoneKey)) {
                uniqueClientsGroup.set(phoneKey, { ...client, normalizedPhone: phoneKey });
            }
        });

        return Array.from(uniqueClientsGroup.values()).map(client => {
            const phoneKey = client.normalizedPhone;
            
            // تصفية العمليات المالية اليدوية الخاصة بهذا الهاتف
            const ledgerTxs = clientTransactions.filter(t => superNormalizePhone(t.clientId) === phoneKey || String(t.clientId) === String(client.id));
            
            // تصفية الفواتير الفعلية الخاصة بهذا الهاتف
            const activeOrders = orders.filter(o => !o.isDeleted && superNormalizePhone(o.phone1) === phoneKey);

            let currentBalance = 0;
            let lastDate = client.lastTransactionDate;
            
            // 1. حساب رصيد الحركات اليدوية في السجل
            ledgerTxs.forEach(tx => {
                if (tx.type === ClientTransactionType.Invoice) currentBalance += tx.amount;
                else currentBalance -= tx.amount;
                if (!lastDate || new Date(tx.date) > new Date(lastDate)) lastDate = tx.date;
            });

            // 2. حساب رصيد الفواتير التي لم ترحل يدوياً بعد (Virtual Invoices)
            // نستخدم نفس المنطق الدقيق لصفحة التفاصيل لضمان التزامن
            activeOrders.forEach(o => {
                const invoiceExistsInLedger = ledgerTxs.some(t => t.referenceId === o.id && t.type === ClientTransactionType.Invoice);
                if (!invoiceExistsInLedger) {
                    currentBalance += o.total;
                }
                
                // طرح العربون إذا كان مدفوعاً ولم يسجل كحركة يدوية بعد
                if (o.isDepositPaid && o.deposit && o.deposit > 0) {
                    const depositExistsInLedger = ledgerTxs.some(t => t.referenceId === o.id && t.type === ClientTransactionType.Payment);
                    if (!depositExistsInLedger) {
                        currentBalance -= o.deposit;
                    }
                }
                
                if (!lastDate || new Date(o.date) > new Date(lastDate)) lastDate = o.date;
            });

            return {
                ...client,
                balance: currentBalance,
                totalPurchases: activeOrders.length,
                lastTransactionDate: lastDate
            };
        }).filter(c => 
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (c.phone || '').includes(searchTerm)
        ).sort((a, b) => b.balance - a.balance);

    }, [clients, clientTransactions, orders, searchTerm]);

    const handleAddClient = async (data: any) => {
        await addClient(data);
        setIsAddModalOpen(false);
        setAddedClientName(data.name);
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {addedClientName && <SuccessClientModal clientName={addedClientName} onClose={() => setAddedClientName(null)} />}
            {isAddModalOpen && <AddClientModal onClose={() => setIsAddModalOpen(false)} onSave={handleAddClient} />}
            
            <div className="flex flex-row justify-between items-center mb-6 md:mb-10 gap-2">
                <div className="animate-fade-in-up flex-1">
                    <h1 className="text-lg md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">سجل العملاء المالي</h1>
                    <p className="hidden md:block text-gray-500 dark:text-gray-400 mt-2 font-medium">إدارة الحسابات الموحدة للزبائن والتجار.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-yellow-500 text-white px-3 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center justify-center gap-1.5 text-[10px] md:text-base whitespace-nowrap">
                    <PlusIcon /> إضافة عميل جديد
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 mb-6 md:mb-8">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو رقم الهاتف..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 md:p-4 pr-10 md:pr-12 border-none bg-gray-50 dark:bg-gray-900 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white shadow-inner text-sm md:text-base"
                    />
                    <div className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-400 scale-75 md:scale-100"><SearchIcon /></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Desktop View Table (hidden on mobile) */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 tracking-widest border-b dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-6">اسم العميل الموحد</th>
                                <th className="px-6 py-6">رقم الهاتف</th>
                                <th className="px-6 py-6">المدينة</th>
                                <th className="px-6 py-6 text-center">الطلبيات</th>
                                <th className="px-6 py-6">الرصيد المستحق</th>
                                <th className="px-6 py-6">آخر تعامل</th>
                                <th className="px-8 py-6 text-left">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {clientsWithCalculatedData.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <button onClick={() => handleClientClick(client.id)} className="font-black text-gray-900 dark:text-white hover:text-yellow-600 transition-colors block leading-tight text-right">
                                            {client.name}
                                        </button>
                                        <span className="text-[9px] text-gray-400 font-bold">حساب مالي موحد</span>
                                    </td>
                                    <td className="px-6 py-6 font-mono font-bold text-gray-500 dark:text-gray-400">{client.phone}</td>
                                    <td className="px-6 py-6 text-gray-400 font-bold">{client.city}</td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg font-black text-xs text-gray-600 dark:text-gray-300">{client.totalPurchases}</span>
                                    </td>
                                    <td className={`px-6 py-6 font-black text-xl ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {client.balance.toLocaleString()} <span className="text-xs font-normal opacity-60">د.ل</span>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-gray-400 font-bold">
                                        {client.lastTransactionDate ? new Date(client.lastTransactionDate).toLocaleDateString('ar-LY') : '-'}
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <button 
                                            onClick={() => handleClientClick(client.id)} 
                                            className="bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-tighter shadow-sm hover:bg-yellow-600 transition-all"
                                        >
                                            كشف حساب
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile & Tablet Card View (hidden on desktop) */}
                <div className="md:hidden p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 bg-gray-50 dark:bg-gray-900/50">
                    {clientsWithCalculatedData.map(client => (
                        <div key={client.id} className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-xl border border-gray-100 dark:border-gray-700 relative animate-fade-in-up hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div className="text-right min-w-0 flex-1">
                                    <h3 className="font-black text-gray-900 dark:text-white text-base md:text-xl leading-tight truncate">{client.name}</h3>
                                    <p className="text-[10px] md:text-sm font-mono font-bold text-gray-400 mt-0.5 md:mt-1">{client.phone}</p>
                                    <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 md:mt-2 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full w-fit">حساب مالي موحد</p>
                                </div>
                                <div className="text-left flex flex-col items-end ml-2">
                                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">الرصيد الحالي</span>
                                    <p className={`text-lg md:text-2xl font-black font-mono leading-none ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {client.balance.toLocaleString()}
                                    </p>
                                    <span className={`text-[8px] md:text-[10px] font-bold ${client.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>دينار ليبي</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 md:p-4 rounded-xl md:rounded-3xl">
                                <div>
                                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase block mb-0.5 md:mb-1">المدينة</span>
                                    <p className="font-black text-[10px] md:text-xs text-gray-700 dark:text-white">{client.city}</p>
                                </div>
                                <div className="text-left">
                                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase block mb-0.5 md:mb-1">إجمالي الطلبيات</span>
                                    <p className="font-black text-[10px] md:text-xs text-gray-700 dark:text-white">{client.totalPurchases} طلبية</p>
                                </div>
                                <div className="col-span-2 pt-2 border-t dark:border-gray-700 mt-1 md:mt-2">
                                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase block mb-0.5 md:mb-1">تاريخ آخر حركة مالية</span>
                                    <p className="font-bold text-[10px] md:text-xs text-gray-600 dark:text-gray-300">
                                        {client.lastTransactionDate ? new Date(client.lastTransactionDate).toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' }) : 'لا يوجد'}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleClientClick(client.id)}
                                className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                عرض كشف الحساب الموحد
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {clientsWithCalculatedData.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mt-6 animate-pulse">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner"><UserIcon /></div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لم يتم العثور على عملاء</h3>
                    <p className="text-gray-500 mt-2 font-medium">جرب البحث بكلمات أخرى أو أضف عميلاً جديداً للسجل.</p>
                </div>
            )}
            
            <div className="h-24"></div>
        </div>
    );
};

export default ClientsPage;
