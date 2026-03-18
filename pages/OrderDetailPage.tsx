
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { Product, ProductCategory, UserRole, OrderItem, OrderType, PaymentMethod, Order, PurchaseTrackingStatus, DeliveryTrackingStatus, TreasuryType, User, BankAccount, DeliveryCompany, CompanyTxType, PaymentStatus } from '../types';
import { getDeliveryStatusColor } from '../utils/statusColors';
import { generateWhatsAppMessage, generateSMSMessage } from '../utils/notificationHelper';
import { compressImage } from '../utils/imageHelper';
import Breadcrumbs from '../components/Breadcrumbs';

// --- Icons ---
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l-3 3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l-1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5 a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.01" /></svg>;
const SyncIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
const NewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
const SMSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

const SpecialOrderIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 flex flex-col items-center justify-center p-2 rounded-xl border border-yellow-100 dark:border-yellow-900/30 ${className}`}>
        <img 
            src="https://up6.cc/2025/10/176278012677161.jpg" 
            alt="LibyPort" 
            className="w-8 h-8 object-contain opacity-40 mb-1" 
        />
        <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-tighter">طلب خاص</span>
    </div>
);

const TreasurySelection: React.FC<{
    admins: User[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onSelect: (type: TreasuryType, id: string) => void;
    selectedType: TreasuryType;
    selectedId: string;
}> = ({ admins, banks, deliveryCompanies, onSelect, selectedType, selectedId }) => {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">توجيه الصافي إلى:</label>
            <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => onSelect(TreasuryType.Cash, '')} className={`py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all ${selectedType === TreasuryType.Cash ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700'}`}>💰 نقداً</button>
                <button type="button" onClick={() => onSelect(TreasuryType.Bank, '')} className={`py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all ${selectedType === TreasuryType.Bank ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700'}`}>🏦 مصرف</button>
                <button type="button" onClick={() => onSelect(TreasuryType.DeliveryCompany, deliveryCompanies[0]?.id || '')} className={`py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all ${selectedType === TreasuryType.DeliveryCompany ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-transparent bg-gray-50 dark:bg-gray-700'}`}>🚚 شركة</button>
            </div>
            {selectedType === TreasuryType.Cash && (
                <div className="animate-fade-in">
                    <select value={selectedId} onChange={e => onSelect(TreasuryType.Cash, e.target.value)} className="w-full p-2 border-none bg-gray-50 dark:bg-gray-700 rounded-lg font-bold text-sm focus:ring-1 focus:ring-yellow-500">
                        <option value="">-- الموظف --</option>
                        {admins.map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
                    </select>
                </div>
            )}
            {selectedType === TreasuryType.Bank && (
                <div className="animate-fade-in">
                    <select value={selectedId} onChange={e => onSelect(TreasuryType.Bank, e.target.value)} className="w-full p-2 border-none bg-gray-50 dark:bg-gray-700 rounded-lg font-bold text-sm focus:ring-1 focus:ring-yellow-500">
                        <option value="">-- المصرف --</option>
                        {banks.map(b => <option key={b.id} value={String(b.id)}>{b.bankName} - {b.accountNumber}</option>)}
                    </select>
                </div>
            )}
            {selectedType === TreasuryType.DeliveryCompany && (
                <div className="animate-fade-in">
                    <select value={selectedId} onChange={e => onSelect(TreasuryType.DeliveryCompany, e.target.value)} className="w-full p-2 border-none bg-gray-50 dark:bg-gray-700 rounded-lg font-bold text-sm focus:ring-1 focus:ring-yellow-500">
                        {deliveryCompanies.length > 0 ? deliveryCompanies.map(co => (
                            <option key={co.id} value={co.id}>{co.name}</option>
                        )) : <option value="">لا توجد شركات</option>}
                    </select>
                </div>
            )}
        </div>
    );
};

const SuccessModal: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[500] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xs text-center transform transition-all animate-fade-in-up border dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/30 mb-6 text-green-500">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">تم بنجاح!</h2>
            <p className="text-gray-500 dark:text-gray-400 my-4 text-sm font-bold leading-relaxed">{message}</p>
            <div className="mt-8">
                <button 
                    onClick={onClose} 
                    className="w-full bg-yellow-500 text-white py-3 rounded-2xl font-black text-base shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transition-all transform active:scale-95"
                >
                    موافق
                </button>
            </div>
        </div>
    </div>
);

const ReasonModal: React.FC<{
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}> = ({ title, description, onClose, onConfirm }) => {
    const { showToast } = useNotification();
    const [reason, setReason] = useState('');
    const handleConfirm = () => {
        if (!reason.trim()) {
            showToast('يرجى ذكر السبب.', 'error');
            return;
        }
        onConfirm(reason);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[150] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl w-full max-w-xs border dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-xs">{description}</p>
                <div>
                    <label htmlFor="reason-input" className="font-black text-xs text-gray-400 uppercase tracking-widest block mb-1.5 mr-2">السبب أو الملاحظة</label>
                    <textarea id="reason-input" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm" rows={2} required placeholder="..." />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700 mt-4">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-sm">إلغاء</button>
                    <button type="button" onClick={handleConfirm} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 shadow-md text-sm">إرسال</button>
                </div>
            </div>
        </div>
    );
};

const AdminDeleteConfirmationModal: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
}> = ({ onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl w-full max-w-xs border dark:border-gray-700 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 text-red-600">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">تأكيد الحذف</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs leading-relaxed px-2">هل أنت متأكد من حذف هذه الفاتورة؟ سيتم إرجاع الكميات للمخزون.</p>
            <div className="flex justify-center gap-2">
                <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-bold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-xs">إلغاء</button>
                <button type="button" onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold hover:bg-red-700 shadow-md text-xs">نعم، احذف</button>
            </div>
        </div>
    </div>
);

const RefundConfirmationModal: React.FC<{
    order: Order;
    admins: User[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onClose: () => void;
    onConfirm: (treasuryType: TreasuryType, treasuryId: string, actualRefund: number, reason: string) => void;
}> = ({ order, admins, banks, deliveryCompanies, onClose, onConfirm }) => {
    const [selectedTreasury, setSelectedTreasury] = useState<TreasuryType>(order.collectedToTreasury || TreasuryType.Cash);
    const [selectedTreasuryId, setSelectedTreasuryId] = useState(order.collectionTreasuryId || '');
    const [actualRefund, setActualRefund] = useState(order.deposit || 0);
    const [fees, setFees] = useState(0);
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[160] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-fade-in-up border dark:border-gray-700 overflow-y-auto max-h-[90vh]">
                <h2 className="text-lg font-black text-red-600 text-center mb-1">إرجاع وإلغاء</h2>
                <p className="text-gray-500 text-center mb-4 text-xs">تأكيد الإرجاع للفاتورة #{order.id}</p>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border">
                             <label className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">المبلغ المرجّع</label>
                             <input type="number" value={actualRefund} onChange={e => setActualRefund(Number(e.target.value))} className="w-full bg-transparent font-black text-base text-red-600 outline-none" />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border">
                             <label className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">مصاريف مخصومة</label>
                             <input type="number" value={fees} onChange={e => setFees(Number(e.target.value))} className="w-full bg-transparent font-black text-base text-blue-600 outline-none" />
                        </div>
                    </div>

                    <TreasurySelection 
                        admins={admins} 
                        banks={banks} 
                        deliveryCompanies={deliveryCompanies} 
                        selectedType={selectedTreasury} 
                        selectedId={selectedTreasuryId} 
                        onSelect={(t, id) => { setSelectedTreasury(t); setSelectedTreasuryId(id); }} 
                    />
                    
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1 mr-2">سبب الإرجاع</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="..." className="w-full p-2 border rounded-xl dark:bg-gray-700 font-bold text-sm h-12" />
                    </div>
                </div>

                <div className="flex justify-center gap-2 mt-6">
                    <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs">تراجع</button>
                    <button type="button" onClick={() => onConfirm(selectedTreasury, selectedTreasuryId, actualRefund, reason)} className="flex-2 py-2 bg-red-600 text-white rounded-xl font-black shadow-lg text-xs">تأكيد الإرجاع</button>
                </div>
            </div>
        </div>
    );
};

const DepositConfirmationModal: React.FC<{
    order: Order;
    isBankTransfer: boolean;
    admins: User[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onClose: () => void;
    onConfirm: (receiptUrl: string | undefined, treasuryType: TreasuryType, treasuryId: string, actualReceived: number, commission: number) => void;
}> = ({ order, isBankTransfer, admins, banks, deliveryCompanies, onClose, onConfirm }) => {
    const { showToast } = useNotification();
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedTreasury, setSelectedTreasury] = useState<TreasuryType>(isBankTransfer ? TreasuryType.Bank : TreasuryType.Cash);
    const [selectedTreasuryId, setSelectedTreasuryId] = useState('');
    const [actualReceived, setActualReceived] = useState(order.deposit || 0);
    const [commission, setCommission] = useState(0); 
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedTreasury === TreasuryType.Cash && admins.length > 0) {
            setSelectedTreasuryId(String(admins[0].id));
        } else if (selectedTreasury === TreasuryType.Bank && banks.length > 0) {
            setSelectedTreasuryId(String(banks[0].id));
        } else if (selectedTreasury === TreasuryType.DeliveryCompany && deliveryCompanies.length > 0) {
            setSelectedTreasuryId(deliveryCompanies[0].id);
        }
    }, [selectedTreasury, admins, banks, deliveryCompanies]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const compressed = await compressImage(file);
                setReceiptImage(compressed);
            } catch (err) {
                showToast('فشل في معالجة الصورة', 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleConfirm = () => {
        if (!selectedTreasuryId && selectedTreasury !== TreasuryType.DeliveryCompany) {
            showToast('الرجاء تحديد الخزينة المستلمة', 'error');
            return;
        }
        onConfirm(receiptImage || undefined, selectedTreasury, selectedTreasuryId, actualReceived, commission);
    };

    const netToTreasury = actualReceived - commission;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] shadow-2xl w-full max-w-[320px] transform transition-all animate-fade-in-up border dark:border-gray-700 overflow-y-auto max-h-[95vh]">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-black text-gray-800 dark:text-gray-100">تأكيد استلام العربون</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl font-bold">&times;</button>
                </div>
                
                <div className="space-y-2.5">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">المبلغ المدفوع</label>
                        <input type="number" value={actualReceived} onChange={e => setActualReceived(Number(e.target.value))} className="w-full bg-transparent font-black text-lg outline-none" />
                    </div>
 
                    <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-xl border border-red-100 dark:border-red-900/30">
                         <label className="block text-[10px] font-black text-red-400 uppercase mb-0.5">عمولة مخصومة</label>
                         <input type="number" value={commission} onChange={e => setCommission(Number(e.target.value))} className="w-full bg-transparent font-black text-lg text-red-600 outline-none" />
                    </div>
 
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-xl border-2 border-green-500/30 text-center">
                        <label className="block text-[10px] font-black text-green-700 uppercase mb-0.5">الصافي المودع</label>
                        <p className="font-black text-xl text-green-600 leading-tight">{netToTreasury.toLocaleString()} <span className="text-xs">د.ل</span></p>
                    </div>

                    <TreasurySelection 
                        admins={admins} 
                        banks={banks} 
                        deliveryCompanies={deliveryCompanies}
                        selectedType={selectedTreasury} 
                        selectedId={selectedTreasuryId} 
                        onSelect={(t, id) => { setSelectedTreasury(t); setSelectedTreasuryId(id); }} 
                    />

                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-14 w-full rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white dark:bg-gray-800"
                        >
                            {receiptImage ? (
                                <img src={receiptImage} className="w-full h-full object-contain" alt="Receipt" />
                            ) : (
                                <div className="text-gray-400 text-xs flex flex-col items-center gap-0.5">
                                    <span className="font-bold">{isUploading ? 'جاري...' : 'رفع صورة الإيصال (اختياري)'}</span>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-100 py-2.5 rounded-xl font-bold text-[10px]">تراجع</button>
                    <button type="button" onClick={handleConfirm} className="flex-[2] bg-green-600 text-white py-2.5 rounded-xl font-black text-[10px] shadow-lg hover:bg-green-700 transform active:scale-95 transition-all">تأكيد الاستلام</button>
                </div>
            </div>
        </div>
    );
};

const CollectionConfirmationModal: React.FC<{
    orderId: string;
    totalAmount: number;
    admins: User[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onClose: () => void;
    onConfirm: (treasuryType: TreasuryType, treasuryId: string) => void;
}> = ({ orderId, totalAmount, admins, banks, deliveryCompanies, onClose, onConfirm }) => {
    const [selectedTreasury, setSelectedTreasury] = useState<TreasuryType>(TreasuryType.DeliveryCompany);
    const [selectedTreasuryId, setSelectedTreasuryId] = useState(deliveryCompanies[0]?.id || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl w-full max-w-xs border dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center mb-1">تحصيل القيمة النهائية</h2>
                <p className="text-gray-500 text-center mb-4 text-xs">#{orderId} | {totalAmount.toLocaleString()} د.ل</p>

                <div className="mb-6">
                    <TreasurySelection 
                        admins={admins} 
                        banks={banks} 
                        deliveryCompanies={deliveryCompanies}
                        selectedType={selectedTreasury} 
                        selectedId={selectedTreasuryId} 
                        onSelect={(t, id) => { setSelectedTreasury(t); setSelectedTreasuryId(id); }} 
                    />
                </div>

                <div className="flex justify-center gap-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs">إلغاء</button>
                    <button type="button" onClick={() => onConfirm(selectedTreasury, selectedTreasuryId)} className="flex-2 py-2 bg-green-600 text-white rounded-xl font-black shadow-lg text-xs">تحصيل وتسليم</button>
                </div>
            </div>
        </div>
    );
};

const ProductLinkModal: React.FC<{
    item: OrderItem;
    product?: Product;
    onClose: () => void;
    canSeeCost: boolean;
}> = ({ item, product, onClose, canSeeCost }) => {
    const url = item.url || product?.url;
    const image = item.image || product?.image;
    const size = item.size || product?.size || 'غير محدد';
    const cost = item.costInUSD || product?.costInUSD || 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[300] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-[2.5rem] shadow-2xl w-full max-w-[320px] animate-fade-in-up border dark:border-gray-700 relative text-center">
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-red-500 transition-all p-1.5 bg-gray-50 dark:bg-gray-700 rounded-full">&times;</button>
                
                <h2 className="text-base font-black text-gray-800 dark:text-white mb-4">تفاصيل الصنف</h2>
                
                <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-lg mb-4 relative group bg-gray-50 dark:bg-gray-900">
                        {image ? (
                            <img src={image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.name} />
                        ) : (
                            <SpecialOrderIcon />
                        )}
                    </div>

                    <div className="mb-4 px-2">
                        <p className="font-black text-gray-900 dark:text-white text-sm leading-snug">{item.name}</p>
                        {(item.sku || product?.sku) && (
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5 font-bold">SKU: {item.sku || product?.sku}</p>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border dark:border-gray-700">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">المقاس</p>
                            <p className="text-xs font-black text-gray-800 dark:text-white">{size}</p>
                        </div>
                        {canSeeCost ? (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-[8px] font-black text-blue-400 uppercase mb-0.5">سعر التكلفة</p>
                                <p className="text-xs font-black text-blue-600 dark:text-blue-400">${cost}</p>
                            </div>
                        ) : null}
                    </div>

                    {url ? (
                        <a 
                            href={url.startsWith('http') ? url : `https://${url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-center shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm transform active:scale-95 mb-2"
                        >
                            <GlobeIcon />
                            <span>فتح الرابط الأصلي</span>
                        </a>
                    ) : (
                        <div className="w-full py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-400 text-xs font-bold mb-2 border border-dashed">
                            رابط المنتج غير متوفر
                        </div>
                    )}

                    <button onClick={onClose} className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-xl text-xs">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

const ImageViewModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[300] p-4" onClick={onClose} dir="rtl">
        <button className="absolute top-8 right-8 text-white/50 hover:text-white p-3 bg-white/10 rounded-full transition-all">&times;</button>
        <img src={imageUrl} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()} />
    </div>
);

const OrderDetailPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const [searchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();
    const { orders, products, getStoreNames, currentUser, users, bankAccounts, systemSettings, requestDeletion, requestOrderUpdate, deleteOrderDirectly, updateOrder, fixStockForOrder, addFinancialTransaction, addCompanyTransaction, stores, shoppingBrands } = useAppContext();
    const { showToast, showConfirm } = useNotification();
    const [isDeletionReasonModalOpen, setIsDeletionReasonModalOpen] = useState(false);
    const [isUpdateReasonModalOpen, setIsUpdateReasonModalOpen] = useState(false);
    const [viewedItem, setViewedItem] = useState<{item: OrderItem, product?: Product} | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableOrder, setEditableOrder] = useState<Partial<Order>>({});
    const [editableItems, setEditableItems] = useState<OrderItem[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isDirectDeleteModalOpen, setIsDirectDeleteModalOpen] = useState(false);
    const [isDepositConfirmModalOpen, setIsDepositConfirmModalOpen] = useState(false);
    const [isPaymentConfirmModalOpen, setIsPaymentConfirmModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
    const [isFixingStock, setIsFixingStock] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const order = orders.find(o => String(o.id) === id);

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'confirm_deposit' && order && !order.isDepositPaid) {
            setIsDepositConfirmModalOpen(true);
        }
    }, [searchParams, order]);

    const isAdmin = !!(currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role));
    const isOwner = currentUser && order && stores.find(s => s.id === order.storeId)?.ownerId === currentUser.id;
    const canSeeCost = !!(isAdmin || isOwner);

    const isProcurementOrder = order?.orderType === OrderType.Procurement;

    const adminsOnly = useMemo(() => users.filter(u => u.role === UserRole.Admin || u.role === UserRole.SuperAdmin), [users]);
    const deliveryCompanies = systemSettings.deliveryCompanies || [];

    useEffect(() => {
        if (order) {
            setEditableOrder({
                customerName: order.customerName,
                phone1: order.phone1,
                phone2: order.phone2,
                city: order.city,
                address: order.address,
                notes: order.notes,
                discount: order.discount,
                costInUSD: order.costInUSD,
            });
            setEditableItems(order.items);
        }
    }, [order]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['discount', 'costInUSD'].includes(name);
        setEditableOrder(prev => ({ 
            ...prev, 
            [name]: isNumberField ? (value === '' ? '' : Number(value)) : value 
        }));
    };

    const handleSyncItemsWithMasterData = async () => {
        const confirmed = await showConfirm(
            'تأكيد المزامنة',
            'هل تريد تحديث بيانات الأصناف في هذه الفاتورة لتطابق البيانات الحالية في المخزن؟'
        );
        if (!confirmed) return;
        const syncedItems = editableItems.map(item => {
            const masterProduct = products.find(p => p.id === item.productId);
            if (masterProduct) {
                return {
                    ...item,
                    name: masterProduct.name,
                    price: masterProduct.price,
                    costInUSD: masterProduct.costInUSD,
                    image: masterProduct.image,
                    sku: masterProduct.sku,
                    url: masterProduct.url
                };
            }
            return item;
        });
        setEditableItems(syncedItems);
        const totalMasterCost = (syncedItems || []).reduce((sum, item) => sum + ((item.costInUSD || 0) * item.quantity), 0);
        setEditableOrder(prev => ({ ...prev, costInUSD: totalMasterCost }));
        setSuccessMessage('تمت مزامنة بيانات الفاتورة مع المخزن بنجاح.');
    };

    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow?.document.write('<html><head><title>طباعة فاتورة</title>');
            printWindow?.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
            printWindow?.document.write('<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">');
            printWindow?.document.write('<style>body { font-family: "Cairo", sans-serif; direction: rtl; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display:none !important; } }</style>');
            printWindow?.document.write('<body class="bg-gray-100"><div class="p-4 md:p-8">');
            printWindow?.document.write(printContent.innerHTML);
            printWindow?.document.write('</div></body></html>');
            printWindow?.document.close();
            printWindow?.focus();
            setTimeout(() => { printWindow?.print(); printWindow?.close(); }, 1000);
        }
    };

    const handlePrintLabel = () => {
        if (!order) return;
        const printWindow = window.open('', '', 'height=800,width=600');
        if (!printWindow) return;

        const storeName = getStoreNames([order.storeId]);
        const subtotal = (order.items || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const discountVal = order.discount || 0;
        const depositVal = order.deposit || 0;
        const finalDue = (subtotal - discountVal) - depositVal;

        const itemsHtml = order.items.map(item => {
            const productRef = products.find(p => p.id === item.productId);
            const img = item.image || productRef?.image || '';
            return `
                <div class="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                    <div class="w-10 h-10 bg-gray-50 rounded border overflow-hidden flex-shrink-0">
                        ${img ? `<img src="${img}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-1"><img src="https://up6.cc/2025/10/176278012677161.jpg" style="width:12px;height:12px;opacity:0.3;" /><span style="font-size:5px;font-weight:900;color:#ccc;margin-top:1px;">SPECIAL</span></div>`}
                    </div>
                    <div class="flex-grow min-w-0 text-right">
                        <p class="font-bold text-[11px] truncate leading-tight">${item.name}</p>
                        <p class="text-[9px] text-gray-500 font-bold">${item.price.toLocaleString()} د.ل × ${item.quantity} ${item.size ? `(${item.size})` : ''}</p>
                    </div>
                    <div class="text-left flex-shrink-0">
                        <p class="font-black text-[11px]">${(item.price * item.quantity).toLocaleString()} د.ل</p>
                    </div>
                </div>
            `;
        }).join('');

        const qrData = `Invoice: #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.phone1}\nDue: ${finalDue} LYD`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

        printWindow.document.write(`
            <html>
                <head>
                    <title>ملصق شحن #${order.id}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Cairo', sans-serif; direction: rtl; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        @page { size: 100mm 150mm; margin: 0; }
                        .label-container { width: 100mm; height: 150mm; padding: 4mm; box-sizing: border-box; display: flex; flex-direction: column; background: white; overflow: hidden; }
                        .dashed-divider { border-top: 1.5px dashed #000; margin: 6px 0; }
                    </style>
                </head>
                <body>
                    <div class="label-container">
                        <!-- Header -->
                        <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
                            <div class="text-right">
                                <h1 class="text-xl font-black uppercase leading-none tracking-tighter">LibyPort</h1>
                                <p class="text-[8px] font-bold text-gray-600">Tripoli Global Gateway</p>
                            </div>
                            <div class="text-left bg-black text-white px-2 py-1 rounded-lg">
                                <p class="text-[7px] font-bold uppercase leading-none mb-0.5">رقم الفاتورة</p>
                                <p class="text-sm font-black font-mono tracking-widest">#${order.id}</p>
                            </div>
                        </div>

                        <!-- Store Info -->
                        <div class="mb-2 text-center bg-gray-50 py-1 rounded-xl border border-gray-200">
                             <p class="text-[7px] font-black text-gray-400 uppercase tracking-widest">صادر عن متجر</p>
                             <p class="text-xs font-black text-gray-800">${storeName}</p>
                        </div>

                        <!-- Customer Info Box -->
                        <div class="bg-white p-2 rounded-xl mb-2 border-2 border-black">
                            <div class="grid grid-cols-2 gap-y-2 gap-x-2">
                                <div class="text-right">
                                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-0.5">الزبون المستلم</p>
                                    <p class="text-sm font-black leading-tight">${order.customerName}</p>
                                </div>
                                <div class="text-left">
                                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-0.5">رقم الهاتف</p>
                                    <p class="text-sm font-black font-mono leading-tight">${order.phone1}</p>
                                    ${order.phone2 ? `<p class="text-[10px] font-black font-mono leading-tight text-gray-600 mt-0.5">${order.phone2}</p>` : ''}
                                </div>
                                <div class="col-span-2 text-right pt-1 border-t border-gray-100">
                                    <p class="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-0.5">المدينة / العنوان بالتفصيل</p>
                                    <p class="text-[11px] font-bold leading-snug">${order.city} - ${order.address || 'طرابلس'}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Items List -->
                        <div class="flex-grow overflow-hidden">
                            <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-black pb-0.5 text-right">محتويات الشحنة</p>
                            <div class="space-y-1">
                                ${itemsHtml}
                            </div>
                        </div>

                        <!-- Totals & QR Section -->
                        <div class="mt-2 pt-2 border-t border-black flex items-end justify-between">
                             <div class="flex-grow space-y-0.5">
                                 <div class="flex justify-between text-[10px] font-bold text-gray-700">
                                    <span>إجمالي الأصناف:</span>
                                    <span>${subtotal.toLocaleString()} د.ل</span>
                                 </div>
                                 ${discountVal > 0 ? `<div class="flex justify-between text-[10px] font-bold text-red-600"><span>التخفيض:</span><span>-${discountVal.toLocaleString()} د.ل</span></div>` : ''}
                                 ${depositVal > 0 ? `<div class="flex justify-between text-[10px] font-bold text-green-700"><span>العربون:</span><span>-${depositVal.toLocaleString()} د.ل</span></div>` : ''}
                                 
                                 <!-- Final Collection Box -->
                                 <div class="bg-black text-white p-2 rounded-xl flex justify-between items-center mt-1">
                                    <div class="text-right">
                                        <p class="text-[8px] font-black text-yellow-400 uppercase leading-none mb-0.5">المتبقي للتحصيل:</p>
                                        <p class="text-[18px] font-black leading-none">${finalDue.toLocaleString()} <span class="text-[8px]">د.ل</span></p>
                                    </div>
                                 </div>
                             </div>
                             <div class="mr-4 flex-shrink-0">
                                 <img src="${qrUrl}" class="w-20 h-20 border border-gray-200 p-1 rounded-lg" />
                                 <p class="text-[6px] text-center font-bold text-gray-400 mt-0.5">SCAN TO VERIFY</p>
                             </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { 
                            setTimeout(() => {
                                window.print(); 
                                window.close(); 
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };
    
    const handleRequestDeletion = () => setIsDeletionReasonModalOpen(true);
    const handleConfirmDeletion = (reason: string) => {
        if (!order) return;
        requestDeletion('order', order.id, reason).then(() => {
            setIsDeletionReasonModalOpen(false);
            setSuccessMessage('تم إرسال طلب الحذف بنجاح.');
            setIsNavigating(true);
        });
    };

    const handleRequestUpdate = () => setIsUpdateReasonModalOpen(true);
    
    const gatherUpdates = () => {
        if (!order) return {};
        const updates: Partial<Order> = {};
        (Object.keys(editableOrder) as Array<keyof typeof editableOrder>).forEach(key => {
            const currentVal = (editableOrder as any)[key];
            if (currentVal !== (order as any)[key]) {
                (updates as any)[key] = currentVal === undefined ? null : currentVal;
            }
        });
        const newSubtotal = (editableItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newDiscount = Number(editableOrder.discount) || 0;
        const newTotal = newSubtotal - newDiscount;
        if (newTotal !== order.total) updates.total = newTotal;
        if (newDiscount !== (order.discount || 0)) updates.discount = newDiscount;
        if (JSON.stringify(editableItems) !== JSON.stringify(order.items)) updates.items = editableItems;
        return updates;
    };

    const handleConfirmUpdate = async (reason: string) => {
        if (!order) return;
        const updates = gatherUpdates();
        if (Object.keys(updates).length > 0) {
            setIsSaving(true);
            try {
                await requestOrderUpdate(order.id, updates, reason);
                showToast('تم إرسال طلب التعديل للمراجعة.', 'success');
            } catch (error) {
                showToast('حدث خطأ أثناء حفظ التعديلات.', 'error');
            } finally {
                setIsSaving(false);
            }
        } else showToast("لم يتم إجراء أي تغييرات.", "info");
        setIsUpdateReasonModalOpen(false);
        setIsEditing(false);
    };
    
    const handleAdminDirectSave = async () => {
        if (!order) return;
        const updates = gatherUpdates();
        if (Object.keys(updates).length > 0) {
            setIsSaving(true);
            try {
                await updateOrder(order.id, updates);
                showToast('تم تحديث الفاتورة بنجاح.', 'success');
            } catch (error) {
                showToast('حدث خطأ أثناء تحديث الفاتورة.', 'error');
            } finally {
                setIsSaving(false);
            }
        } else showToast("لم يتم إجراء أي تغييرات.", "info");
        setIsEditing(false);
    };
    
    const handleDirectDeleteClick = () => setIsDirectDeleteModalOpen(true);

    const handleConfirmDirectDelete = () => {
        if (order) {
            deleteOrderDirectly(order.id).then(() => {
                setIsDirectDeleteModalOpen(false);
                navigate(isProcurementOrder ? '/sales-invoices' : '/orders', { replace: true });
            });
        }
    };

    const handleConfirmDeposit = async (receiptUrl: string | undefined, treasuryType: TreasuryType, treasuryId: string, actualReceived: number, commission: number) => {
        if (order) {
            await updateOrder(order.id, { 
                isDepositPaid: true,
                deposit: actualReceived, 
                depositCommission: commission,
                bankTransferReceiptUrl: receiptUrl || order.bankTransferReceiptUrl || null,
                depositTreasuryType: treasuryType,
                depositTreasuryId: treasuryId
            });
            const netAmount = Math.max(0, actualReceived - commission);
            setSuccessMessage(`تم تأكيد استلام مبلغ ${actualReceived} د.ل (الصافي: ${netAmount} د.ل) بنجاح.`);
            setIsDepositConfirmModalOpen(false);
        }
    };
    
    const handleConfirmPayment = (treasuryType: TreasuryType, treasuryId: string) => {
        if (order) {
            updateOrder(order.id, { 
                isPaymentConfirmed: true,
                deliveryTrackingStatus: DeliveryTrackingStatus.Delivered,
                collectedToTreasury: treasuryType,
                collectionTreasuryId: treasuryId
            });
            setSuccessMessage(`تم تأكيد تحصيل مبلغ الفاتورة #${order.id} وتغيير حالتها إلى 'مسلمة'.`);
            setIsPaymentConfirmModalOpen(false);
        }
    };

    const handleConfirmRefund = async (treasuryType: TreasuryType, treasuryId: string, actualRefund: number, reason: string) => {
        if (!order || !order.deposit) return;
        try {
            await addCompanyTransaction({
                type: CompanyTxType.Expense,
                amount: actualRefund,
                beneficiary: order.customerName,
                description: `إرجاع عربون الفاتورة #${order.id} - السبب: ${reason}`,
                paymentStatus: PaymentStatus.Paid,
                fromTreasury: treasuryType,
                fromTreasuryId: treasuryId,
                processedBy: currentUser?.id,
                date: new Date().toISOString()
            });
            const feesTaken = (order.deposit || 0) - actualRefund;
            await updateOrder(order.id, {
                purchaseTrackingStatus: PurchaseTrackingStatus.Cancelled,
                isDepositPaid: false,
                notes: (order.notes || '') + `\n[تم إرجاع مبلغ: ${actualRefund} د.ل | رسوم مخصومة: ${feesTaken} د.ل | السبب: ${reason}]`
            });
            setSuccessMessage('تم إرجاع العربون بنجاح وإلغاء الطلبية.');
            setIsRefundModalOpen(false);
        } catch (e) { 
            showToast('فشل تنفيذ عملية الإرجاع، يرجى المحاولة لاحقاً.', 'error'); 
        }
    };
    
    const handleCancelEdit = () => {
        if (order) {
            setEditableOrder({
                customerName: order.customerName,
                phone1: order.phone1,
                phone2: order.phone2,
                city: order.city,
                address: order.address,
                notes: order.notes,
                discount: order.discount,
                costInUSD: order.costInUSD,
            });
            setEditableItems(order.items);
            setProductSearchTerm('');
        }
        setIsEditing(false);
    };

    const handleCloseSuccessModal = () => {
        setSuccessMessage(null);
        if (isNavigating) navigate(isProcurementOrder ? '/sales-invoices' : '/orders');
    };

    const handleItemQuantityChange = (productId: number, quantityStr: string) => {
        const quantity = parseInt(quantityStr, 10);
        const product = products.find(p => p.id === productId);
        if (!isProcurementOrder && product) {
             if (quantity > 0 && quantity <= product.stock) {
                setEditableItems(editableItems.map(item => item.productId === productId ? { ...item, quantity } : item));
            } else if (quantity <= 0) handleRemoveItem(productId);
            else showToast('الكمية المطلوبة أكبر من المتوفر في المخزون.', 'error');
        } else {
             if (quantity > 0) setEditableItems(editableItems.map(item => item.productId === productId ? { ...item, quantity } : item));
             else if (quantity <= 0) handleRemoveItem(productId);
        }
    };

    const handleItemPriceChange = (productId: number, priceStr: string) => {
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price >= 0) {
            setEditableItems(prev => prev.map(item => item.productId === productId ? { ...item, price } : item));
        }
    };

    const handleRemoveItem = (productId: number) => setEditableItems(editableItems.filter(item => item.productId !== productId));

    const handleAddNewProductToInvoice = (p: Product) => {
        const existing = editableItems.find(item => item.productId === p.id);
        if (existing) {
            showToast('هذا المنتج موجود بالفعل في الفاتورة.', 'error');
            return;
        }
        const newItem: OrderItem = { productId: p.id, name: p.name, price: p.price, quantity: 1, size: p.sizes?.[0]?.size || p.size || 'Standard', image: p.image, sku: p.sku, costInUSD: p.costInUSD };
        setEditableItems(prev => [...prev, newItem]);
        setProductSearchTerm('');
    };

    const handleEmergencyStockFix = async () => {
        if (!order) return;
        setIsFixingStock(true);
        const res = await fixStockForOrder(order.id);
        setIsFixingStock(false);
        if (res.success) {
            setSuccessMessage(res.message);
        } else {
            showToast(res.message, 'error');
        }
    };

    const storeProductsSearch = useMemo(() => {
        if (!order || !productSearchTerm.trim()) return [];
        return products.filter(p => p.storeId === order.storeId && !p.isDeleted && (p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())))).slice(0, 10);
    }, [products, order, productSearchTerm]);
    
    const subtotalCalc = useMemo(() => isEditing ? (editableItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0) : (order?.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0) || 0, [isEditing, editableItems, order]);
    const discountAmount = useMemo(() => isEditing ? (Number(editableOrder.discount) || 0) : (order?.discount || 0), [isEditing, editableOrder.discount, order]);
    const totalAfterDiscount = subtotalCalc - discountAmount;
    const finalTotal = totalAfterDiscount - (order?.deposit || 0);
    const inputClasses = "w-full p-2 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 outline-none placeholder-gray-500 dark:placeholder-gray-400 text-sm";
    const qrCodeUrlGen = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Invoice: #${order?.id}\nCustomer: ${order?.customerName}\nTotal: ${finalTotal.toLocaleString()} د.ل`)}`;

    if (!order) return null;

    const canRequestDelete = !isAdmin && !order.isPendingDeletion && !order.isPendingUpdate;
    const canDirectDelete = isAdmin && !order.isDeleted;
    const canEditAct = !isAdmin ? canRequestDelete : canDirectDelete;
    const showStockFixAlert = isAdmin && !order.isStockDeducted && order.purchaseTrackingStatus !== PurchaseTrackingStatus.Cancelled;

    return (
        <div className="container mx-auto" dir="rtl">
            {successMessage && <SuccessModal message={successMessage} onClose={handleCloseSuccessModal} />}
            {isDeletionReasonModalOpen && <ReasonModal title="طلب حذف الفاتورة" description="يرجى توضيح سبب رغبتك في حذف هذه الفاتورة." onClose={() => setIsDeletionReasonModalOpen(false)} onConfirm={handleConfirmDeletion} />}
            {isUpdateReasonModalOpen && <ReasonModal title="سبب تعديل الفاتورة" description="يرجى توضيح سبب تعديل بيانات الفاتورة. سيتم إرسال الطلب للمراجعة." onClose={() => setIsUpdateReasonModalOpen(false)} onConfirm={handleConfirmUpdate} />}
            {isDirectDeleteModalOpen && <AdminDeleteConfirmationModal onClose={() => setIsDirectDeleteModalOpen(false)} onConfirm={handleConfirmDirectDelete} />}
            {isDepositConfirmModalOpen && <DepositConfirmationModal order={order} isBankTransfer={order.paymentMethod === PaymentMethod.BankTransfer} admins={adminsOnly} banks={bankAccounts} deliveryCompanies={deliveryCompanies} onClose={() => setIsDepositConfirmModalOpen(false)} onConfirm={handleConfirmDeposit} />}
            {isPaymentConfirmModalOpen && <CollectionConfirmationModal orderId={order.id} totalAmount={finalTotal} admins={adminsOnly} banks={bankAccounts} deliveryCompanies={deliveryCompanies} onClose={() => setIsPaymentConfirmModalOpen(false)} onConfirm={handleConfirmPayment} />}
            {isRefundModalOpen && <RefundConfirmationModal order={order} admins={adminsOnly} banks={bankAccounts} deliveryCompanies={deliveryCompanies} onClose={() => setIsRefundModalOpen(false)} onConfirm={handleConfirmRefund} />}
            {viewedItem && <ProductLinkModal item={viewedItem.item} product={viewedItem.product} canSeeCost={canSeeCost} onClose={() => setViewedItem(null)} />}
            {viewingReceipt && <ImageViewModal imageUrl={viewingReceipt} onClose={() => setViewingReceipt(null)} />}

             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3 no-print">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <Breadcrumbs items={[
                            { label: 'لوحة التحكم', path: '/dashboard' }, 
                            { label: isProcurementOrder ? 'المبيعات الخاصة' : 'الفواتير', path: isProcurementOrder ? '/sales-invoices' : '/orders' },
                            { label: `الفاتورة #${order.id}`, path: undefined }
                        ]} />
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-100">الفاتورة #{order.id}</h1>
                            <span className={`text-[10px] font-bold uppercase tracking-tight px-3 py-1 rounded-full border shadow-sm ${getDeliveryStatusColor(order.deliveryTrackingStatus)}`}>
                                {order.deliveryTrackingStatus}
                            </span>
                        </div>
                    </div>
                    {isProcurementOrder && <span className="bg-purple-100 text-purple-800 text-xs font-black px-2 py-0.5 rounded-full dark:bg-purple-900/50 dark:text-purple-200 uppercase">خاصة</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => isEditing ? handleCancelEdit() : navigate(-1)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl font-bold hover:bg-gray-200 text-xs">{isEditing ? 'إلغاء' : 'رجوع'}</button>
                    {!isEditing && (
                       <>
                         {order.isDepositPaid && (
                            <div className="flex gap-1.5">
                                 <button onClick={() => navigate(`/orders/deposit-receipt/${order.id}`)} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black hover:bg-blue-700 shadow-sm flex items-center gap-1.5 text-xs"><PrintIcon /> إيصال العربون</button>
                                 {isAdmin && order.purchaseTrackingStatus !== PurchaseTrackingStatus.Cancelled && order.deliveryTrackingStatus !== DeliveryTrackingStatus.Delivered && (
                                    <button onClick={() => setIsRefundModalOpen(true)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl font-black hover:bg-red-600 hover:text-white border border-red-200 transition-all flex items-center gap-1.5 shadow-sm text-xs"><BackIcon /> إرجاع وإلغاء</button>
                                 )}
                            </div>
                         )}
                         {canEditAct && <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black hover:bg-blue-700 shadow-sm text-xs">تعديل</button>}
                         {canDirectDelete && <button onClick={handleDirectDeleteClick} className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black hover:bg-red-700 shadow-sm text-xs">حذف الفاتورة</button>}
                         <button onClick={handlePrintLabel} className="bg-gray-800 text-white px-3 py-1.5 rounded-xl font-black hover:bg-black shadow-sm flex items-center gap-1.5 text-xs"><TagIcon /> ملصق</button>
                         <button onClick={handlePrint} className="bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black hover:bg-yellow-600 shadow-sm text-xs">طباعة A4</button>
                       </>
                    )}
                    {isEditing && (
                        <div className="flex gap-1.5">
                            <button onClick={handleSyncItemsWithMasterData} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-black hover:bg-blue-100 flex items-center gap-1.5 border border-blue-100 text-xs"><SyncIcon /> مزامنة المخزن</button>
                            {isAdmin ? (
                                <button 
                                    onClick={handleAdminDirectSave} 
                                    disabled={isSaving}
                                    className="bg-yellow-500 text-white px-3 py-1.5 rounded-xl font-black hover:bg-yellow-600 shadow-sm text-xs flex items-center gap-2"
                                >
                                    {isSaving && (
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleRequestUpdate} 
                                    disabled={isSaving}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded-xl font-black hover:bg-green-700 shadow-sm text-xs flex items-center gap-2"
                                >
                                    {isSaving && (
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isSaving ? 'جاري الإرسال...' : 'طلب حفظ'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showStockFixAlert && (
                <div className="bg-red-50 dark:bg-red-900/20 border-r-4 border-red-600 p-4 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-3 no-print animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="text-red-600 scale-90"><SyncIcon /></div>
                        <div>
                            <p className="font-black text-red-800 dark:text-red-200 text-sm">تنبيه: لم يتم خصم الأصناف من المخزن!</p>
                            <p className="text-xs text-red-700 dark:text-red-300 font-bold">هذه الفاتورة "مبيعات خاصة". هل تريد الخصم الآن؟</p>
                        </div>
                    </div>
                    <button onClick={handleEmergencyStockFix} disabled={isFixingStock} className="bg-red-600 text-white px-5 py-2 rounded-lg font-black shadow-lg hover:bg-red-700 transition-all text-xs whitespace-nowrap">{isFixingStock ? 'جاري الخصم...' : 'خصم الكميات الآن'}</button>
                </div>
            )}

             <div id="invoice-print-area" className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[2.5rem] shadow-md font-sans border dark:border-gray-700">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-gray-100 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl font-black text-yellow-500 tracking-tighter">LibyPort</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Gateway to Global Commerce</p>
                    </div>
                    <div className="text-right mt-4 sm:mt-0 flex flex-col items-end">
                        <h2 className="text-lg font-black text-gray-800 dark:text-gray-100">فاتورة مبيعات</h2>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1">رقم: <span className="font-mono text-gray-700 dark:text-gray-300">#{order.id}</span></p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">تاريخ: <span className="text-gray-700 dark:text-gray-300">{new Date(order.date).toLocaleDateString('ar-LY')}</span></p>
                        <div className="mt-4 print:block bg-white p-1 rounded-lg border border-gray-100"><img src={qrCodeUrlGen} alt="Invoice QR" className="w-20 h-20 object-contain" /></div>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 my-8">
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">فاتورة إلى</h3>
                        {isEditing ? (
                            <div className="space-y-2">
                                <input type="text" name="customerName" value={editableOrder.customerName} onChange={handleInputChange} className={inputClasses} placeholder="اسم الزبون" />
                                <textarea name="address" value={editableOrder.address} onChange={handleInputChange} className={inputClasses} placeholder="العنوان" rows={2}></textarea>
                                <div className="grid grid-cols-2 gap-2"><input type="text" name="city" value={editableOrder.city} onChange={handleInputChange} className={inputClasses} placeholder="المدينة" /><input type="tel" name="phone1" value={editableOrder.phone1} onChange={handleInputChange} className={inputClasses} placeholder="الهاتف 1" /></div>
                            </div>
                        ) : (
                            <>
                                <p className="font-black text-base text-gray-900 dark:text-white leading-tight">{order.customerName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">{order.city} - {order.address}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-bold font-mono tracking-tighter">الهاتف: {order.phone1} {order.phone2 && `/ ${order.phone2}`}</p>
                                    <div className="flex items-center gap-1.5 no-print">
                                        <button 
                                            onClick={() => window.open(generateWhatsAppMessage(order, stores), '_blank')}
                                            className="text-green-600 hover:text-green-700 transition-colors"
                                            title="إرسال إشعار عبر واتساب"
                                        >
                                            <WhatsAppIcon />
                                        </button>
                                        <button 
                                            onClick={() => window.location.href = generateSMSMessage(order, stores)}
                                            className="text-blue-600 hover:text-blue-700 transition-colors"
                                            title="إرسال إشعار عبر SMS"
                                        >
                                            <SMSIcon />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="md:text-right">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">بيانات الدفع والتتبع</h3>
                        <p className="font-black text-base text-gray-900 dark:text-white leading-tight">صادر عن: {getStoreNames([order.storeId])}</p>
                    </div>
                </section>

                {isEditing && (
                    <div className="mb-8 no-print animate-fade-in-up">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">إضافة أو استبدال منتج من المخزن</label>
                        <div className="relative">
                            <input type="text" placeholder="ابحث باسم المنتج أو SKU لإضافته..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-700 border-2 border-yellow-500/20 rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold outline-none" />
                            <div className="absolute right-4 top-4 text-yellow-600"><SearchIcon /></div>
                            {storeProductsSearch.length > 0 && (
                                <ul className="absolute z-[100] w-full bg-white dark:bg-gray-800 border shadow-2xl rounded-2xl mt-2 overflow-hidden animate-fade-in">
                                    {storeProductsSearch.map(p => (
                                        <li key={p.id} onClick={() => handleAddNewProductToInvoice(p)} className="p-4 hover:bg-yellow-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors">
                                            <img src={p.image} className="w-10 h-10 object-cover rounded-lg border shadow-sm" alt={p.name} />
                                            <div className="flex-grow"><p className="font-black text-sm text-gray-900 dark:text-white">{p.name}</p><p className="text-xs text-gray-400 font-mono">SKU: {p.sku} | متوفر: {p.stock}</p></div>
                                            <div className="text-left"><p className="font-black text-yellow-600">{p.price.toLocaleString()} د.ل</p></div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
                
                <section className="overflow-x-auto mb-8">
                    <table className="w-full text-right">
                        <thead className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                            <tr><th className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider text-right w-20">الصورة</th><th className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider text-right">البيان والمنتج</th><th className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider text-right">الموقع</th><th className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">الكمية</th><th className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">السعر</th><th className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider text-left">الإجمالي</th>{isEditing && <th className="p-3 w-10 no-print"></th>}</tr>
                        </thead>
                        <tbody>
                            {(isEditing ? editableItems : order.items).map((item, index) => {
                                const productRef = products.find(p => p.id === item.productId);
                                const displayImage = item.image || productRef?.image;
                                // استخلاص اسم الموقع مع تجنب ظهور أرقام ID
                                const rawSource = (item as any).sourceWebsite;
                                const brand = shoppingBrands.find(b => b.id === rawSource || b.name === rawSource);
                                const siteName = brand ? brand.name : (rawSource || '-');

                                return (
                                    <tr key={item.productId || index} className={`border-b dark:border-gray-700 transition-colors hover:bg-gray-50/30 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-900/10'}`}>
                                        <td className="p-2 align-middle">
                                            <button 
                                                type="button" 
                                                onClick={() => setViewedItem({ item, product: products.find(p => p.id === item.productId) })}
                                                className="block w-14 h-14 rounded-xl overflow-hidden shadow-sm border dark:border-gray-600 no-print bg-gray-50 dark:bg-gray-900 transition-transform active:scale-95"
                                            >
                                                {displayImage ? (
                                                    <img src={displayImage} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <SpecialOrderIcon />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800 dark:text-gray-100 align-middle"><div className="flex flex-col gap-1"><div className="flex items-center gap-1.5"><button type="button" onClick={() => setViewedItem({item, product: products.find(p => p.id === item.productId)})} className="text-blue-500 hover:text-blue-700 no-print flex-shrink-0"><LinkIcon /></button><span className="text-sm">{item.name} {item.size && <span className="text-gray-400 font-bold text-xs">({item.size})</span>}</span></div>{(item.sku || products.find(p => p.id === item.productId)?.sku) && <p className="text-xs text-gray-400 font-mono">SKU: {item.sku || products.find(p => p.id === item.productId)?.sku}</p>}</div></td>
                                        <td className="p-4 text-sm font-black text-purple-600 dark:text-purple-400 align-middle">
                                            {siteName}
                                        </td>
                                        <td className="p-4 text-center text-gray-600 dark:text-gray-300 align-middle font-black text-sm">{isEditing ? <input type="number" value={item.quantity} onChange={(e) => handleItemQuantityChange(item.productId, e.target.value)} className="w-12 text-center border rounded-lg p-1 text-sm dark:bg-gray-600" /> : item.quantity}</td>
                                        <td className="p-4 text-center text-gray-600 dark:text-gray-300 align-middle text-sm">{isEditing && isAdmin ? <input type="number" value={item.price} onChange={(e) => handleItemPriceChange(item.productId, e.target.value)} className="w-20 text-center border rounded-lg p-1 text-sm dark:bg-gray-600 font-black" /> : `${item.price.toLocaleString()} د.ل`}</td>
                                        <td className="p-4 text-left font-black text-gray-900 dark:text-white align-middle text-sm">{ (item.price * item.quantity).toLocaleString() } د.ل</td>
                                        {isEditing && <td className="p-2 no-print align-middle"><button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:bg-red-50 rounded-lg p-2 transition-all"><TrashIcon/></button></td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                <section className="flex justify-end mt-4">
                    <div className="w-full max-w-xs space-y-3">
                        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm font-bold"><span>المجموع الفرعي:</span><span className="font-mono">{subtotalCalc.toLocaleString()} د.ل</span></div>
                        {discountAmount > 0 && <div className="flex justify-between items-center text-red-500 text-sm font-bold"><span>قيمة التخفيض:</span><span className="font-mono">-{discountAmount.toLocaleString()} د.ل</span></div>}
                        {order.deposit && order.deposit > 0 && <div className="flex justify-between items-center text-green-600 dark:text-green-400 py-2 border-y border-dashed dark:border-gray-700 text-sm font-black"><span>العربون المدفوع:</span><span className="font-mono">-{order.deposit.toLocaleString()} د.ل</span></div>}
                        <div className="flex justify-between items-center py-3 px-5 bg-gray-900 text-white rounded-2xl shadow-lg border-b-4 border-yellow-500"><span className="font-black text-sm uppercase tracking-tighter">المتبقي للتحصيل:</span><span className="font-black text-lg font-mono">{finalTotal.toLocaleString()} <span className="text-[10px] font-normal opacity-60">د.ل</span></span></div>
                        {!order.isPaymentConfirmed && isAdmin && order.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased && <div className="pt-2 no-print"><button onClick={() => setIsPaymentConfirmModalOpen(true)} className="w-full bg-green-600 text-white py-3 rounded-xl font-black text-sm shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all transform active:scale-95">تأكيد التسليم النهائي والتحصيل</button></div>}
                        {!order.isDepositPaid && isAdmin && (order.orderType === OrderType.DepositPurchase || order.orderType === OrderType.Procurement) && order.purchaseTrackingStatus !== PurchaseTrackingStatus.Cancelled && <div className="pt-2 no-print"><button onClick={() => setIsDepositConfirmModalOpen(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm shadow-xl shadow-green-600/20 hover:bg-blue-700 transition-all transform active:scale-95">تأكيد استلام العربون</button></div>}
                    </div>
                </section>

                {/* Shipment Comments Section */}
                <section className="mt-12 no-print border-t dark:border-gray-700 pt-8 pb-20">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-yellow-500 text-white rounded-xl shadow-lg shadow-yellow-500/20">
                            <NewsIcon />
                        </div>
                        <h3 className="text-base font-black text-gray-800 dark:text-white">أخبار وملاحظات الشحنة</h3>
                    </div>

                    <div className="max-w-4xl">
                        {/* Comments List */}
                        <div className="space-y-4">
                            {order.shipmentComments && order.shipmentComments.length > 0 ? (
                                order.shipmentComments.map((comment, idx) => {
                                    const author = users.find(u => u.id === comment.authorId);
                                    return (
                                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700 animate-fade-in">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-black text-white">
                                                        {author?.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900 dark:text-white">{author?.name || 'مسؤول'}</span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400">{new Date(comment.date).toLocaleString('ar-LY')}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{comment.comment}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-900/30 p-8 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                                    <p className="text-gray-400 font-bold text-xs">لا توجد ملاحظات أو أخبار لهذه الشحنة حتى الآن.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <footer className="mt-16 pt-6 border-t dark:border-gray-700 text-center"><p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Tripoli Global Gateway for Commerce & Logistics</p><p className="text-yellow-600 font-black italic text-sm mt-3">LibyPort - شكراً لتعاملكم معنا!</p></footer>
            </div>
            <div className="h-20 no-print"></div>
        </div>
    );
};

export default OrderDetailPage;
