
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { CompanyTxType, PaymentStatus, Store, ExpenseCategory, CompanyTransaction, User, DeliveryTrackingStatus, AccountingSystem, OrderType, TreasuryType, BankAccount, DeliveryCompany, UserRole } from '../types';

// --- خوارزمية التقريب الموحدة ---
const customRound = (val: number): number => {
    const integral = Math.floor(val);
    const fractional = parseFloat((val - integral).toFixed(2));
    if (fractional < 0.5) return integral;
    if (fractional >= 0.75) return integral + 1;
    return integral + 0.5; 
};

// --- Icons ---
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const BankIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const WalletIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const TruckIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;

const AddTransactionModal: React.FC<{
    stores: Store[];
    users: User[];
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: CompanyTransaction | null;
}> = ({ stores, users, onClose, onSave, initialData }) => {
    const { showToast } = useNotification();
    const [type, setType] = useState<CompanyTxType>(initialData?.type || CompanyTxType.Expense);
    const [amount, setAmount] = useState(initialData?.amount ? String(initialData.amount) : '');
    const [beneficiary, setBeneficiary] = useState(initialData?.beneficiary || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [category, setCategory] = useState<ExpenseCategory | undefined>(initialData?.expenseCategory);
    const [storeId, setStoreId] = useState<number | ''>(initialData?.storeId || '');
    const [status, setStatus] = useState<PaymentStatus>(initialData?.paymentStatus || PaymentStatus.Paid);
    const [treasuryType, setTreasuryType] = useState<TreasuryType>(initialData?.treasuryType || TreasuryType.Cash);
    const [treasuryId, setTreasuryId] = useState<string>(initialData?.treasuryId || '');
    const [isSaving, setIsSaving] = useState(false);

    const { treasuries, bankAccounts, systemSettings } = useAppContext();
    const deliveryCos = systemSettings.deliveryCompanies || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !beneficiary || !description || !treasuryId) {
            showToast('يرجى تعبئة كافة الحقول الأساسية واختيار الخزينة', 'error');
            return;
        }
        
        setIsSaving(true);
        const data = {
            type,
            amount: Number(amount),
            beneficiary,
            description,
            expenseCategory: type === CompanyTxType.Expense || type === CompanyTxType.StoreDeduction ? category : undefined,
            storeId: storeId || undefined,
            paymentStatus: status,
            treasuryType,
            treasuryId,
            date: initialData?.date || new Date().toISOString(),
        };
        await onSave(data);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-black mb-6">{initialData ? 'تعديل حركة مالية' : 'تسجيل حركة مالية جديدة'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">نوع العملية</label>
                            <select value={type} onChange={e => setType(e.target.value as CompanyTxType)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold">
                                {Object.values(CompanyTxType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">المبلغ (د.ل)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-black text-lg" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">المستفيد / الجهة</label>
                            <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold" placeholder="مثال: موظف، شركة إعلانات، مورد..." required />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">البيان / الوصف</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold" placeholder="تفاصيل العملية..." required />
                        </div>
                    </div>

                    {(type === CompanyTxType.Expense || type === CompanyTxType.StoreDeduction) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">تصنيف المصروف</label>
                                <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold">
                                    <option value="">-- اختر التصنيف --</option>
                                    {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {type === CompanyTxType.StoreDeduction && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">المتجر المستهدف</label>
                                    <select value={storeId} onChange={e => setStoreId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold">
                                        <option value="">-- اختر المتجر --</option>
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">حالة الدفع</label>
                        <select value={status} onChange={e => setStatus(e.target.value as PaymentStatus)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold">
                            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">الخزينة المتأثرة</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => { setTreasuryType(TreasuryType.Cash); setTreasuryId(''); }} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${treasuryType === TreasuryType.Cash ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>💰 نقداً</button>
                            <button type="button" onClick={() => { setTreasuryType(TreasuryType.Bank); setTreasuryId(''); }} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${treasuryType === TreasuryType.Bank ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>🏦 مصرف</button>
                            <button type="button" onClick={() => { setTreasuryType(TreasuryType.DeliveryCompany); setTreasuryId(deliveryCos[0]?.id || ''); }} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${treasuryType === TreasuryType.DeliveryCompany ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>🚚 توصيل</button>
                        </div>

                        {treasuryType === TreasuryType.Cash && (
                            <select value={treasuryId} onChange={e => setTreasuryId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm">
                                <option value="">-- اختر الخزينة --</option>
                                {treasuries.filter(t => t.type === TreasuryType.Cash).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}

                        {treasuryType === TreasuryType.Bank && (
                            <select value={treasuryId} onChange={e => setTreasuryId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm">
                                <option value="">-- اختر الحساب البنكي --</option>
                                {bankAccounts.map(b => <option key={b.id} value={String(b.id)}>{b.bankName} - {b.accountNumber}</option>)}
                                {treasuries.filter(t => t.type === TreasuryType.Bank).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}

                        {treasuryType === TreasuryType.DeliveryCompany && (
                            <select value={treasuryId} onChange={e => setTreasuryId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm">
                                <option value="">-- اختر شركة التوصيل --</option>
                                {deliveryCos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transition-all">
                            {isSaving ? 'جاري الحفظ...' : 'حفظ الحركة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmModal: React.FC<{ onClose: () => void; onConfirm: () => Promise<void> }> = ({ onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-sm animate-fade-in-up">
                <h3 className="text-xl font-black text-red-600 mb-2">تأكيد الحذف</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold">هل أنت متأكد من رغبتك في حذف هذه الحركة المالية نهائياً؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white font-bold rounded-xl">إلغاء</button>
                    <button onClick={handleConfirm} disabled={isDeleting} className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl shadow-lg hover:bg-red-700 transition-all">
                        {isDeleting ? 'جاري الحذف...' : 'نعم، حذف'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CompanyFinancialsPage: React.FC = () => {
    const { 
        orders, companyTransactions, stores, users, bankAccounts, 
        treasuries, systemSettings, getExchangeRateForDate, 
        addCompanyTransaction, updateCompanyTransaction, 
        deleteCompanyTransaction, currentUser, treasuryBalances 
    } = useAppContext();
    const [activeTab, setActiveTab] = useState<'treasury' | 'store_profits' | 'detailed_pnl' | 'journal'>('store_profits');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [txToEdit, setTxToEdit] = useState<CompanyTransaction | null>(null);
    const [txToDeleteId, setTxToDeleteId] = useState<string | null>(null);

    const companyStats = useMemo(() => {
        let totalCompanyShare = 0;
        let totalMarketingExpenses = 0;
        let totalOperationalExpenses = 0;

        orders.forEach(o => {
            if (o.isDeleted || o.deliveryTrackingStatus !== DeliveryTrackingStatus.Delivered) return;
            const store = stores.find(s => s.id === o.storeId);
            if (store?.name === "Luxury master") return;

            const rate = o.exchangeRateSnapshot || getExchangeRateForDate(o.date);
            const margin = o.total - ((o.costInUSD || 0) * rate);

            if (store?.name === "LibyPort") {
                totalCompanyShare += margin;
            } else if (store?.name === "La Perla Femme") {
                totalCompanyShare += (margin * 0.05);
            } else {
                const owner = users.find(u => u.id === store?.ownerId);
                const system = owner?.accountingSystem || AccountingSystem.Margin;
                const pieces = (o.items || []).reduce((sum, i) => sum + i.quantity, 0);

                if (o.orderType === OrderType.InstantDelivery || system === AccountingSystem.Commission) {
                    totalCompanyShare += (margin - (pieces * 10));
                } else {
                    totalCompanyShare += (margin * 0.6);
                }
            }
        });

        companyTransactions.forEach(tx => {
            if (tx.type === CompanyTxType.Expense) {
                if (tx.expenseCategory === ExpenseCategory.Marketing) {
                    totalMarketingExpenses += tx.amount;
                } else {
                    totalOperationalExpenses += tx.amount;
                }
            }
        });

        const totalExpenses = totalMarketingExpenses + totalOperationalExpenses;
        return {
            totalShare: customRound(totalCompanyShare),
            marketing: customRound(totalMarketingExpenses),
            operational: customRound(totalOperationalExpenses),
            totalExpenses: customRound(totalExpenses),
            netProfit: customRound(totalCompanyShare - totalExpenses)
        };
    }, [orders, stores, users, companyTransactions, getExchangeRateForDate]);

    const storeAnalysis = useMemo(() => {
        return stores.map(store => {
            const storeOrders = orders.filter(o => o.storeId === store.id && o.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered);
            let companyShare = 0;

            storeOrders.forEach(o => {
                const rate = o.exchangeRateSnapshot || getExchangeRateForDate(o.date);
                const margin = o.total - ((o.costInUSD || 0) * rate);
                
                if (store.name === "LibyPort") {
                    companyShare += margin;
                } else if (store.name === "La Perla Femme") {
                    companyShare += (margin * 0.05);
                } else {
                    const owner = users.find(u => u.id === store.ownerId);
                    const system = owner?.accountingSystem || AccountingSystem.Margin;
                    const pieces = (o.items || []).reduce((q, i) => q + i.quantity, 0);
                    
                    if (o.orderType === OrderType.InstantDelivery || system === AccountingSystem.Commission) {
                        companyShare += (margin - (pieces * 10));
                    } else {
                        companyShare += (margin * 0.6);
                    }
                }
            });
            return {
                id: store.id,
                name: store.name,
                ownerName: store.name === "LibyPort" ? "الإدارة العامة" : (users.find(u => u.id === store.ownerId)?.name || 'غير معروف'),
                companyProfit: customRound(companyShare),
                isExcluded: store.name === "Luxury master",
                isInternal: store.name === "LibyPort",
                isOwnerStore: store.name === "La Perla Femme"
            };
        }).sort((a,b) => b.companyProfit - a.companyProfit);
    }, [stores, users, orders, getExchangeRateForDate]);

    const sortedTransactions = useMemo(() => {
        return [...companyTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [companyTransactions]);

    const handleSaveTransaction = async (data: any) => {
        if (txToEdit) {
            await updateCompanyTransaction(txToEdit.id, data);
            setTxToEdit(null);
        } else {
            await addCompanyTransaction(data);
        }
    };

    return (
        <div className="container mx-auto px-1 py-4 md:p-8" dir="rtl">
            {isAddModalOpen && <AddTransactionModal stores={stores} users={users} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveTransaction} />}
            {txToEdit && <AddTransactionModal stores={stores} users={users} initialData={txToEdit} onClose={() => setTxToEdit(null)} onSave={handleSaveTransaction} />}
            {txToDeleteId && <DeleteConfirmModal onClose={() => setTxToDeleteId(null)} onConfirm={async () => await deleteCompanyTransaction(txToDeleteId)} />}

            <div className="flex items-center justify-between mb-6 md:mb-10 gap-4">
                <div>
                    <h1 className="text-xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">المركز المالي للإدارة</h1>
                    <p className="text-[10px] md:text-base text-gray-500 mt-1 font-medium">إدارة المصاريف، الإيرادات، وتحصيل حصص الشركة الكاملة.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 md:gap-3 transform hover:-translate-y-1 transition-all text-xs md:text-base whitespace-nowrap">
                    <PlusIcon /> <span className="hidden sm:inline">تسجيل حركة مالية</span><span className="sm:hidden">تسجيل</span>
                </button>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-6 mb-6 md:mb-12">
                <div className="bg-white dark:bg-gray-800 p-1.5 md:p-8 rounded-lg md:rounded-[2.5rem] shadow-sm md:shadow-xl border-b md:border-b-8 border-green-500 animate-fade-in-up flex flex-col justify-center text-center">
                    <p className="text-[5px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest mb-0.5">إجمالي الحصص</p>
                    <p className="text-[9px] md:text-4xl font-black text-green-600 leading-none truncate">{companyStats.totalShare.toLocaleString()} <span className="text-[5px] md:text-sm font-normal">د.ل</span></p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-1.5 md:p-8 rounded-lg md:rounded-[2.5rem] shadow-sm md:shadow-xl border-b md:border-b-8 border-red-500 animate-fade-in-up flex flex-col justify-center text-center">
                    <p className="text-[5px] md:text-[10px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest mb-0.5">إجمالي المصاريف</p>
                    <p className="text-[9px] md:text-4xl font-black text-red-500 leading-none truncate">{companyStats.totalExpenses.toLocaleString()} <span className="text-[5px] md:text-sm font-normal">د.ل</span></p>
                </div>
                <div className="bg-gray-900 text-white p-1.5 md:p-8 rounded-lg md:rounded-[2.5rem] shadow-sm md:shadow-xl border-b md:border-b-8 border-yellow-500 animate-fade-in-up flex flex-col justify-center text-center">
                    <p className="text-[5px] md:text-[10px] font-black text-yellow-500 uppercase tracking-tighter md:tracking-widest mb-0.5">صافي الربح</p>
                    <p className="text-[9px] md:text-4xl font-black leading-none truncate">{companyStats.netProfit.toLocaleString()} <span className="text-[5px] md:text-sm font-normal opacity-50">د.ل</span></p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:flex mb-8 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border dark:border-gray-700 max-w-4xl gap-1.5">
                <button onClick={() => setActiveTab('store_profits')} className={`py-2.5 md:py-3 px-2 md:px-6 rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap flex-1 ${activeTab === 'store_profits' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>أرباح المتاجر</button>
                <button onClick={() => setActiveTab('detailed_pnl')} className={`py-2.5 md:py-3 px-2 md:px-6 rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap flex-1 ${activeTab === 'detailed_pnl' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>بيان الأرباح</button>
                <button onClick={() => setActiveTab('journal')} className={`py-2.5 md:py-3 px-2 md:px-6 rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap flex-1 ${activeTab === 'journal' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>السجل العام</button>
                <button onClick={() => setActiveTab('treasury')} className={`py-2.5 md:py-3 px-2 md:px-6 rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap flex-1 ${activeTab === 'treasury' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>الخزائن</button>
            </div>

            {activeTab === 'treasury' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {treasuryBalances.map(t => (
                            <div key={`${t.type}-${t.id}`} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:border-yellow-500 transition-all">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${t.type === TreasuryType.Bank ? 'bg-blue-100 text-blue-600' : t.type === TreasuryType.DeliveryCompany ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'} scale-90 md:scale-100`}>
                                        {t.type === TreasuryType.Bank ? <BankIcon /> : t.type === TreasuryType.DeliveryCompany ? <TruckIcon /> : <WalletIcon />}
                                    </div>
                                    <div>
                                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.type}</p>
                                        <h3 className="font-black text-gray-900 dark:text-white text-sm md:text-lg leading-tight">{t.name}</h3>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-lg md:text-2xl font-black text-gray-900 dark:text-white font-mono">{t.balance.toLocaleString()}</p>
                                    <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase">د.ل</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-bold flex items-center gap-2">
                             💡 هذه الأرصدة تعبر عن المبالغ المحصلة فعلياً والموجودة في عهدة الموظفين أو حسابات المصارف أو ذمة شركات التوصيل قبل تصفيتها ونقلها للخزينة الرئيسية.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'store_profits' && (
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl overflow-hidden border dark:border-gray-700 animate-fade-in-up">
                    <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 font-black text-gray-800 dark:text-white no-print">تحليل أرباح حصة الشركة حسب المتجر</div>
                    
                    {/* Desktop View Table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black text-[10px] uppercase">
                                <tr>
                                    <th className="px-8 py-5">المتجر</th>
                                    <th className="px-6 py-5">المالك / التصنيف</th>
                                    <th className="px-8 py-5 text-left">ربح الشركة المحقق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {storeAnalysis.map(s => (
                                    <tr key={s.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${s.isExcluded ? 'opacity-40 grayscale' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${s.isExcluded ? 'bg-gray-200' : (s.isInternal || s.isOwnerStore ? 'bg-yellow-100 text-yellow-700 font-black' : 'bg-yellow-50 text-yellow-600')}`}><StoreIcon /></div>
                                                <div>
                                                    <span className="font-black text-gray-900 dark:text-white">{s.name}</span>
                                                    {s.isInternal && <span className="block text-[8px] font-black text-yellow-600 uppercase tracking-tighter">متجر الإدارة (ربح 100%)</span>}
                                                    {s.isOwnerStore && <span className="block text-[8px] font-black text-yellow-600 uppercase tracking-tighter">متجر خاص (حصة الشركة 5%)</span>}
                                                    {s.isExcluded && <span className="block text-[8px] font-bold text-red-500 uppercase tracking-tighter">مستثنى من حسابات الشركة</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 font-bold">{s.ownerName}</td>
                                        <td className={`px-8 py-5 text-left font-black text-lg ${s.isExcluded ? 'text-gray-400' : 'text-green-600'}`}>
                                            {s.companyProfit.toLocaleString()} <span className="text-xs font-normal">د.ل</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="md:hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {storeAnalysis.map(s => (
                            <div key={s.id} className={`bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 relative animate-fade-in-up ${s.isExcluded ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${s.isInternal || s.isOwnerStore ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600'}`}><StoreIcon /></div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight">{s.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{s.ownerName}</p>
                                        </div>
                                    </div>
                                    {s.isInternal && <span className="text-[8px] font-black uppercase bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">إدارة</span>}
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t dark:border-gray-700">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ربح الشركة المحقق</p>
                                        <p className={`text-xl font-black font-mono leading-none ${s.isExcluded ? 'text-gray-400' : 'text-green-600'}`}>
                                            {s.companyProfit.toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">دينار ليبي</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'journal' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border dark:border-gray-700 animate-fade-in-up">
                    <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 font-black text-gray-800 dark:text-white no-print">سجل كافة الحركات المالية المسجلة</div>
                    
                    {/* Desktop View Table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black text-[10px] uppercase">
                                <tr>
                                    <th className="px-8 py-5">التاريخ</th>
                                    <th className="px-6 py-5">النوع / التصنيف</th>
                                    <th className="px-6 py-5">المستفيد والبيان</th>
                                    <th className="px-6 py-5 text-left">المبلغ</th>
                                    <th className="px-6 py-5 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {sortedTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-8 py-5 text-gray-500 font-bold text-xs">{new Date(tx.date).toLocaleDateString('ar-LY')}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${tx.type === CompanyTxType.Income ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {tx.type === CompanyTxType.StoreDeduction ? 'سحب من المتجر' : (tx.type === CompanyTxType.Expense ? 'سحب من الشركة' : tx.type)} 
                                                {tx.expenseCategory ? ` | ${tx.expenseCategory}` : ''}
                                            </span>
                                            {tx.storeId && <span className="block text-[8px] text-blue-500 font-bold mt-1">المتجر: {stores.find(s => s.id === tx.storeId)?.name}</span>}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-black text-gray-800 dark:text-white">{tx.beneficiary}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{tx.description}</p>
                                        </td>
                                        <td className={`px-6 py-5 text-left font-black text-lg ${tx.type === CompanyTxType.Income ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === CompanyTxType.Income ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-xs font-normal opacity-50">د.ل</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setTxToEdit(tx)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><EditIcon /></button>
                                                <button onClick={() => setTxToDeleteId(tx.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="md:hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {sortedTransactions.map(tx => (
                            <div key={tx.id} className={`bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border-2 relative animate-fade-in-up transition-all ${tx.type === CompanyTxType.Income ? 'border-green-50 dark:border-green-900/10' : 'border-red-50 dark:border-red-900/10'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(tx.date).toLocaleDateString('ar-LY')}</span>
                                        <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight mt-1">{tx.beneficiary}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{tx.description}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${tx.type === CompanyTxType.Income ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {tx.type}
                                    </span>
                                </div>
                                {tx.storeId && (
                                    <div className="mb-4 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl inline-flex items-center gap-2">
                                        <StoreIcon />
                                        <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-tighter">المتجر: {stores.find(s => s.id === tx.storeId)?.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-4 border-t dark:border-gray-700">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">المبلغ</p>
                                        <p className={`text-2xl font-black font-mono leading-none ${tx.type === CompanyTxType.Income ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === CompanyTxType.Income ? '+' : '-'}{tx.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setTxToEdit(tx)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-500 dark:text-gray-300 active:scale-90 transition-transform"><EditIcon /></button>
                                        <button onClick={() => setTxToDeleteId(tx.id)} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl text-red-600 active:scale-90 transition-transform"><TrashIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sortedTransactions.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-gray-800">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-200 mb-4 border-2 border-dashed">
                                 <ChartPieIcon />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest italic">لا توجد حركات مالية مسجلة بعد.</h3>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'detailed_pnl' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border dark:border-gray-700 overflow-hidden">
                        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 flex items-center gap-3">
                            <ChartPieIcon />
                            <h2 className="text-2xl font-black">بيان الدخل والتحصيل</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center py-4 border-b dark:border-gray-700">
                                <div>
                                    <p className="font-black text-gray-800 dark:text-white">إجمالي الحصص المحصلة</p>
                                    <p className="text-xs text-gray-400 font-bold">صافي عمولات المتاجر الشريكة + كامل ربح متجر LibyPort + نسبة الـ 5% من La Perla</p>
                                </div>
                                <p className="text-2xl font-black text-green-600">+{companyStats.totalShare.toLocaleString()} <span className="text-xs font-normal opacity-60">د.ل</span></p>
                            </div>

                            <div className="flex justify-between items-center py-4 border-b dark:border-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 md:p-2 bg-purple-50 text-purple-600 rounded-lg scale-90 md:scale-100"><SpeakerIcon /></div>
                                    <div>
                                        <p className="font-black text-sm md:text-base text-gray-800 dark:text-white">مصاريف الإعلانات والتسويق</p>
                                        <p className="text-[10px] md:text-xs text-gray-400 font-bold">إجمالي ما تم صرفه على الحملات الممولة</p>
                                    </div>
                                </div>
                                <p className="text-xl md:text-2xl font-black text-red-500">-{companyStats.marketing.toLocaleString()} <span className="text-[10px] md:text-xs font-normal opacity-60">د.ل</span></p>
                            </div>

                            <div className="flex justify-between items-center py-4 border-b dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 md:p-2 bg-orange-50 text-orange-600 rounded-lg scale-90 md:scale-100">⚙️</div>
                                    <div>
                                        <p className="font-black text-sm md:text-base text-gray-800 dark:text-white">مصاريف تشغيلية أخرى</p>
                                        <p className="text-[10px] md:text-xs text-gray-400 font-bold">رواتب، إيجارات، لوجستيات، نثريات</p>
                                    </div>
                                </div>
                                <p className="text-xl md:text-2xl font-black text-red-500">-{companyStats.operational.toLocaleString()} <span className="text-[10px] md:text-xs font-normal opacity-60">د.ل</span></p>
                            </div>

                            <div className="mt-8 p-8 bg-gray-900 rounded-[2rem] flex justify-between items-center shadow-2xl">
                                <div>
                                    <p className="text-yellow-500 font-black text-sm uppercase tracking-[0.2em] mb-1">الربح الفعلي الصافي</p>
                                    <p className="text-xs text-gray-400 font-medium">بعد كافة الاستقطاعات والمصاريف</p>
                                </div>
                                <p className="text-4xl font-black text-white">{companyStats.netProfit.toLocaleString()} <span className="text-lg font-normal opacity-50">د.ل</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="h-24"></div>
        </div>
    );
};

export default CompanyFinancialsPage;
