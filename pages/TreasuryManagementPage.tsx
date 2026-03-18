import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { TreasuryType, UserRole, CompanyTxType, PaymentStatus, CurrencyType, BankAccount, DeliveryCompany, Order, User, CompanyTransaction, PaymentMethod, FinancialTransaction, TransactionType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

// Icons
const WalletIcon = ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const BankIcon = ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const TruckIcon = ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const TransferIcon = ({ className }: { className?: string }) => <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const PlusIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon = ({ className }: { className?: string }) => <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CurrencyIcon = ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const EditIcon = ({ className }: { className?: string }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

const TreasurySelection: React.FC<{
    treasuries: any[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onSelect: (type: TreasuryType, id: string) => void;
    selectedType: TreasuryType;
    selectedId: string;
}> = ({ treasuries, banks, deliveryCompanies, onSelect, selectedType, selectedId }) => {
    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mr-2">توجيه القيمة إلى الخزينة:</label>
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => onSelect(TreasuryType.Cash, '')} className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedType === TreasuryType.Cash ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-700'}`}>💰 نقداً</button>
                <button type="button" onClick={() => onSelect(TreasuryType.Bank, '')} className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedType === TreasuryType.Bank ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-700'}`}>🏦 مصرف</button>
                <button type="button" onClick={() => onSelect(TreasuryType.DeliveryCompany, deliveryCompanies[0]?.id || '')} className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedType === TreasuryType.DeliveryCompany ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-700'}`}>🚚 شركة توصيل</button>
            </div>
            {selectedType === TreasuryType.Cash && (
                <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-gray-500 mb-1 mr-2">الخزينة المستلمة:</label>
                    <select value={selectedId} onChange={e => onSelect(TreasuryType.Cash, e.target.value)} className="w-full p-4 border rounded-xl dark:bg-gray-700 font-bold text-sm">
                        <option value="">-- اختر الخزينة --</option>
                        {treasuries.filter(t => t.type === TreasuryType.Cash).map(t => <option key={`cash-opt-${t.id}`} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            )}
            {selectedType === TreasuryType.Bank && (
                <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-gray-500 mb-1 mr-2">المصرف المستلم:</label>
                    <select value={selectedId} onChange={e => onSelect(TreasuryType.Bank, e.target.value)} className="w-full p-4 border rounded-xl dark:bg-gray-700 font-bold text-sm">
                        <option value="">-- اختر المصرف --</option>
                        {banks.map(b => <option key={`bank-opt-${b.id}`} value={String(b.id)}>{b.bankName} - {b.accountNumber}</option>)}
                        {treasuries.filter(t => t.type === TreasuryType.Bank).map(t => <option key={`tr-opt-${t.id}`} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            )}
            {selectedType === TreasuryType.DeliveryCompany && (
                <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-gray-500 mb-1 mr-2">شركة التوصيل:</label>
                    <select value={selectedId} onChange={e => onSelect(TreasuryType.DeliveryCompany, e.target.value)} className="w-full p-4 border rounded-xl dark:bg-gray-700 font-bold text-sm">
                        {deliveryCompanies.length > 0 ? deliveryCompanies.map(co => (
                            <option key={`delivery-opt-${co.id}`} value={co.id}>{co.name}</option>
                        )) : <option value="">لا توجد شركات مسجلة</option>}
                    </select>
                </div>
            )}
        </div>
    );
};

const CorrectionModal: React.FC<{
    order: Order;
    treasuries: any[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onClose: () => void;
    onSave: (updates: Partial<Order>) => Promise<void>;
}> = ({ order, treasuries, banks, deliveryCompanies, onClose, onSave }) => {
    const [amount, setAmount] = useState(String(order.deposit || 0));
    const [commission, setCommission] = useState(String(order.depositCommission || 0));
    const [selectedType, setSelectedType] = useState<TreasuryType>(order.collectedToTreasury || TreasuryType.Cash);
    const [selectedId, setSelectedId] = useState(order.collectionTreasuryId || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const updates: Partial<Order> = {
            collectedToTreasury: selectedType,
            collectionTreasuryId: selectedId,
            deposit: Number(amount),
            depositCommission: Number(commission)
        };
        await onSave(updates);
        setIsSaving(false);
        onClose();
    };

    const netValue = Math.max(0, Number(amount) - Number(commission));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-fade-in-up border dark:border-gray-700 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">تصحيح مبالغ التحصيل</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><PlusIcon className="rotate-45" /></button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">الطلب #{order.id} - العميل: {order.customerName}</p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">المبلغ المدفوع (د.ل)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-black text-xl text-center" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-red-400 uppercase tracking-widest mb-1 mr-2">العمولة المخصومة</label>
                            <input type="number" value={commission} onChange={e => setCommission(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-red-100 rounded-xl font-black text-xl text-center text-red-500" />
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border-2 border-green-500 text-center">
                        <label className="block text-xs font-black text-green-700 uppercase mb-1">الصافي المودع في الخزينة</label>
                        <p className="font-black text-4xl text-green-600">{netValue.toLocaleString()} د.ل</p>
                    </div>

                    <TreasurySelection treasuries={treasuries} banks={banks} deliveryCompanies={deliveryCompanies} selectedType={selectedType} selectedId={selectedId} onSelect={(t, id) => { setSelectedType(t); setSelectedId(id); }} />
                </div>

                <div className="flex gap-4 mt-10">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-2 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl">حفظ وتصحيح الرصيد</button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmModal: React.FC<{ 
    transaction: any; 
    onClose: () => void; 
    onConfirm: (id: string) => Promise<void> 
}> = ({ transaction, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm(transaction.id);
        setIsDeleting(false);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[500] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border dark:border-gray-700 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-gray-700 shadow-lg">
                    <TrashIcon />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تأكيد حذف الحركة</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-bold">هل أنت متأكد من حذف حركة "{transaction.beneficiary}"؟ سيتم تحديث رصيد العهدة فوراً.</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all">تراجع</button>
                    <button onClick={handleConfirm} disabled={isDeleting} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all">
                        {isDeleting ? 'جاري الحذف...' : 'نعم، حذف'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TreasuryManagementPage: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const { showToast } = useNotification();
    const { 
        users, bankAccounts, orders, companyTransactions, systemSettings, 
        addCompanyTransaction, deleteCompanyTransaction, currentUser, 
        currencyBalances, updateOrder, treasuries, treasuryBalances, financialTransactions,
        addFinancialTransaction
    } = useAppContext();

    const [selectedTreasuryId, setSelectedTreasuryId] = useState<string>('all');
    const [filterType, setFilterType] = useState<TreasuryType | 'all'>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [correctionOrder, setCorrectionOrder] = useState<Order | null>(null);
    const [txToDelete, setTxToDelete] = useState<any | null>(null);
    
    const [transferFrom, setTransferFrom] = useState(''); 
    const [transferTo, setTransferTo] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [visibleCount, setVisibleCount] = useState(20);

    const admins = useMemo(() => users.filter(u => u.role === UserRole.Admin || u.role === UserRole.SuperAdmin), [users]);
    const deliveryCos = systemSettings.deliveryCompanies || [];

    const normalizeType = (type: any) => {
        if (!type) return null;
        if (type === 'Cash' || type === 'cash' || type === TreasuryType.Cash) return TreasuryType.Cash;
        if (type === 'Bank' || type === 'bank' || type === TreasuryType.Bank) return TreasuryType.Bank;
        if (type === 'DeliveryCompany' || type === 'delivery' || type === TreasuryType.DeliveryCompany) return TreasuryType.DeliveryCompany;
        return type;
    };

    const detailedEntries = useMemo(() => {
        const entries: any[] = [];
        
        // Pre-group orders and transactions for faster lookup in detailed entries too
        const ordersByTreasury = new Map<string, Order[]>();
        const ordersByDepositTreasury = new Map<string, Order[]>();
        orders.forEach(o => {
            if (o.isDeleted) return;
            const colId = String(o.collectionTreasuryId);
            if (!ordersByTreasury.has(colId)) ordersByTreasury.set(colId, []);
            ordersByTreasury.get(colId)!.push(o);
            const depId = o.depositTreasuryId ? String(o.depositTreasuryId) : null;
            if (depId) {
                if (!ordersByDepositTreasury.has(depId)) ordersByDepositTreasury.set(depId, []);
                ordersByDepositTreasury.get(depId)!.push(o);
            }
        });

        const txByTreasury = new Map<string, CompanyTransaction[]>();
        companyTransactions.forEach(tx => {
            if (tx.type === CompanyTxType.SaleCollection) return;
            const toId = String(tx.toTreasuryId);
            const fromId = String(tx.fromTreasuryId);
            const trId = String(tx.treasuryId);
            if (tx.toTreasuryId) {
                if (!txByTreasury.has(toId)) txByTreasury.set(toId, []);
                txByTreasury.get(toId)!.push(tx);
            }
            if (tx.fromTreasuryId) {
                if (!txByTreasury.has(fromId)) txByTreasury.set(fromId, []);
                txByTreasury.get(fromId)!.push(tx);
            }
            if (tx.treasuryId) {
                if (!txByTreasury.has(trId)) txByTreasury.set(trId, []);
                txByTreasury.get(trId)!.push(tx);
            }
        });

        const financialTxsByTreasury = new Map<string, FinancialTransaction[]>();
        financialTransactions.forEach(tx => {
            const trId = String(tx.treasuryId);
            if (tx.treasuryId) {
                if (!financialTxsByTreasury.has(trId)) financialTxsByTreasury.set(trId, []);
                financialTxsByTreasury.get(trId)!.push(tx);
            }
        });

        treasuryBalances.forEach(treasury => {
            const nSelectedType = normalizeType(treasury.type);
            const legacyId = treasury.userId || (treasury.bankId ? String(treasury.bankId) : null);

            const possibleIds = Array.from(new Set([String(treasury.id), legacyId].filter(Boolean) as string[]));

            possibleIds.forEach(id => {
                (ordersByTreasury.get(id) || []).forEach(o => {
                    const isFinalMatch = (String(o.collectionTreasuryId) === String(treasury.id)) || 
                        (legacyId && String(o.collectionTreasuryId) === String(legacyId) && (
                            normalizeType(o.collectedToTreasury) === nSelectedType || 
                            (!o.collectedToTreasury && (
                                (nSelectedType === TreasuryType.Cash && o.paymentMethod === PaymentMethod.Cash) ||
                                (nSelectedType === TreasuryType.Bank && (o.paymentMethod === PaymentMethod.BankTransfer || o.paymentMethod === PaymentMethod.BankCard || o.paymentMethod === PaymentMethod.OnlinePayment))
                            ))
                        ));
                    if (o.isPaymentConfirmed && isFinalMatch) {
                        const amount = Number(o.total) - (Number(o.deposit) || 0);
                        if (amount > 0) {
                            entries.push({ 
                                id: `${o.id}-final-${treasury.id}`, 
                                refId: o.id, 
                                date: o.date, 
                                beneficiary: o.customerName, 
                                amount, 
                                type: 'ORDER', 
                                label: o.deposit ? 'تحصيل المتبقي' : 'تحصيل كامل', 
                                isOrder: true, 
                                orderObj: o, 
                                treasuryName: treasury.name, 
                                treasuryId: treasury.id, 
                                treasuryType: treasury.type,
                                detail: `تسليم في: ${o.city || 'غير محدد'}${o.collectedToTreasury === TreasuryType.DeliveryCompany ? ` (عبر: ${deliveryCos.find(c => c.id === o.collectionTreasuryId)?.name || 'شركة توصيل'})` : ''}`
                            });
                        }
                    }
                });

                (ordersByDepositTreasury.get(id) || []).forEach(o => {
                    const dId = o.depositTreasuryId;
                    const isDepositMatch = (String(dId) === String(treasury.id)) || 
                        (legacyId && String(dId) === String(legacyId) && (
                            normalizeType(o.depositTreasuryType) === nSelectedType || 
                            (!o.depositTreasuryType && (
                                (nSelectedType === TreasuryType.Cash && o.paymentMethod === PaymentMethod.Cash) ||
                                (nSelectedType === TreasuryType.Bank && (o.paymentMethod === PaymentMethod.BankTransfer || o.paymentMethod === PaymentMethod.BankCard || o.paymentMethod === PaymentMethod.OnlinePayment))
                            ))
                        ));
                    if (o.isDepositPaid && isDepositMatch) {
                        const amount = (Number(o.deposit) || 0) - (Number(o.depositCommission) || 0);
                        if (amount > 0) entries.push({ id: `${o.id}-deposit-${treasury.id}`, refId: o.id, date: o.date, beneficiary: o.customerName, amount, type: 'ORDER', label: `عربون (ع: ${o.depositCommission || 0})`, isOrder: true, orderObj: o, treasuryName: treasury.name, treasuryId: treasury.id, treasuryType: treasury.type });
                    }
                });

                (txByTreasury.get(id) || []).forEach(tx => {
                    const isIncoming = (tx.toTreasuryId === treasury.id || (legacyId && tx.toTreasuryId === String(legacyId) && normalizeType(tx.toTreasury) === nSelectedType)) || 
                                       (tx.treasuryId === treasury.id && ((tx.type as string) === CompanyTxType.Income || (tx.type as string) === TransactionType.Collection || (tx.type as string) === TransactionType.SubscriptionFee));
                    const isOutgoing = (tx.fromTreasuryId === treasury.id || (legacyId && tx.fromTreasuryId === String(legacyId) && normalizeType(tx.fromTreasury) === nSelectedType)) || 
                                       (tx.treasuryId === treasury.id && ((tx.type as string) === CompanyTxType.Expense || (tx.type as string) === CompanyTxType.Purchase || (tx.type as string) === CompanyTxType.DebtPayment || (tx.type as string) === CompanyTxType.StoreDeduction || (tx.type as string) === TransactionType.Payment || (tx.type as string) === TransactionType.Withdrawal));
                    
                    if (isIncoming || isOutgoing) {
                        entries.push({ 
                            id: `${tx.id}-${treasury.id}`, 
                            refId: 'Transfer', 
                            date: tx.date || new Date().toISOString(), 
                            beneficiary: tx.beneficiary, 
                            amount: isIncoming ? Number(tx.amount) : -Number(tx.amount), 
                            type: isIncoming ? 'INCOMING' : 'OUTGOING', 
                            label: tx.type === CompanyTxType.TreasuryTransfer ? 'تحويل عهدة' : tx.type, 
                            isOrder: false, 
                            treasuryName: treasury.name, 
                            treasuryId: treasury.id, 
                            treasuryType: treasury.type, 
                            txObj: tx 
                        });
                    }
                });

                (financialTxsByTreasury.get(id) || []).forEach(tx => {
                    const isMatch = ((String(tx.treasuryId) === String(treasury.id)) || 
                        (legacyId && String(tx.treasuryId) === String(legacyId))) &&
                        (!tx.treasuryType || normalizeType(tx.treasuryType) === nSelectedType);
                    if (isMatch) {
                        const isIncoming = tx.type === TransactionType.Collection || tx.type === TransactionType.SubscriptionFee;
                        entries.push({ 
                            id: `fin-${tx.id}-${treasury.id}`, 
                            refId: 'Financial', 
                            date: tx.date, 
                            beneficiary: users.find(u => u.id === tx.userId)?.name || 'مستخدم', 
                            amount: isIncoming ? Number(tx.amount) : -Number(tx.amount), 
                            type: isIncoming ? 'INCOMING' : 'OUTGOING', 
                            label: tx.type, 
                            isOrder: false, 
                            treasuryName: treasury.name, 
                            treasuryId: treasury.id, 
                            treasuryType: treasury.type, 
                            txObj: tx 
                        });
                    }
                });
            });
        });

        // Apply Filters
        return entries
            .filter(e => {
                const matchesTreasury = selectedTreasuryId === 'all' || e.treasuryId === selectedTreasuryId;
                const matchesType = filterType === 'all' || e.treasuryType === filterType;
                const matchesDate = (!dateRange.start || e.date >= dateRange.start) && (!dateRange.end || e.date <= dateRange.end);
                return matchesTreasury && matchesType && matchesDate;
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [treasuryBalances, orders, companyTransactions, financialTransactions, treasuries, admins, selectedTreasuryId, filterType, dateRange]);

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(20);
    }, [selectedTreasuryId, filterType, dateRange]);

    const paginatedEntries = useMemo(() => {
        return detailedEntries.slice(0, visibleCount);
    }, [detailedEntries, visibleCount]);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && visibleCount < detailedEntries.length) {
                setVisibleCount(prev => prev + 20);
            }
        }, { threshold: 0.1 });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [detailedEntries.length, visibleCount]);

    const handleTransfer = async () => {
        if (!transferFrom || !transferTo || !transferAmount) {
            showToast('الرجاء تعبئة كافة الحقول', 'error');
            return;
        }
        const [fType, fId] = transferFrom.split('|');
        const [tType, tId] = transferTo.split('|');
        const amount = Number(transferAmount);

        const fromObj = treasuryBalances.find(b => String(b.type) === fType && String(b.id) === fId);
        const toObj = treasuryBalances.find(b => String(b.type) === tType && String(b.id) === tId);

        await addCompanyTransaction({
            type: CompanyTxType.TreasuryTransfer,
            amount,
            beneficiary: `من: ${fromObj?.name} إلى: ${toObj?.name}`,
            description: `تحويل داخلي / تصفية عهدة`,
            paymentStatus: PaymentStatus.Paid,
            fromTreasury: fType as TreasuryType,
            fromTreasuryId: fId,
            toTreasury: tType as TreasuryType,
            toTreasuryId: tId,
            processedBy: currentUser?.id,
            date: new Date().toISOString()
        });

        setIsTransferModalOpen(false);
        setTransferAmount('');
    };

    const formatDateSafe = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "غير محدد";
        return d.toLocaleDateString('ar-LY');
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {correctionOrder && <CorrectionModal order={correctionOrder} treasuries={treasuryBalances} banks={bankAccounts} deliveryCompanies={deliveryCos} onClose={() => setCorrectionOrder(null)} onSave={async (up) => await updateOrder(correctionOrder.id, up)} />}
            {txToDelete && <DeleteConfirmModal transaction={txToDelete} onClose={() => setTxToDelete(null)} onConfirm={async (id) => await deleteCompanyTransaction(id)} />}
            
            {isTransferModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4" dir="rtl">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-fade-in-up border dark:border-gray-700">
                        <h2 className="text-2xl font-black mb-8">سحب وإيداع (تحويل مالي)</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 mr-2">من حساب (سحب)</label>
                                <select value={transferFrom} onChange={e => setTransferFrom(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold">
                                    <option value="">-- اختر المصدر --</option>
                                    {treasuryBalances.map(b => (
                                        <option key={`f-${b.type}-${b.id}`} value={`${b.type}|${b.id}`}>
                                            {b.name} {b.accountNumber ? `- ${b.accountNumber}` : ''} - رصيد: {b.balance.toLocaleString()} {b.currency || 'LYD'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 mr-2">إلى حساب (إيداع)</label>
                                <select value={transferTo} onChange={e => setTransferTo(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold">
                                    <option value="">-- اختر الوجهة --</option>
                                    {treasuryBalances.map(b => (
                                        <option key={`t-${b.type}-${b.id}`} value={`${b.type}|${b.id}`}>
                                            {b.name} {b.accountNumber ? `- ${b.accountNumber}` : ''} - رصيد: {b.balance.toLocaleString()} {b.currency || 'LYD'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 mr-2">المبلغ المراد تحويله</label>
                                <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-2xl text-center" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                            <button onClick={handleTransfer} className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl">تأكيد التحويل</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <div className="animate-fade-in-up flex-1">
                    <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">إدارة الخزائن والعهد</h1>
                    <p className="hidden md:block text-gray-500 mt-2 font-bold text-lg">الرقابة المالية على كافة الحسابات، شركات التوصيل، والعملات.</p>
                </div>
                <button onClick={() => setIsTransferModalOpen(true)} className="w-full md:w-auto bg-yellow-500 text-white px-3 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center justify-center gap-1.5 text-xs md:text-base whitespace-nowrap">
                    <TransferIcon /> سحب وإيداع (تصفية)
                </button>
            </div>

            {/* Foreign Currency Vaults */}
            <h2 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2 border-r-4 border-yellow-500 pr-3">خزائن العملات الأجنبية (Vaults)</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {[
                    { id: 'USD', name: 'محفظة الدولار', bal: currencyBalances[CurrencyType.USD], cur: 'USD' },
                    { id: 'EUR', name: 'محفظة اليورو', bal: currencyBalances[CurrencyType.EUR], cur: 'EUR' },
                    { id: 'AED', name: 'محفظة الدرهم', bal: currencyBalances[CurrencyType.AED], cur: 'AED' },
                    { id: 'SAR', name: 'محفظة الريال', bal: currencyBalances[CurrencyType.SAR], cur: 'SAR' }
                ].map(v => (
                    <div key={v.id} onClick={() => navigate('/currencies')} className="p-4 rounded-2xl bg-gray-900 text-white shadow-lg border border-gray-800 transition-all cursor-pointer hover:border-yellow-500 group">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-1.5 rounded-lg bg-white/10 text-yellow-500 scale-90"><CurrencyIcon /></div>
                            <span className="text-[10px] font-bold opacity-40">{v.cur}</span>
                        </div>
                        <h3 className="text-[10px] md:text-xs font-black truncate opacity-70">{v.name}</h3>
                        <div className="mt-1 pt-1 border-t border-white/5">
                             <p className="text-sm md:text-lg font-black font-mono">{v.bal.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Treasury Summary Icons */}
            <h2 className="text-lg md:text-2xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3 border-r-4 border-green-500 pr-3 md:pr-4">أرصدة الخزائن والعهد (LYD)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
                <div 
                    onClick={() => { setSelectedTreasuryId('all'); setFilterType('all'); }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedTreasuryId === 'all' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-yellow-200'}`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-lg"><TransferIcon /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase">الإجمالي</span>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-800 dark:text-white truncate">كافة الخزائن</h3>
                        <p className="text-lg font-black font-mono text-gray-900 dark:text-white">
                            {treasuryBalances.filter(t => !t.currency || t.currency === 'LYD').reduce((s, t) => s + t.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                {treasuryBalances.filter(t => (!t.currency || t.currency === 'LYD')).map(t => (
                    <div 
                        key={`sum-${t.type}-${t.id}`} 
                        onClick={() => setSelectedTreasuryId(t.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedTreasuryId === t.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-yellow-200'}`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${t.type === TreasuryType.Bank ? 'bg-blue-100 text-blue-600' : t.type === TreasuryType.Cash ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                {t.type === TreasuryType.Bank ? <BankIcon /> : t.type === TreasuryType.Cash ? <WalletIcon /> : <TruckIcon />}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                {t.type === TreasuryType.Bank ? 'مصرف' : t.type === TreasuryType.Cash ? 'عهدة' : 'شركة'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-gray-800 dark:text-white truncate">{t.name}</h3>
                            <p className="text-lg font-black font-mono text-gray-900 dark:text-white">{t.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Account Statement Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden border dark:border-gray-700 animate-fade-in-up mb-12 md:mb-20">
                <div className="p-6 md:p-10 border-b dark:border-gray-700 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white">كشف الحساب الموحد</h2>
                            <p className="text-gray-500 font-bold text-sm mt-1">عرض كافة الحركات المالية لجميع الخزائن والعهد</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <button onClick={() => setIsAddTxModalOpen(true)} className="p-3 bg-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2">
                                <PlusIcon />
                                <span>حركة يدوية</span>
                            </button>
                            <select 
                                value={selectedTreasuryId} 
                                onChange={e => setSelectedTreasuryId(e.target.value)}
                                className="p-3 bg-white dark:bg-gray-700 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-yellow-500 outline-none min-w-[140px]"
                            >
                                <option value="all">جميع الخزائن</option>
                                {treasuryBalances.map(t => <option key={`opt-${t.type}-${t.id}`} value={t.id}>{t.name}</option>)}
                            </select>

                            <select 
                                value={filterType} 
                                onChange={e => setFilterType(e.target.value as any)}
                                className="p-3 bg-white dark:bg-gray-700 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-yellow-500 outline-none min-w-[140px]"
                            >
                                <option value="all">جميع الأنواع</option>
                                <option value={TreasuryType.Cash}>عهد نقدية</option>
                                <option value={TreasuryType.Bank}>حسابات مصرفية</option>
                                <option value={TreasuryType.DeliveryCompany}>شركات توصيل</option>
                            </select>

                            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border rounded-xl p-1">
                                <input 
                                    type="date" 
                                    value={dateRange.start} 
                                    onChange={e => setDateRange({...dateRange, start: e.target.value})}
                                    className="bg-transparent border-none text-[10px] font-bold outline-none"
                                />
                                <span className="text-gray-300">|</span>
                                <input 
                                    type="date" 
                                    value={dateRange.end} 
                                    onChange={e => setDateRange({...dateRange, end: e.target.value})}
                                    className="bg-transparent border-none text-[10px] font-bold outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-base text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black text-[8px] md:text-xs uppercase tracking-widest border-b">
                            <tr>
                                <th className="px-4 md:px-8 py-4 md:py-6">رقم الفاتورة</th>
                                <th className="px-4 md:px-8 py-4 md:py-6">الجهة / الزبون</th>
                                <th className="px-4 md:px-8 py-4 md:py-6">تاريخ التحصيل</th>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-center">القيمة المودعة</th>
                                <th className="px-4 md:px-8 py-4 md:py-6">التفاصيل</th>
                                <th className="px-4 md:px-8 py-4 md:py-6">الخزينة</th>
                                <th className="px-4 md:px-8 py-4 md:py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {paginatedEntries.map(entry => (
                                <tr 
                                    key={entry.id} 
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${entry.isOrder ? 'cursor-pointer' : ''}`} 
                                    onClick={() => entry.isOrder && setCorrectionOrder(entry.orderObj)}
                                >
                                    <td className="px-4 md:px-8 py-4 md:py-5 font-mono font-black text-yellow-600 text-xs md:text-base whitespace-nowrap">
                                        {entry.refId === 'Transfer' ? '---' : `#${entry.refId}`}
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5">
                                        <p className="font-black text-gray-800 dark:text-white text-xs md:text-base truncate max-w-[120px] md:max-w-none">{entry.beneficiary}</p>
                                        {entry.detail && <p className="text-[9px] text-gray-400 font-bold mt-0.5">{entry.detail}</p>}
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5 opacity-60 text-xs md:text-sm font-bold">
                                        {formatDateSafe(entry.date)}
                                    </td>
                                    <td className={`px-4 md:px-8 py-4 md:py-5 text-center font-black text-sm md:text-xl ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.amount >= 0 ? '+' : ''}{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5">
                                        <span className={`text-[9px] md:text-[10px] font-black uppercase px-3 py-1 rounded-lg border shadow-sm ${
                                            entry.isOrder ? 'bg-white dark:bg-gray-800 border-gray-100' : 'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}>
                                            {entry.label}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${entry.treasuryType === TreasuryType.Bank ? 'bg-blue-500' : entry.treasuryType === TreasuryType.Cash ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                                            <span className="text-[10px] md:text-xs font-black text-gray-600 dark:text-gray-300">{entry.treasuryName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5 text-left">
                                        <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {entry.isOrder ? (
                                                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                                    <EditIcon />
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setTxToDelete(entry.txObj); }} 
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 shadow-sm"
                                                    title="حذف الحركة"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sentinel for Infinite Scroll */}
                {visibleCount < detailedEntries.length && (
                    <div ref={loadMoreRef} className="py-8 flex justify-center items-center gap-3 text-gray-400">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black uppercase tracking-widest">جاري تحميل المزيد...</span>
                    </div>
                )}
                
                {detailedEntries.length === 0 && (
                    <div className="py-10 md:py-20 text-center flex flex-col items-center bg-white dark:bg-gray-800">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-200 mb-4 border-2 border-dashed"><WalletIcon /></div>
                        <h3 className="text-sm md:text-xl font-black text-gray-400 uppercase tracking-widest italic">لا توجد عمليات مسجلة</h3>
                    </div>
                )}
            </div>

            <div className="h-20"></div>
            
            <div className="h-20"></div>
        </div>
    );
};

const AddManualTransactionModal: React.FC<{
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    treasuries: any[];
    bankAccounts: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
}> = ({ onClose, onSave, treasuries, bankAccounts, deliveryCompanies }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.Collection);
    const [amount, setAmount] = useState('');
    const [beneficiary, setBeneficiary] = useState('');
    const [description, setDescription] = useState('');
    const [treasuryType, setTreasuryType] = useState<TreasuryType>(TreasuryType.Cash);
    const [treasuryId, setTreasuryId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !beneficiary || !description || !treasuryId) return;
        
        setIsSaving(true);
        await onSave({
            type,
            amount: Number(amount),
            beneficiary,
            description,
            treasuryType,
            treasuryId,
            date: new Date().toISOString(),
        });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[500] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-black mb-6">تسجيل حركة مالية يدوية</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">نوع الحركة</label>
                            <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold">
                                <option value={TransactionType.Collection}>تحصيل (دخل +)</option>
                                <option value={TransactionType.Payment}>دفع (خارج -)</option>
                                <option value={TransactionType.Withdrawal}>سحب (خارج -)</option>
                                <option value={TransactionType.SubscriptionFee}>رسوم اشتراك (دخل +)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">المبلغ (د.ل)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-black text-lg" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">المستفيد</label>
                            <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold" required />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">البيان</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold" required />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">الخزينة المتأثرة</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => { setTreasuryType(TreasuryType.Cash); setTreasuryId(''); }} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${treasuryType === TreasuryType.Cash ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>💰 نقداً</button>
                            <button type="button" onClick={() => { setTreasuryType(TreasuryType.Bank); setTreasuryId(''); }} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${treasuryType === TreasuryType.Bank ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>🏦 مصرف</button>
                            <button type="button" onClick={() => { setTreasuryType(TreasuryType.DeliveryCompany); setTreasuryId(deliveryCompanies[0]?.id || ''); }} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${treasuryType === TreasuryType.DeliveryCompany ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>🚚 توصيل</button>
                        </div>

                        {treasuryType === TreasuryType.Cash && (
                            <select value={treasuryId} onChange={e => setTreasuryId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm">
                                <option value="">-- اختر الخزينة --</option>
                                {treasuries.filter(t => t.type === TreasuryType.Cash || t.type === 'cash').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}

                        {treasuryType === TreasuryType.Bank && (
                            <select value={treasuryId} onChange={e => setTreasuryId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm">
                                <option value="">-- اختر الحساب البنكي --</option>
                                {bankAccounts.map(b => <option key={b.id} value={String(b.id)}>{b.bankName} - {b.accountNumber}</option>)}
                                {treasuries.filter(t => t.type === TreasuryType.Bank || t.type === 'bank').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}

                        {treasuryType === TreasuryType.DeliveryCompany && (
                            <select value={treasuryId} onChange={e => setTreasuryId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm">
                                <option value="">-- اختر شركة التوصيل --</option>
                                {deliveryCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

export default TreasuryManagementPage;

