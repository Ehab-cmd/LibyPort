
import React, { useMemo, useState, useEffect, startTransition } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order, DeliveryTrackingStatus, UserRole, PurchaseTrackingStatus, TreasuryType, User, BankAccount, DeliveryCompany, CompanyTxType, PaymentStatus, ClientTransactionType, OrderType, Treasury } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { getDeliveryStatusColor, getDeliveryStatusSelectColor } from '../utils/statusColors';
import { generateWhatsAppMessage, generateSMSMessage } from '../utils/notificationHelper';

// ... (keep icons components)
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.18-2.422a12.02 12.02 0 005.644 0L19 20.417A12.02 12.02 0 0017.618 5.984z" /></svg>;

const NewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
const SMSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

const TreasurySelection: React.FC<{
    cashTreasuries: Treasury[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onSelect: (type: TreasuryType, id: string) => void;
    selectedType: TreasuryType;
    selectedId: string;
}> = ({ cashTreasuries, banks, deliveryCompanies, onSelect, selectedType, selectedId }) => {
    return (
        <div className="space-y-4">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">توجيه المبلغ إلى:</label>
            <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => onSelect(TreasuryType.Cash, '')} className={`p-3 rounded-xl border-2 text-[10px] font-black transition-all ${selectedType === TreasuryType.Cash ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-gray-100 bg-gray-50 dark:bg-gray-700 opacity-60'}`}>💰 نقداً</button>
                <button type="button" onClick={() => onSelect(TreasuryType.Bank, '')} className={`p-3 rounded-xl border-2 text-[10px] font-black transition-all ${selectedType === TreasuryType.Bank ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-gray-100 bg-gray-50 dark:bg-gray-700 opacity-60'}`}>🏦 مصرف</button>
                <button type="button" onClick={() => onSelect(TreasuryType.DeliveryCompany, deliveryCompanies[0]?.id || '')} className={`p-3 rounded-xl border-2 text-[10px] font-black transition-all ${selectedType === TreasuryType.DeliveryCompany ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-gray-100 bg-gray-50 dark:bg-gray-700 opacity-60'}`}>🚚 توصيل</button>
            </div>
            {selectedType === TreasuryType.Cash && (
                <select value={selectedId} onChange={e => onSelect(TreasuryType.Cash, e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-bold text-xs">
                    <option value="">-- العهدة المستلمة --</option>
                    {cashTreasuries.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            )}
            {selectedType === TreasuryType.Bank && (
                <select value={selectedId} onChange={e => onSelect(TreasuryType.Bank, e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-bold text-xs">
                    <option value="">-- المصرف المستلم --</option>
                    {banks.map(b => <option key={b.id} value={String(b.id)}>{b.bankName}</option>)}
                </select>
            )}
            {selectedType === TreasuryType.DeliveryCompany && (
                <select value={selectedId} onChange={e => onSelect(TreasuryType.DeliveryCompany, e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-bold text-xs">
                    {deliveryCompanies.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                </select>
            )}
        </div>
    );
};

import { useNotification } from '../context/NotificationContext';

const CollectionModal: React.FC<{
    order: Order;
    cashTreasuries: Treasury[];
    banks: BankAccount[];
    deliveryCompanies: DeliveryCompany[];
    onClose: () => void;
    onConfirm: (treasuryType: TreasuryType | null, treasuryId: string, actualReceived: number, commission: number, isOnAccount: boolean) => Promise<void>;
}> = ({ order, cashTreasuries, banks, deliveryCompanies, onClose, onConfirm }) => {
    const { showToast } = useNotification();
    const remaining = order.total - (order.deposit || 0);
    const [amount, setAmount] = useState(remaining);
    const [commission, setCommission] = useState(0);
    const [selectedType, setSelectedType] = useState<TreasuryType>(TreasuryType.Cash);
    const [selectedId, setSelectedId] = useState('');
    const [isOnAccount, setIsOnAccount] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const netToTreasury = Math.max(0, amount - commission);

    const handleConfirm = async () => {
        if (isProcessing) return;
        if (!isOnAccount && !selectedId && selectedType !== TreasuryType.DeliveryCompany) {
            showToast('الرجاء تحديد الخزينة أو اختيار التسجيل على الحساب', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            await onConfirm(
                isOnAccount ? null : selectedType, 
                isOnAccount ? '' : selectedId, 
                isOnAccount ? 0 : amount, 
                isOnAccount ? 0 : commission,
                isOnAccount
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[250] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-fade-in-up border dark:border-gray-700 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-black mb-1 text-gray-800 dark:text-white text-center">استلام القيمة من الزبون</h2>
                <p className="text-[11px] text-gray-400 mb-6 text-center font-bold uppercase tracking-tight">الفاتورة #{order.id} | المتبقي: {remaining.toLocaleString()} د.ل</p>
                
                <div className="space-y-4 mb-6">
                    <button 
                        type="button"
                        onClick={() => setIsOnAccount(!isOnAccount)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${isOnAccount ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20' : 'bg-gray-50 border-transparent text-gray-400 opacity-60'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isOnAccount ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'}`}><UserCheckIcon /></div>
                            <span className="font-black text-sm">تسجيل المتبقي على الحساب (دين)</span>
                        </div>
                        {isOnAccount && <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                    </button>

                    {!isOnAccount && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">المبلغ المقبوض الآن</label>
                                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-transparent border-none p-0 font-black text-2xl focus:ring-0" />
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                                <label className="block text-[10px] font-black text-red-400 uppercase mb-1">عمولة مخصومة (إن وجد)</label>
                                <input type="number" value={commission} onChange={e => setCommission(Number(e.target.value))} className="w-full bg-transparent border-none p-0 font-black text-2xl text-red-600 focus:ring-0" />
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border-2 border-green-500 text-center">
                                <label className="block text-[10px] font-black text-green-700 dark:text-green-400 uppercase mb-1">الصافي للخزينة</label>
                                <p className="font-black text-3xl text-green-600">{netToTreasury.toLocaleString()} <span className="text-sm">د.ل</span></p>
                            </div>

                            <TreasurySelection 
                                cashTreasuries={cashTreasuries} 
                                banks={banks} 
                                deliveryCompanies={deliveryCompanies} 
                                selectedType={selectedType} 
                                selectedId={selectedId} 
                                onSelect={(t, id) => { setSelectedType(t); setSelectedId(id); }} 
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl order-2 sm:order-1">إلغاء</button>
                    <button onClick={handleConfirm} disabled={isProcessing} className="flex-[2] py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition-all transform active:scale-95 order-1 sm:order-2">
                        {isProcessing ? 'جاري المعالجة...' : isOnAccount ? 'تأكيد التسليم (على الحساب)' : 'تأكيد وحفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: DeliveryTrackingStatus }> = ({ status }) => {
    const classes = getDeliveryStatusColor(status);
    const isPulse = status === DeliveryTrackingStatus.ReturnedToCompany;
    return <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tight border ${classes} ${isPulse ? 'animate-pulse' : ''}`}>{status}</span>;
};

const TrackingPill: React.FC<{ number?: string; type: 'intl' | 'local' }> = ({ number, type }) => {
    const { showToast } = useNotification();
    if (!number) return <span className="text-gray-300 dark:text-gray-600 italic text-[10px]">لم يحدد بعد</span>;
    const handleCopy = (e: React.MouseEvent) => { 
        e.stopPropagation(); 
        navigator.clipboard.writeText(number);
        showToast('تم نسخ رقم التتبع', 'success');
    };
    return (
        <div className="group/pill relative flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-600 hover:border-yellow-400 transition-all cursor-pointer" onClick={handleCopy} title="انقر للنسخ">
            <div className={`p-1 rounded ${type === 'intl' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>{type === 'intl' ? <GlobeIcon /> : <TruckIcon />}</div>
            <span className="font-mono text-[11px] font-bold text-gray-700 dark:text-gray-200">{number}</span>
            <div className="text-gray-400 group-hover/pill:text-yellow-600"><CopyIcon /></div>
        </div>
    );
};

const ManageShipmentModal: React.FC<{
    order: Order;
    stores: any[];
    onClose: () => void;
    onSave: (updates: Partial<Order>) => Promise<void>;
    onAddComment: (comment: string) => Promise<void>;
}> = ({ order, stores, onClose, onSave, onAddComment }) => {
    const isInstant = order.orderType === OrderType.InstantDelivery;
    const initialStatus = (isInstant && order.deliveryTrackingStatus === DeliveryTrackingStatus.Arrived) 
        ? DeliveryTrackingStatus.LocalShipping 
        : order.deliveryTrackingStatus;
    const [status, setStatus] = useState<DeliveryTrackingStatus>(initialStatus);
    const [intlNumber, setIntlNumber] = useState(order.internationalTrackingNumber || '');
    const [localNumber, setLocalNumber] = useState(order.localTrackingNumber || '');
    const [newComment, setNewComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        
        // Add comment if exists
        if (newComment.trim()) {
            await onAddComment(newComment.trim());
        }

        await onSave({
            deliveryTrackingStatus: status,
            internationalTrackingNumber: isInstant ? null : (intlNumber || null),
            localTrackingNumber: localNumber || null
        } as any);

        setIsSaving(false);
        if (status !== DeliveryTrackingStatus.Delivered) {
            onClose();
        }
    };

    const handleWhatsApp = () => {
        const { stores } = (window as any).appContextValue || { stores: [] }; 
        // We need stores here. Let's pass it as a prop.
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-2xl w-full max-w-[420px] animate-fade-in-up border dark:border-gray-700 overflow-y-auto max-h-[95vh]">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-black text-gray-800 dark:text-white">إدارة شحنة #{order.id}</h2>
                        {isInstant && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">طلبية فورية</span>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-all p-1"><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-1">حالة التوصيل الحالية</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value as DeliveryTrackingStatus)}
                            className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-sm"
                        >
                            {Object.values(DeliveryTrackingStatus).map(s => (
                                !(isInstant && [DeliveryTrackingStatus.InternationalShipping].includes(s)) && (
                                    <option key={s} value={s}>{s}</option>
                                )
                            ))}
                        </select>
                    </div>
                    <div className="space-y-3">
                        {!isInstant && (
                            <div className={`transition-opacity ${status === DeliveryTrackingStatus.Pending ? 'opacity-40' : 'opacity-100'}`}>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-1">رقم التتبع الدولي</label>
                                <input type="text" value={intlNumber} onChange={e => setIntlNumber(e.target.value)} placeholder="مثال: JYZQN12345" className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-mono text-xs" />
                            </div>
                        )}
                        <div className={`transition-opacity ${[DeliveryTrackingStatus.Pending, DeliveryTrackingStatus.InternationalShipping].includes(status) && !isInstant ? 'opacity-40' : 'opacity-100'}`}>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-1">رقم التتبع المحلي (كابت)</label>
                            <input type="text" value={localNumber} onChange={e => setLocalNumber(e.target.value)} placeholder="مثال: LP-TRIP-990" className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-mono text-xs" autoFocus={isInstant} />
                        </div>
                    </div>

                    <div className="pt-4 border-t dark:border-gray-700">
                        <label className="flex items-center gap-2 text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-2 mr-1">
                            <NewsIcon /> إضافة ملاحظة أو تحديث للشحنة
                        </label>
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="اكتب ملاحظة للزبون حول حالة الشحنة..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-xs h-20 resize-none"
                        />
                    </div>

                    {status === DeliveryTrackingStatus.LocalShipping && (
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                type="button"
                                onClick={() => window.open(generateWhatsAppMessage(order, stores), '_blank')}
                                className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-black text-[10px] shadow-lg hover:bg-green-700 transition-all active:scale-95"
                            >
                                <WhatsAppIcon /> واتساب
                            </button>
                            <button 
                                type="button"
                                onClick={() => window.location.href = generateSMSMessage(order, stores)}
                                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <SMSIcon /> رسالة SMS
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl text-xs">إلغاء</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 bg-yellow-500 text-white font-black rounded-xl shadow-lg hover:bg-yellow-600 transition-all active:scale-95 disabled:bg-gray-400 text-xs">
                        {isSaving ? 'جاري الحفظ...' : 'حفظ وإرسال للتوصيل'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShipmentsPage: React.FC = () => {
    const { orders, currentUser, updateOrder, stores, getStoreNames, users, bankAccounts, systemSettings, addCompanyTransaction, addClientTransaction, addShipmentComment, treasuries } = useAppContext();
    const { showToast } = useNotification();
    
    const handleSendWhatsApp = (order: Order) => {
        const url = generateWhatsAppMessage(order, stores);
        window.open(url, '_blank');
    };

    const handleSendSMS = (order: Order) => {
        const url = generateSMSMessage(order, stores);
        window.location.href = url;
    };
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [collectionOrder, setCollectionOrder] = useState<Order | null>(null);
    const [visibleCount, setVisibleCount] = useState(50);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const isAdmin = useMemo(() => currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role), [currentUser]);
    const cashTreasuries = useMemo(() => treasuries.filter(t => {
        if (!t.isActive) return false;
        const typeStr = String(t.type).toLowerCase();
        return typeStr === 'cash' || typeStr === TreasuryType.Cash.toLowerCase() || typeStr.includes('نقدي');
    }), [treasuries]);
    const deliveryCompanies = systemSettings.deliveryCompanies || [];

    const urlSearchTerm = searchParams.get('search') || '';
    const statusFilter = (searchParams.get('status') as DeliveryTrackingStatus | 'all') || 'all';
    const storeFilter = searchParams.get('store') || 'all';

    const shipments = useMemo(() => {
        const userStoreIds = isAdmin ? orders.map(o => o.storeId) : currentUser?.storeIds || [];
        const searchTermClean = urlSearchTerm.toLowerCase().trim();

        return orders
            .filter(o => !o.isDeleted && (o.purchaseTrackingStatus === PurchaseTrackingStatus.Purchased || o.deliveryTrackingStatus !== DeliveryTrackingStatus.Pending))
            .filter(o => userStoreIds.includes(o.storeId))
            .filter(o => statusFilter === 'all' || o.deliveryTrackingStatus === statusFilter)
            .filter(o => storeFilter === 'all' || String(o.storeId) === storeFilter)
            .filter(o => {
                if (!searchTermClean) return true;
                const storeObj = stores.find(st => st.id === o.storeId);
                const storeName = storeObj ? storeObj.name.toLowerCase() : '';
                const matchesBasic = o.customerName.toLowerCase().includes(searchTermClean) || o.id.toLowerCase().includes(searchTermClean) || o.phone1.includes(searchTermClean) || storeName.includes(searchTermClean);
                const matchesItems = o.items.some(item => 
                    String(item.name || '').toLowerCase().includes(searchTermClean) || 
                    String(item.sku || '').toLowerCase().includes(searchTermClean)
                );
                return matchesBasic || matchesItems;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, statusFilter, storeFilter, urlSearchTerm, isAdmin, currentUser, stores]);

    const handleUpdateShipment = async (updates: Partial<Order>) => {
        if (selectedOrder) {
            await updateOrder(selectedOrder.id, updates);
            if (updates.deliveryTrackingStatus === DeliveryTrackingStatus.Delivered) {
                setCollectionOrder({ ...selectedOrder, ...updates });
                setSelectedOrder(null);
            } else {
                setSelectedOrder(null);
            }
        }
    };

    const handleAddComment = async (comment: string) => {
        if (selectedOrder) {
            await addShipmentComment(selectedOrder.id, comment);
        }
    };

    const handleConfirmCollection = async (type: TreasuryType | null, tid: string, amount: number, commission: number, isOnAccount: boolean) => {
        if (collectionOrder) {
            const targetOrder = collectionOrder;
            setCollectionOrder(null);

            await updateOrder(targetOrder.id, {
                deliveryTrackingStatus: DeliveryTrackingStatus.Delivered,
                isPaymentConfirmed: !isOnAccount,
                collectedToTreasury: type || undefined,
                collectionTreasuryId: tid || undefined
            });

            if (!isOnAccount && amount > 0) {
                const treasuryLabel = type ? String(type) : 'غير محددة';
                await addClientTransaction(
                    targetOrder.phone1, 
                    amount, 
                    ClientTransactionType.Payment, 
                    `تحصيل متبقي الفاتورة #${targetOrder.id} عند التسليم (الخزينة: ${treasuryLabel})`,
                    targetOrder.id
                );
            }

            const netAmount = amount - commission;
            if (!isOnAccount && netAmount > 0 && type) {
                await addCompanyTransaction({
                    type: CompanyTxType.SaleCollection,
                    amount: netAmount,
                    beneficiary: targetOrder.customerName,
                    description: `تحصيل متبقي الفاتورة #${targetOrder.id} عند التسليم`,
                    paymentStatus: PaymentStatus.Paid,
                    toTreasury: type,
                    toTreasuryId: tid,
                    orderId: targetOrder.id,
                    storeId: targetOrder.storeId,
                    processedBy: currentUser?.id,
                    date: new Date().toISOString()
                });
                setSuccessMessage(`تم تحصيل ${amount.toLocaleString()} د.ل من العميل وتحديث السجل المالي بنجاح.`);
            } else if (isOnAccount) {
                setSuccessMessage(`تم تسليم الشحنة وتثبيت القيمة كمديونية مستحقة في كشف حساب العميل.`);
            }
        }
    };

    const updateFilter = (key: string, val: string) => {
        startTransition(() => {
            setSearchParams(prev => {
                if (!val || val === 'all') prev.delete(key);
                else prev.set(key, val);
                return prev;
            }, { replace: true });
        });
    };

    return (
        <div className="container mx-auto p-4 md:p-8 pb-20" dir="rtl">
            {successMessage && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-3 rounded-2xl shadow-xl z-[300] font-black animate-fade-in-up" onClick={() => setSuccessMessage(null)}>
                    {successMessage}
                </div>
            )}
            
            {selectedOrder && <ManageShipmentModal order={selectedOrder} stores={stores} onClose={() => setSelectedOrder(null)} onSave={handleUpdateShipment} onAddComment={handleAddComment} />}
            
            {collectionOrder && (
                <CollectionModal 
                    order={collectionOrder} 
                    cashTreasuries={cashTreasuries} 
                    banks={bankAccounts} 
                    deliveryCompanies={deliveryCompanies} 
                    onClose={() => setCollectionOrder(null)} 
                    onConfirm={handleConfirmCollection} 
                />
            )}

            <div className="mb-6 md:mb-10">
                <Breadcrumbs items={[{ label: 'لوحة التحكم', path: '/dashboard' }, { label: 'الشحنات', path: undefined }]} />
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">إدارة الشحنات</h1>
                <p className="text-[10px] md:text-sm text-gray-500 mt-1 md:2 font-medium">تتبع مسار البضاعة وتحصيل المبالغ عند التسليم.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 mb-6 md:mb-8 flex flex-row gap-2 md:gap-5 items-end">
                <div className="relative flex-grow">
                    <label className="hidden md:block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">البحث</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="بحث..." 
                            value={urlSearchTerm} 
                            onChange={e => updateFilter('search', e.target.value)} 
                            className="w-full p-2 md:p-4 pr-8 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold shadow-inner dark:text-white text-[9px] md:text-base" 
                        />
                        <div className="absolute right-2 md:right-4 top-2 md:top-4 text-gray-400 scale-[0.5] md:scale-100"><SearchIcon /></div>
                    </div>
                </div>

                <div className="w-24 md:w-40 flex-shrink-0 flex flex-col gap-1">
                    <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1 mr-1 md:mr-2 truncate">الحالة</label>
                    <select 
                        value={statusFilter} 
                        onChange={e => updateFilter('status', e.target.value)}
                        className="w-full p-1.5 md:p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-lg md:rounded-xl font-bold text-[8px] md:text-sm focus:ring-2 focus:ring-yellow-500 dark:text-white appearance-none"
                    >
                        <option value="all">الكل</option>
                        {Object.values(DeliveryTrackingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="w-24 md:w-40 flex-shrink-0 flex flex-col gap-1">
                    <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1 mr-1 md:mr-2 truncate flex items-center gap-1"><span className="hidden md:inline"><StoreIcon /></span> المتجر</label>
                    <select 
                        value={storeFilter} 
                        onChange={e => updateFilter('store', e.target.value)}
                        className="w-full p-1.5 md:p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-lg md:rounded-xl font-bold text-[8px] md:text-sm focus:ring-2 focus:ring-yellow-500 dark:text-white appearance-none"
                    >
                        <option value="all">الكل</option>
                        {stores.filter(s => isAdmin || currentUser?.storeIds.includes(s.id)).map(s => (
                            <option key={s.id} value={String(s.id)}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50/50 dark:bg-gray-900 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b dark:border-gray-700">
                            <tr><th className="px-8 py-6">الزبون</th><th className="px-6 py-6 text-center">التتبع</th><th className="px-6 py-6 text-center">حالة الشحنة</th><th className="px-8 py-6 text-left">إجراءات</th></tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {shipments.slice(0, visibleCount).map((order, idx) => (
                                <tr key={`${order.id}-${idx}`} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-8 py-6"><button onClick={() => navigate(`/orders/${order.id}`)} className="text-yellow-600 font-mono font-black text-sm">#{order.id}</button><p className="font-black mt-1 text-gray-900 dark:text-white">{order.customerName}</p><p className="text-[9px] text-gray-400">{order.city} - {getStoreNames([order.storeId])}</p></td>
                                    <td className="px-6 py-6 text-center space-y-1"><TrackingPill number={order.internationalTrackingNumber} type="intl" /><TrackingPill number={order.localTrackingNumber} type="local" /></td>
                                    <td className="px-6 py-6 text-center">
                                        <select 
                                            value={order.deliveryTrackingStatus} 
                                            disabled={!isAdmin}
                                            onChange={e => e.target.value === DeliveryTrackingStatus.Delivered ? setCollectionOrder(order) : updateOrder(order.id, { deliveryTrackingStatus: e.target.value as any })}
                                            className={`p-2 rounded-xl text-[10px] font-black border transition-all ${getDeliveryStatusSelectColor(order.deliveryTrackingStatus)} ${!isAdmin ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                                        >
                                            {Object.values(DeliveryTrackingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button onClick={() => setSelectedOrder(order)} className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-black text-[10px] hover:bg-yellow-600 transition-all flex items-center gap-2 shadow-sm"><EditIcon /> إدارة</button>
                                            )}
                                            {order.deliveryTrackingStatus === DeliveryTrackingStatus.LocalShipping && (
                                                <>
                                                    <button onClick={() => handleSendWhatsApp(order)} className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-all shadow-sm" title="إرسال إشعار واتساب"><WhatsAppIcon /></button>
                                                    <button onClick={() => handleSendSMS(order)} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-sm" title="إرسال إشعار SMS"><SMSIcon /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden p-4 space-y-5 bg-gray-50 dark:bg-gray-900/50">
                    {shipments.slice(0, visibleCount).map((order, idx) => (
                        <div key={`${order.id}-${idx}`} className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2.5rem] p-5 md:p-6 shadow-xl border-2 border-gray-100 dark:border-gray-700 relative animate-fade-in-up">
                            <div className="flex justify-between items-start mb-4 pr-1">
                                <div className="text-right">
                                    <button onClick={() => navigate(`/orders/${order.id}`)} className="text-[10px] md:text-xs font-black text-yellow-600 block mb-1 font-mono tracking-widest">#{order.id}</button>
                                    <h3 className="font-black text-gray-900 dark:text-white text-sm md:text-lg leading-tight">{order.customerName}</h3>
                                    <p className="text-[8px] md:text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{order.city} - {getStoreNames([order.storeId])}</p>
                                </div>
                                <div className="text-left">
                                    <StatusBadge status={order.deliveryTrackingStatus} />
                                </div>
                            </div>

                            <div className="space-y-2 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">تتبع دولي:</span>
                                    <TrackingPill number={order.internationalTrackingNumber} type="intl" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">تتبع محلي:</span>
                                    <TrackingPill number={order.localTrackingNumber} type="local" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {isAdmin ? (
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="bg-gray-900 dark:bg-gray-700 text-white py-2.5 md:py-3 rounded-2xl font-black text-[10px] md:text-xs shadow-lg flex items-center justify-center gap-2 active:scale-90 transition-transform"
                                    >
                                        <EditIcon /> إدارة
                                    </button>
                                ) : <div />}
                                {order.deliveryTrackingStatus === DeliveryTrackingStatus.LocalShipping ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleSendWhatsApp(order)}
                                            className="bg-green-600 text-white py-2.5 md:py-3 rounded-2xl font-black text-[10px] md:text-xs shadow-lg flex items-center justify-center gap-2 active:scale-90 transition-transform"
                                        >
                                            <WhatsAppIcon /> واتساب
                                        </button>
                                        <button 
                                            onClick={() => handleSendSMS(order)}
                                            className="bg-blue-600 text-white py-2.5 md:py-3 rounded-2xl font-black text-[10px] md:text-xs shadow-lg flex items-center justify-center gap-2 active:scale-90 transition-transform"
                                        >
                                            <SMSIcon /> SMS
                                        </button>
                                    </div>
                                ) : (
                                    <select 
                                        value={order.deliveryTrackingStatus} 
                                        disabled={!isAdmin}
                                        onChange={e => e.target.value === DeliveryTrackingStatus.Delivered ? setCollectionOrder(order) : updateOrder(order.id, { deliveryTrackingStatus: e.target.value as any })}
                                        className={`py-2.5 md:py-3 rounded-2xl text-[8px] md:text-[10px] font-black uppercase text-center border shadow-md transition-all outline-none ${getDeliveryStatusSelectColor(order.deliveryTrackingStatus)} ${!isAdmin ? 'opacity-80' : ''}`}
                                    >
                                        {Object.values(DeliveryTrackingStatus).map(s => <option key={s} value={s} className="bg-white text-gray-900">{s}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {shipments.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mt-6 animate-pulse">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner"><SearchIcon /></div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لا توجد نتائج</h3>
                </div>
            )}

            {visibleCount < shipments.length && (
                <div className="mt-12 flex justify-center">
                    <button onClick={() => setVisibleCount(v => v + 50)} className="bg-gray-900 dark:bg-gray-700 text-white px-12 py-5 rounded-[2.5rem] font-black text-sm shadow-2xl transform hover:-translate-y-1 transition-all active:scale-95 border border-gray-800">عرض المزيد</button>
                </div>
            )}

            <div className="h-24"></div>
        </div>
    );
};

export default ShipmentsPage;
