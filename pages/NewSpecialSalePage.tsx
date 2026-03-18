
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, OrderType, ProductCategory, PaymentMethod, OrderItem, Product, ShippingOrigin, TreasuryType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { LIBYAN_CITIES, COST_CURRENCIES } from '../constants';

// --- Professional Icons ---
const PlusIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const BriefcaseIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const TruckIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const SpeakerIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const ShoppingBagIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const LinkIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

const AD_PLATFORMS = ['فيسبوك', 'إنستغرام', 'غوغل', 'سناب شات', 'تيك توك', 'منصة أخرى'];

const SuccessOrderModal: React.FC<{ invoiceId: string; customerName: string; onClose: () => void }> = ({ invoiceId, customerName, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[500] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center transform transition-all animate-fade-in-up border dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/30 mb-6 text-green-500">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم بنجاح!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-bold leading-relaxed">
                تم تسجيل الفاتورة بنجاح للزبون <span className="text-purple-600 dark:text-purple-400 font-black">{customerName}</span>.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl mb-8 border dark:border-gray-600">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم الفاتورة</p>
                <span className="font-mono font-black text-2xl text-purple-600 dark:text-purple-400 tracking-wider select-all">{invoiceId}</span>
            </div>
            <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all transform active:scale-95">موافق</button>
        </div>
    </div>
);

const NewSpecialSalePage: React.FC = () => {
    const { currentUser, addOrder, clients, cart, addToCart, removeFromCart, clearCart, shippingOrigins, shoppingBrands, exchangeRate } = useAppContext();
    const { showToast } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();
    const [entryType, setEntryType] = useState<0 | 1 | 2>(0);
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string; phone2?: string; city: string; address: string } | null>(null);
    const [isPhone2Visible, setIsPhone2Visible] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerMenu, setShowCustomerMenu] = useState(false);
    const [savedOrderInfo, setSavedOrderInfo] = useState<{ id: string; customerName: string } | null>(null);
    
    // Core Entry Fields
    const [prodDescription, setProdDescription] = useState('');
    const [prodUrl, setProdUrl] = useState(''); 
    const [purchaseRef, setPurchaseRef] = useState('');
    const [sourceId, setSourceId] = useState('other');
    const [salePriceLYD, setSalePriceLYD] = useState('');
    const [adhocCost, setAdhocCost] = useState('');
    const [adhocCostCurrency, setAdhocCostCurrency] = useState('USD');
    const [itemType, setItemType] = useState<'piece' | 'basket'>('piece');
    const [basketPieceCount, setBasketPieceCount] = useState('1');
    const [adhocNotes, setAdhocNotes] = useState('');

    // Shipping Type Fields
    const [originId, setOriginId] = useState('');

    // Ad Type Fields
    const [adAmountUSD, setAdAmountUSD] = useState('');
    const [adPlatform, setAdPlatform] = useState(AD_PLATFORMS[0]);

    // Order Meta
    const [discount, setDiscount] = useState('');
    const [deposit, setDeposit] = useState('');
    const [depositTreasuryId, setDepositTreasuryId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!currentUser || (currentUser.role !== UserRole.Admin && currentUser.role !== UserRole.SuperAdmin)) return null;

    const filteredClients = useMemo(() => {
        if (!customerSearch) return [];
        const lower = customerSearch.toLowerCase();
        return clients.filter(c => c.name.toLowerCase().includes(lower) || c.phone.includes(lower)).slice(0, 5);
    }, [customerSearch, clients]);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
    const total = subtotal - (parseFloat(discount) || 0);

    const handleAddEntry = () => {
        let name = '';
        let price = 0;
        let finalCostUSD = 0;
        let metadata: any = {};
        const costRate = COST_CURRENCIES.find(c => c.code === adhocCostCurrency)?.rateToUSD || 1;
        const baseCostUSD = (parseFloat(adhocCost) || 0) * costRate;

        if (entryType === 0) { 
            if (!prodDescription || !salePriceLYD) {
                showToast('يرجى إدخال وصف المنتج وسعر البيع', 'error');
                return;
            }
            name = prodDescription; 
            price = parseFloat(salePriceLYD); 
            finalCostUSD = baseCostUSD;
            
            // إصلاح جذري: التأكد من سحب "اسم الموقع" وليس الـ ID
            const brandObject = shoppingBrands.find(b => b.id === sourceId);
            const sourceName = brandObject ? brandObject.name : (sourceId === 'other' ? 'موقع آخر' : sourceId);
            
            metadata = { 
                url: prodUrl, 
                purchaseReference: purchaseRef, 
                sourceWebsite: String(sourceName), // تخزين اسم الموقع كـ "نص" صريح
                notes: `${itemType === 'basket' ? `[سلة: ${basketPieceCount} قطع] ` : '[قطعة] '} ${adhocNotes}`,
                type: 'طلبية',
                quantity: itemType === 'basket' ? Math.max(1, parseInt(basketPieceCount)) : 1
            };
        } else if (entryType === 1) { 
            const origin = shippingOrigins.find(o => o.id === originId); if (!origin) return;
            name = `شحن (${origin.name})`; price = 0; finalCostUSD = 0;
            metadata = { sourceWebsite: String(origin.name), notes: adhocNotes, type: 'شحن' };
        } else { 
            const amount = parseFloat(adAmountUSD) || 0;
            name = `إعلان ممول (${adPlatform})`; price = Math.ceil(amount * exchangeRate); finalCostUSD = amount;
            metadata = { sourceWebsite: String(adPlatform), notes: `${adPlatform} | ${adhocNotes}`, type: 'إعلان' };
        }

        addToCart({ 
            id: Date.now(), 
            name, 
            price, 
            quantity: 1, 
            costInUSD: finalCostUSD, 
            ...metadata, 
            category: ProductCategory.Miscellaneous 
        } as any, 1);
        
        // Reset specific fields
        setProdDescription(''); setProdUrl(''); setPurchaseRef(''); setAdhocCost(''); setSalePriceLYD(''); 
        setAdAmountUSD(''); setAdhocNotes(''); setBasketPieceCount('1'); setItemType('piece');
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            showToast('يرجى اختيار عميل', 'error');
            return;
        }
        if (!selectedCustomer.phone) {
            showToast('رقم الهاتف مطلوب', 'error');
            return;
        }
        if (cart.length === 0) {
            showToast('الفاتورة فارغة', 'error');
            return;
        }

        setIsSaving(true);
        const result = await addOrder({
            storeId: 1, 
            customerName: selectedCustomer.name,
            phone1: selectedCustomer.phone,
            phone2: selectedCustomer.phone2 || '',
            city: selectedCustomer.city,
            address: selectedCustomer.address,
            items: cart,
            total,
            orderType: OrderType.Procurement,
            productType: ProductCategory.Miscellaneous,
            paymentMethod: PaymentMethod.Cash,
            notes,
            discount: Number(discount) || 0,
            deposit: Number(deposit) || 0,
            depositTreasuryId: Number(deposit) > 0 ? depositTreasuryId : undefined,
            isDepositPaid: Number(deposit) > 0 && !!depositTreasuryId
        });

        setIsSaving(false);
        if (result.success) {
            setSavedOrderInfo({ id: result.id!, customerName: selectedCustomer.name });
            clearCart();
        } else {
            showToast(result.message || 'حدث خطأ أثناء حفظ الفاتورة', 'error');
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {savedOrderInfo && (
                <SuccessOrderModal 
                    invoiceId={savedOrderInfo.id} 
                    customerName={savedOrderInfo.customerName} 
                    onClose={() => { setSavedOrderInfo(null); navigate('/sales-invoices'); }} 
                />
            )}
            <div className="flex items-center gap-3 mb-10 pb-6 border-b dark:border-gray-700">
                <div className="bg-purple-600 text-white p-3.5 rounded-[1.5rem] shadow-xl shadow-purple-500/20"><BriefcaseIcon /></div>
                <div><h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">إدارة المبيعات الخاصة</h1><p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-tighter">خاص بفريق العمليات المركزية فقط</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* TYPE SELECTOR */}
                    <div className="grid grid-cols-3 gap-3 bg-white dark:bg-gray-800 p-2 rounded-[2rem] shadow-lg border border-purple-50 dark:border-purple-900/20">
                        <button onClick={() => setEntryType(0)} className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-3 transition-all ${entryType === 0 ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            <ShoppingBagIcon /> <span className="font-black text-xs">تسجيل طلبية</span>
                        </button>
                        <button onClick={() => setEntryType(1)} className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-3 transition-all ${entryType === 1 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            <TruckIcon /> <span className="font-black text-xs">فاتورة شحن</span>
                        </button>
                        <button onClick={() => setEntryType(2)} className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-3 transition-all ${entryType === 2 ? 'bg-red-600 text-white shadow-xl shadow-red-500/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            <SpeakerIcon /> <span className="font-black text-xs">إعلان ممول</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {entryType === 0 && (
                                <div className="md:col-span-2 space-y-6 animate-fade-in-up">
                                    {/* Item Type Switcher */}
                                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl w-fit">
                                        <button onClick={() => setItemType('piece')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${itemType === 'piece' ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm' : 'text-gray-400'}`}>📦 قطعة واحدة</button>
                                        <button onClick={() => setItemType('basket')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${itemType === 'basket' ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-sm' : 'text-gray-400'}`}>🧺 سلة مشتريات</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">وصف المنتج / السلة</label>
                                            <input type="text" value={prodDescription} onChange={e => setProdDescription(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-2 focus:ring-purple-500 shadow-inner" placeholder="مثال: فستان سهرة، طقم ترينديول، سلة من شي ان..." />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">مصدر الشراء (الموقع)</label>
                                            <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold">
                                                {shoppingBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">رقم مرجع الشراء (Order ID)</label>
                                            <input type="text" value={purchaseRef} onChange={e => setPurchaseRef(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-mono font-bold" placeholder="GSH..." />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">رابط المنتج (URL)</label>
                                            <div className="relative">
                                                <input type="url" value={prodUrl} onChange={e => setProdUrl(e.target.value)} className="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-bold font-mono text-xs" placeholder="https://..." />
                                                <div className="absolute right-3 top-3 text-gray-400"><LinkIcon /></div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-1 mr-2">سعر البيع للزبون (د.ل)</label>
                                            <input type="number" value={salePriceLYD} onChange={e => setSalePriceLYD(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-2xl text-green-600 shadow-inner" placeholder="0.00" />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-1 mr-2">تكلفة الشراء الأصلية</label>
                                            <div className="flex">
                                                <input type="number" value={adhocCost} onChange={e => setAdhocCost(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-r-2xl font-black text-xl shadow-inner" placeholder="0.00" />
                                                <select value={adhocCostCurrency} onChange={e => setAdhocCostCurrency(e.target.value)} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-l-2xl font-black text-xs border-r border-white/10">
                                                    {COST_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code.split(' ')[0]}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {itemType === 'basket' && (
                                            <div className="md:col-span-2 animate-fade-in">
                                                <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 mr-2">عدد المنتجات (القطع) داخل السلة</label>
                                                <input type="number" value={basketPieceCount} onChange={e => setBasketPieceCount(e.target.value)} className="w-full p-4 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-100 dark:border-purple-800 rounded-2xl font-black text-xl text-center" />
                                                <p className="text-[10px] text-gray-400 mt-1 font-bold italic">* يستخدم هذا الرقم لحساب العمولات وعدد القطع في التقارير.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {entryType === 1 && (
                                <div className="md:col-span-2 space-y-6 animate-fade-in-up">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-black text-gray-400 mb-1 mr-2">دولة الشحن</label><select value={originId} onChange={e => setOriginId(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-sm">{shippingOrigins.map(o => <option key={o.id} value={o.id}>{o.name} ({o.ratePerKgUSD}$/كجم)</option>)}</select></div>
                                    </div>
                                </div>
                            )}
                            {entryType === 2 && (
                                <div className="md:col-span-2 space-y-6 animate-fade-in-up">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-black text-gray-400 mb-1 mr-2">قيمة الإعلان ($)</label><input type="number" value={adAmountUSD} onChange={e => setAdAmountUSD(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-xl text-center shadow-inner" placeholder="0.00" /></div>
                                        <div><label className="block text-[10px] font-black text-gray-400 mb-1 mr-2">المنصة</label><select value={adPlatform} onChange={e => setAdPlatform(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-sm">{AD_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                    </div>
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">ملاحظات إضافية لهذا السطر</label>
                                <input type="text" value={adhocNotes} onChange={e => setAdhocNotes(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold shadow-inner" placeholder="..." />
                            </div>
                        </div>
                        <button onClick={handleAddEntry} className="w-full mt-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-2xl transition-all hover:bg-black active:scale-95">+ إضافة هذا البند للفاتورة</button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight">قائمة أصناف الفاتورة</h2>
                        <div className="space-y-3">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.price > 100 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {(item as any).type}
                                            </span>
                                            <p className="font-black text-gray-900 dark:text-white text-base leading-tight">{item.name}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-bold mt-1">
                                            <span>السعر: {item.price.toLocaleString()} د.ل</span>
                                            <span>التكلفة: {(item as any).costInUSD}$</span>
                                            {(item as any).sourceWebsite && (
                                                <span>المصدر: {
                                                    (() => {
                                                        const raw = (item as any).sourceWebsite;
                                                        const brand = shoppingBrands.find(b => b.id === raw || b.name === raw);
                                                        return brand ? brand.name : raw;
                                                    })()
                                                }</span>
                                            )}
                                            {(item as any).purchaseReference && <span className="font-mono">Ref: {(item as any).purchaseReference}</span>}
                                        </div>
                                        {item.notes && <p className="text-[10px] text-purple-600 font-bold mt-1.5 italic">{item.notes}</p>}
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><TrashIcon /></button>
                                </div>
                            ))}
                            {cart.length === 0 && <div className="py-20 text-center flex flex-col items-center bg-gray-50/50 rounded-3xl border-2 border-dashed"><ShoppingBagIcon className="text-gray-300 mb-2" /><p className="text-gray-400 font-bold">لا توجد أصناف في الفاتورة بعد.</p></div>}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                     <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-lg border">
                        <h2 className="text-xl font-black mb-6 text-purple-700">بيانات العميل</h2>
                        {!selectedCustomer ? (
                            <div className="relative">
                                <input type="text" placeholder="ابحث باسم العميل أو رقم الهاتف..." value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerMenu(true); }} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold" />
                                {showCustomerMenu && customerSearch && (
                                    <ul className="absolute z-[100] w-full bg-white dark:bg-gray-800 border shadow-2xl rounded-2xl mt-2 overflow-hidden animate-fade-in-up">
                                        {filteredClients.map((c, i) => (
                                            <li key={i} onClick={() => { setSelectedCustomer({ id: c.id, name: c.name, phone: c.phone, city: c.city, address: c.address }); setShowCustomerMenu(false); }} className="p-4 hover:bg-purple-50 dark:hover:bg-gray-600 cursor-pointer border-b last:border-0 border-gray-100 font-bold text-sm">{c.name} ({c.phone})</li>
                                        ))}
                                        <li onClick={() => { setSelectedCustomer({ id: 'NEW', name: customerSearch, phone: '', city: '', address: '' }); setShowCustomerMenu(false); }} className="p-4 text-purple-600 font-black hover:bg-purple-50 cursor-pointer">+ عميل جديد: {customerSearch}</li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] border border-purple-200 relative animate-fade-in">
                                <p className="font-black text-purple-900 dark:text-purple-300 text-lg">{selectedCustomer.name}</p>
                                <div className="mt-4 space-y-3">
                                    <div className="space-y-2">
                                        <input type="tel" value={selectedCustomer.phone} onChange={e => setSelectedCustomer({...selectedCustomer, phone: e.target.value})} className="w-full p-3 rounded-xl border border-white dark:bg-gray-800 font-mono" placeholder="رقم الهاتف" />
                                        
                                        {!isPhone2Visible && !selectedCustomer.phone2 ? (
                                            <button 
                                                type="button" 
                                                onClick={() => setIsPhone2Visible(true)} 
                                                className="text-[10px] font-bold text-purple-600 hover:underline mr-2 transition-all"
                                            >
                                                + إضافة رقم هاتف آخر
                                            </button>
                                        ) : (
                                            <div className="relative animate-fade-in">
                                                <input 
                                                    type="tel" 
                                                    value={selectedCustomer.phone2 || ''} 
                                                    onChange={e => setSelectedCustomer({...selectedCustomer, phone2: e.target.value})} 
                                                    className="w-full p-3 rounded-xl border border-white dark:bg-gray-800 font-mono" 
                                                    placeholder="رقم الهاتف الإضافي" 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setIsPhone2Visible(false); setSelectedCustomer({...selectedCustomer, phone2: ''}); }} 
                                                    className="absolute left-3 top-3 text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={selectedCustomer.city} onChange={e => setSelectedCustomer({...selectedCustomer, city: e.target.value})} className="p-3 rounded-xl border border-white dark:bg-gray-800 text-xs font-bold">{LIBYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                        <input type="text" value={selectedCustomer.address} onChange={e => setSelectedCustomer({...selectedCustomer, address: e.target.value})} className="p-3 rounded-xl border border-white dark:bg-gray-800 text-xs font-bold" placeholder="العنوان" />
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 left-4 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl border-b-8 border-yellow-500 relative overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <h2 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">إجمالي قيمة الفاتورة</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center"><span className="text-white/50 font-bold">المجموع الفرعي:</span><span className="text-2xl font-black font-mono">{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between items-center text-white/50"><span className="text-xs">قيمة التخفيض:</span><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-24 p-2 bg-white/10 border-none rounded-xl text-center text-white font-bold" /></div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-white/50">
                                    <span className="text-xs">عربون مستلم:</span>
                                    <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-24 p-2 bg-white/10 border-none rounded-xl text-center text-white font-bold" />
                                </div>
                                {Number(deposit) > 0 && (
                                    <div className="animate-fade-in">
                                        <label className="block text-[9px] font-bold text-gray-400 mb-1">خزينة استلام العربون:</label>
                                        <select 
                                            value={depositTreasuryId} 
                                            onChange={e => setDepositTreasuryId(e.target.value)}
                                            className="w-full p-2 bg-white/10 border-none rounded-xl text-xs text-white font-bold"
                                        >
                                            <option value="" className="text-gray-900">-- اختر الخزينة --</option>
                                            {/* Manual Treasuries */}
                                            {useAppContext().treasuries.filter(t => t.type === TreasuryType.Cash || t.type === TreasuryType.Bank).map(t => (
                                                <option key={t.id} value={t.id} className="text-gray-900">{t.name}</option>
                                            ))}
                                            {/* Admin/SuperAdmin as cash treasuries */}
                                            {useAppContext().users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin').map(u => (
                                                <option key={u.id} value={String(u.id)} className="text-gray-900">{u.name} (كاش)</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center"><span className="text-yellow-400 font-black tracking-widest">باقي المستحق</span><span className="text-4xl font-black font-mono">{(total - (Number(deposit) || 0)).toLocaleString()} <span className="text-xs font-normal opacity-50">د.ل</span></span></div>
                        </div>
                        <div className="mt-10"><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-white/10 rounded-2xl text-xs outline-none focus:bg-white/20 transition-all border-none" rows={3} placeholder="ملاحظات الفاتورة العامة..."></textarea></div>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSaving || cart.length === 0} 
                            className="w-full mt-10 py-5 bg-yellow-500 text-gray-900 rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-yellow-400 transition-all transform active:scale-95 disabled:bg-gray-600 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                'حفظ الفاتورة النهائية'
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-20"></div>
        </div>
    );
};

export default NewSpecialSalePage;
