
import React, { useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ClientTransactionType, OrderType, DeliveryTrackingStatus, ClientTransaction, TreasuryType, CompanyTxType, PaymentStatus } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';

// --- Icons ---
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;

const superNormalizePhone = (p: any) => String(p || '').replace(/\D/g, '').replace(/^218/, '').replace(/^0+/, '').trim();

const ClientDetailsPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { clients, clientTransactions, orders, addClientTransaction, deleteClientTransaction, getStoreNames, shippingOrigins, exchangeRate, addCompanyTransaction, currentUser } = useAppContext();
    
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [txToDelete, setTxToDelete] = useState<any | null>(null);

    const [payAmount, setPayAmount] = useState('');
    const [payNotes, setPayNotes] = useState('');
    const [adPlatform, setAdPlatform] = useState('فيسبوك');
    const [adAmount, setAdAmount] = useState('');
    const [adNotes, setAdNotes] = useState('');
    const [shipAmount, setShipAmount] = useState('');
    const [shipOriginId, setShipOriginId] = useState(shippingOrigins[0]?.id || '');
    const [shipNotes, setShipNotes] = useState('');

    const client = clients.find(c => String(c.id) === id);
    
    const { transactions, filteredTransactions } = useMemo(() => {
        if (!client) return { transactions: [], filteredTransactions: [] };

        const clientPhoneCore = superNormalizePhone(client.phone);
        const clientId = String(client.id);
        
        const ledgerTxs = clientTransactions.filter(t => {
            const txPhoneCore = superNormalizePhone(t.clientId);
            return (txPhoneCore !== '' && txPhoneCore === clientPhoneCore) || String(t.clientId) === clientId;
        });

        const relatedOrders = orders.filter(o => !o.isDeleted && superNormalizePhone(o.phone1) === clientPhoneCore);
        const orderTxs: any[] = [];
        
        relatedOrders.forEach(order => {
            const invoiceExistsInLedger = ledgerTxs.some(tx => tx.referenceId === order.id && tx.type === ClientTransactionType.Invoice);
            if (!invoiceExistsInLedger) {
                orderTxs.push({ 
                    id: `AUTO-INV-${order.id}`, 
                    clientId: client.id, 
                    type: ClientTransactionType.Invoice, 
                    amount: order.total, 
                    date: order.date, 
                    referenceId: order.id, 
                    notes: `فاتورة #${order.id} [${getStoreNames([order.storeId])}]`, 
                    isVirtual: true 
                });
            }
            
            if (order.isDepositPaid && order.deposit && order.deposit > 0) {
                const depositExistsInLedger = ledgerTxs.some(tx => tx.referenceId === order.id && tx.type === ClientTransactionType.Payment);
                if (!depositExistsInLedger) {
                    orderTxs.push({ 
                        id: `AUTO-DEP-${order.id}`, 
                        clientId: client.id, 
                        type: ClientTransactionType.Payment, 
                        amount: order.deposit, 
                        date: order.date, 
                        referenceId: order.id, 
                        notes: `عربون فاتورة #${order.id}`, 
                        isVirtual: true 
                    });
                }
            }
        });

        const all = [...ledgerTxs, ...orderTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const filtered = all.filter(tx => {
            if (selectedMonth === 'all') return true;
            const txDate = new Date(tx.date);
            return txDate.getMonth().toString() === selectedMonth && txDate.getFullYear().toString() === selectedYear;
        });

        return { transactions: all, filteredTransactions: filtered };
    }, [clientTransactions, orders, client, selectedMonth, selectedYear, getStoreNames]);

    const totalBalance = useMemo(() => {
        return transactions.reduce((acc, tx) => {
            if (tx.type === ClientTransactionType.Invoice) return acc + tx.amount;
            return acc - tx.amount;
        }, 0);
    }, [transactions]);

    const handlePrint = () => {
        const printContent = document.getElementById('ledger-printable-area');
        if (!printContent) return;
        const printWindow = window.open('', '', 'height=1000,width=1200');
        if (!printWindow) return;
        printWindow.document.write('<html><head><title>كشف حساب عميل</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"><style>body { font-family: "Cairo", sans-serif; direction: rtl; padding: 40px; background: white; } @media print { .no-print { display: none !important; } .print-only { display: block !important; } }</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 1000);
    };

    const handleRecordPayment = async () => {
        if (!client || !payAmount) return;
        await addClientTransaction(client.phone, Number(payAmount), ClientTransactionType.Payment, payNotes || 'سند قبض يدوي');
        setPayAmount(''); setPayNotes(''); setIsPaymentModalOpen(false);
    };

    const handleRecordAdInvoice = async () => {
        if (!client || !adAmount) return;
        const note = `فاتورة إعلان ممول [${adPlatform}] - ${adNotes}`;
        await addClientTransaction(client.phone, Number(adAmount), ClientTransactionType.Invoice, note, "");
        setIsAdModalOpen(false); setAdAmount(''); setAdNotes('');
    };

    const handleRecordShipInvoice = async () => {
        if (!client || !shipAmount) return;
        const origin = shippingOrigins.find(o => o.id === shipOriginId);
        if (!origin) return;
        const costLYD = Number(shipAmount);
        const note = `فاتورة شحن يدوي [${origin.name}] - ${shipNotes}`;
        await addClientTransaction(client.phone, costLYD, ClientTransactionType.Invoice, note, "");
        setIsShipModalOpen(false); setShipAmount(''); setShipNotes('');
    };

    if (!client) return null;

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-md animate-fade-in-up">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><CashIcon /> تسجيل دفعة (سند قبض)</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">المبلغ المقبوض (د.ل)</label><input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-black text-2xl border-none" autoFocus /></div>
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">ملاحظات</label><input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none" placeholder="نقداً، تحويل، موبي كاش..." /></div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl">إلغاء</button>
                            <button onClick={handleRecordPayment} className="flex-1 py-3 bg-green-600 text-white font-black rounded-xl">تأكيد الاستلام</button>
                        </div>
                    </div>
                </div>
            )}

            {isAdModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-md animate-fade-in-up border-t-8 border-purple-500">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-purple-600"><SpeakerIcon /> تسجيل فاتورة إعلان</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">المنصة</label><select value={adPlatform} onChange={e => setAdPlatform(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none font-bold"><option>فيسبوك</option><option>إنستغرام</option><option>سناب شات</option><option>تيك توك</option><option>أخرى</option></select></div>
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">المبلغ المطلوب (د.ل)</label><input type="number" value={adAmount} onChange={e => setAdAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-black text-2xl border-none text-purple-600" /></div>
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">ملاحظات (اختياري)</label><input type="text" value={adNotes} onChange={e => setAdNotes(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none" placeholder="إعلانات شهر..." /></div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsAdModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl">إلغاء</button>
                            <button onClick={handleRecordAdInvoice} className="flex-1 py-3 bg-purple-600 text-white font-black rounded-xl">إضافة مديونية</button>
                        </div>
                    </div>
                </div>
            )}

            {isShipModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up border-t-8 border-blue-600">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-600"><TruckIcon /> تسجيل فاتورة شحن</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">بلد الشحن (المصدر)</label><select value={shipOriginId} onChange={e => setShipOriginId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none font-bold">{shippingOrigins.map(o => <option key={o.id} value={o.id}>{o.name} ({o.ratePerKgUSD}$/كجم)</option>)}</select></div>
                            <div><label className="block text-xs font-bold text-gray-400 mb-1">المبلغ المطلوب (د.ل)</label><input type="number" step="any" value={shipAmount} onChange={e => setShipAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-black text-2xl border-none text-blue-600" /></div>

                            <div><label className="block text-xs font-bold text-gray-400 mb-1">ملاحظات</label><input type="text" value={shipNotes} onChange={e => setShipNotes(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-none" placeholder="رقم بوليصة، محتويات..." /></div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsShipModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl">إلغاء</button>
                            <button onClick={handleRecordShipInvoice} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl">إضافة مديونية</button>
                        </div>
                    </div>
                </div>
            )}

            {txToDelete && <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[300] p-4"><div className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-sm text-center shadow-2xl animate-fade-in-up"><h3 className="text-xl font-black text-red-600 mb-4">حذف حركة مالية</h3><p className="text-gray-500 mb-8 font-bold">هل أنت متأكد؟ هذا سيغير رصيد العميل فوراً.</p><div className="flex gap-3"><button onClick={() => setTxToDelete(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">تراجع</button><button onClick={async () => { await deleteClientTransaction(txToDelete.id); setTxToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl">نعم، حذف</button></div></div></div>}

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <button onClick={() => navigate('/clients')} className="p-3 bg-white dark:bg-gray-800 text-yellow-600 rounded-2xl shadow-md border border-yellow-100 dark:border-yellow-900/30 hover:bg-yellow-50 transition-all group" title="العودة لسجل العملاء"><BackIcon /></button>
                    <div className="text-center md:text-right">
                        <Breadcrumbs items={[{ label: 'الحسابات', path: '/financials' }, { label: 'سجل العملاء الموحد', path: '/clients' }, { label: client.name, path: undefined }]} />
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{client.name}</h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">{client.phone} {client.city ? `| ${client.city}` : ''}</p>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <button onClick={() => setIsAdModalOpen(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-xs"><SpeakerIcon /> إعلان ممول</button>
                    <button onClick={() => setIsShipModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs"><TruckIcon /> فاتورة شحن</button>
                    <button onClick={() => setIsPaymentModalOpen(true)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 text-xs"><CashIcon /> تسجيل دفعة</button>
                    <button onClick={handlePrint} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black shadow-lg hover:bg-black transition-all flex items-center gap-2 text-xs"><PrintIcon /> طباعة</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] shadow-lg border dark:border-gray-700 mb-8 no-print flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2"><CalendarIcon /><span className="font-black text-xs text-gray-400 uppercase tracking-widest">الفلترة حسب الشهر:</span></div>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl font-bold text-sm">
                    <option value="all">📅 كل الأشهر (كامل السجل)</option>
                    {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                {selectedMonth !== 'all' && (
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl font-bold text-sm">
                        {['2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                )}
                <span className="text-[10px] text-gray-400 font-bold mr-auto">يتم عرض {filteredTransactions.length} حركة من أصل {transactions.length}.</span>
            </div>

            <div id="ledger-printable-area">
                <div className="hidden print:block mb-10 pb-8 border-b-4 border-yellow-500">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-5xl font-black text-yellow-600 tracking-tighter">LibyPort</h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest mt-1">بوابة طرابلس العالمية للتجارة والشحن</p>
                        </div>
                        <div className="text-left">
                            <h2 className="text-3xl font-black text-gray-800">كشف حساب مالي موحد</h2>
                            <p className="text-lg font-bold text-gray-500 mt-1">الزبون: {client.name} | {client.phone}</p>
                            <p className="text-gray-400 font-bold">{selectedMonth === 'all' ? 'كامل السجل المالي' : `${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][Number(selectedMonth)]} / ${selectedYear}`}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl mb-10 border-b-8 border-yellow-500 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden print:bg-white print:text-black print:border print:rounded-3xl">
                     <div className="relative z-10 text-center md:text-right">
                        <p className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-1">الرصيد النهائي المستحق الآن</p>
                        <p className="text-6xl font-black font-mono leading-none">{totalBalance.toLocaleString()} <span className="text-2xl font-normal opacity-50">د.ل</span></p>
                        <span className={`text-[11px] font-black block mt-3 uppercase tracking-tighter px-3 py-1 rounded-full w-fit mx-auto md:mr-0 ${totalBalance > 0 ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
                            {totalBalance > 0 ? '(مطلوب من الزبون سداده للشركة)' : (totalBalance < 0 ? '(رصيد دائن للزبون لدى الشركة)' : '(الحساب خالص تماماً)')}
                        </span>
                    </div>
                    <div className="no-print grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10 text-center backdrop-blur-sm"><p className="text-[10px] font-black text-white/50 uppercase mb-1">إجمالي الحركات</p><p className="text-2xl font-black">{transactions.length}</p></div>
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10 text-center backdrop-blur-sm"><p className="text-[10px] font-black text-white/50 uppercase mb-1">أحدث حركة</p><p className="text-xs font-black">{new Date(transactions[0]?.date || Date.now()).toLocaleDateString('ar-LY')}</p></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b dark:border-gray-700">
                            <tr><th className="px-8 py-5">التاريخ</th><th className="px-6 py-5">نوع الحركة</th><th className="px-6 py-5">البيان والوصف</th><th className="px-6 py-5 text-center">مدين (+)</th><th className="px-6 py-5 text-center">دائن (-)</th><th className="px-6 py-5 no-print"></th></tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {filteredTransactions.map(tx => {
                                const isInvoice = tx.type === ClientTransactionType.Invoice;
                                const label = isInvoice ? "فاتورة" : "سند قبض";
                                return (
                                    <tr key={tx.id} className={`hover:bg-gray-50/50 transition-colors ${tx.isVirtual ? 'bg-gray-50/20' : ''}`}>
                                        <td className="px-8 py-6 font-mono text-gray-500 font-bold whitespace-nowrap">{new Date(tx.date).toLocaleDateString('ar-LY')}</td>
                                        <td className="px-6 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${isInvoice ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{label}</span>
                                        </td>
                                        <td className="px-6 py-6 font-black text-gray-800 dark:text-white leading-tight min-w-[200px]">{tx.notes}</td>
                                        <td className="px-6 py-6 text-center font-black text-red-600 text-base">{isInvoice ? tx.amount.toLocaleString() : '-'}</td>
                                        <td className="px-6 py-6 text-center font-black text-green-600 text-base">{!isInvoice ? tx.amount.toLocaleString() : '-'}</td>
                                        <td className="px-6 py-6 text-left no-print">
                                            {!tx.isVirtual && <button onClick={() => setTxToDelete(tx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><TrashIcon /></button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div className="py-24 text-center flex flex-col items-center bg-gray-50/20"><div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 mb-4 border-2 border-dashed"><CalendarIcon /></div><p className="text-gray-400 font-bold italic">لا توجد حركات مسجلة لهذا الشهر المختار.</p></div>
                    )}
                </div>

                <div className="hidden print:block mt-16 pt-8 border-t border-dashed border-gray-300">
                    <div className="flex justify-between items-end">
                        <div className="text-center w-48"><p className="font-black text-sm mb-12">توقيع المحاسب</p><div className="h-0.5 bg-gray-300 w-full"></div></div>
                        <div className="relative w-32 h-32 flex items-center justify-center opacity-70"><div className="absolute inset-0 border-4 border-blue-900 rounded-full flex flex-col items-center justify-center rotate-12"><span className="text-[10px] font-black text-blue-900">LIBYPORT</span><span className="text-[8px] font-bold text-blue-900">TRIPOLI</span></div></div>
                        <div className="text-center w-48 text-[10px] font-bold text-gray-400">تم استخراج هذا الكشف آلياً بتاريخ {new Date().toLocaleDateString('ar-LY')}<br/>LibyPort Logistics Hub</div>
                    </div>
                </div>
            </div>
            <div className="h-20 no-print"></div>
        </div>
    );
};

export default ClientDetailsPage;
