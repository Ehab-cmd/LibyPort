
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types';

// --- Icons ---
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const ShippingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" /></svg>;
const TotalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 feather feather-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;


const SHIPPING_CLASSES = [
    { name: 'أحذية', weight: 0.60 }, { name: 'اكسسوارات خفيفة', weight: 0.03 }, { name: 'أكواب (مق)', weight: 0.25 },
    { name: 'بجامة قطعتين', weight: 0.30 }, { name: 'تحف', weight: 0.30 }, { name: 'تيشيرت', weight: 0.20 },
    { name: 'جاكيت', weight: 0.80 }, { name: 'جوارب', weight: 0.02 }, { name: 'خواتم وسلاسل وحدايد', weight: 0.03 },
    { name: 'سروال', weight: 0.50 }, { name: 'سروال جينز', weight: 0.60 }, { name: 'شبشب منزل', weight: 0.20 },
    { name: 'عباية', weight: 0.60 }, { name: 'غطاء سرير', weight: 0.80 }, { name: 'فساتين', weight: 0.50 },
    { name: 'فساتين سهرة خفيفة', weight: 0.30 }, { name: 'قوالب سيليكون', weight: 0.07 }, { name: 'كفرات تلفون', weight: 0.04 },
    { name: 'لانجري وملابس داخلية', weight: 0.10 }, { name: 'لوازم أطفال', weight: 0.20 }, { name: 'مكياج', weight: 0.15 },
    { name: 'ملابس أطفال', weight: 0.15 }, { name: 'نظارات', weight: 0.10 }, { name: 'حقائب', weight: 0.70 }
].sort((a, b) => a.name.localeCompare(b.name, 'ar'));

const CURRENCIES = [
    { code: 'USD', name: 'دولار أمريكي ($)', rateToUSD: 1 },
    { code: 'EUR', name: 'يورو (€)', rateToUSD: 1.08 },
    { code: 'TRY', name: 'ليرة تركية (₺)', rateToUSD: 0.031 },
    { code: 'CNY', name: 'يوان صيني (¥)', rateToUSD: 0.14 },
    { code: 'GBP', name: 'جنيه استرليني (£)', rateToUSD: 1.27 },
];

type AddedItem = {
    id: number;
    class: { name: string; weight: number };
    quantity: number;
};

const AddItemModal: React.FC<{ onClose: () => void; onAdd: (itemClass: { name: string; weight: number }, quantity: number) => void }> = ({ onClose, onAdd }) => {
    const { showToast } = useNotification();
    const [selectedClassIndex, setSelectedClassIndex] = useState<number | ''>('');
    const [quantity, setQuantity] = useState(1);

    const handleAdd = () => {
        if (selectedClassIndex === '') {
            showToast('الرجاء اختيار صنف أولاً.', 'error');
            return;
        }
        const itemClass = SHIPPING_CLASSES[selectedClassIndex];
        if (itemClass) {
            onAdd(itemClass, quantity);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
                <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إضافة صنف للشحن</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold text-gray-700 dark:text-gray-200">اختر الصنف</label>
                        <select
                            value={selectedClassIndex}
                            onChange={e => setSelectedClassIndex(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                            <option value="" disabled>-- اختر الصنف --</option>
                            {SHIPPING_CLASSES.map((item, index) => (
                                <option key={index} value={index}>{item.name} ({item.weight} كجم)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700 dark:text-gray-200">الكمية</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                            min="1"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">إلغاء</button>
                    <button type="button" onClick={handleAdd} className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-yellow-600">إضافة للشحن</button>
                </div>
            </div>
        </div>
    );
};

// NEW: Confirmation Modal for deletion
const ConfirmDeleteModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm transform transition-all scale-100 opacity-100">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <TrashIcon />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">تأكيد الحذف</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">هل أنت متأكد من رغبتك في إزالة هذا الصنف من القائمة؟</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium text-sm">إلغاء</button>
                    <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-bold text-sm shadow-sm">نعم، حذف</button>
                </div>
            </div>
        </div>
    </div>
);


const ShippingCalculatorPage: React.FC = () => {
    const { currentUser, exchangeRate, shoppingBrands, shippingOrigins, highValueOrderContact, systemSettings } = useAppContext();
    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    // Step 1 State
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedOriginId, setSelectedOriginId] = useState<string>('');

    // Step 2 State - using string for inputs to allow decimals
    const [hasDiscount, setHasDiscount] = useState<'yes' | 'no' | null>(null);
    const [originalPriceValue, setOriginalPriceValue] = useState('');
    const [discountedPriceValue, setDiscountedPriceValue] = useState('');
    const [originalPriceCurrency, setOriginalPriceCurrency] = useState('USD');
    const [discountedPriceCurrency, setDiscountedPriceCurrency] = useState('USD');
    
    // Internal Shipping State
    const [hasInternalShipping, setHasInternalShipping] = useState(false);
    const [internalShippingCost, setInternalShippingCost] = useState('');


    // Step 3 State
    const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null); // New state for deletion confirmation
    
    // Derived state for calculations
    const isStep1Complete = !!(selectedBrandId && selectedOriginId);
    const selectedOrigin = useMemo(() => shippingOrigins.find(o => o.id === selectedOriginId), [selectedOriginId, shippingOrigins]);

    // Automatically set internal shipping based on selected brand configuration
    useEffect(() => {
        const brand = shoppingBrands.find(b => b.id === selectedBrandId);
        if (brand && brand.defaultInternalShippingCost > 0) {
            setHasInternalShipping(true);
            setInternalShippingCost(String(brand.defaultInternalShippingCost));
        } else {
            setHasInternalShipping(false);
            setInternalShippingCost('');
        }
    }, [selectedBrandId, shoppingBrands]);

     const originalPriceInUSD = useMemo(() => {
        const rate = CURRENCIES.find(c => c.code === originalPriceCurrency)?.rateToUSD || 1;
        return (parseFloat(originalPriceValue) || 0) * rate;
    }, [originalPriceValue, originalPriceCurrency]);

    const discountedPriceInUSD = useMemo(() => {
        const rate = CURRENCIES.find(c => c.code === discountedPriceCurrency)?.rateToUSD || 1;
        return (parseFloat(discountedPriceValue) || 0) * rate;
    }, [discountedPriceValue, discountedPriceCurrency]);
    
    const internalShippingInUSD = useMemo(() => {
        if (!hasInternalShipping) return 0;
        // Assume internal shipping is in the same currency as the final price (discounted or original)
        const activeCurrency = hasDiscount === 'yes' ? discountedPriceCurrency : originalPriceCurrency;
        const rate = CURRENCIES.find(c => c.code === activeCurrency)?.rateToUSD || 1;
        return (parseFloat(internalShippingCost) || 0) * rate;
    }, [hasInternalShipping, internalShippingCost, hasDiscount, discountedPriceCurrency, originalPriceCurrency]);

    const productCost = useMemo(() => {
        // Calculate base product cost in USD
        let baseProductPriceUSD = 0;
        let discountAmount = 0;
        let halfDiscountAmount = 0;
        
        if (hasDiscount === 'yes') {
             const original = originalPriceInUSD;
             const discounted = discountedPriceInUSD;
             
             if (original > 0 && discounted > 0 && discounted < original) {
                 baseProductPriceUSD = discounted;
                 discountAmount = original - discounted;
                 halfDiscountAmount = discountAmount / 2;
                 baseProductPriceUSD += halfDiscountAmount; // Add half discount to cost
             } else {
                 baseProductPriceUSD = discounted > 0 ? discounted : original;
             }
        } else {
            baseProductPriceUSD = originalPriceInUSD;
        }

        // Add Internal Shipping Cost to the base cost BEFORE fees
        const totalAcquisitionCostUSD = baseProductPriceUSD + internalShippingInUSD;
        
        if (totalAcquisitionCostUSD > 1500) {
             return { isHighValue: true, finalPriceUSD: 0, finalPriceLYD: 0, serviceFee: 0, discount: discountAmount, halfDiscount: halfDiscountAmount, internalShippingUSD: internalShippingInUSD, feePercentage: 0 };
        }

        // Fee calculation using system settings
        const commissionRate = (systemSettings?.purchaseCommissionPercentage ?? 5) / 100;
        const serviceFee = totalAcquisitionCostUSD * commissionRate;
        
        const finalPriceUSD = totalAcquisitionCostUSD + serviceFee;

        return {
            isHighValue: false,
            finalPriceUSD,
            finalPriceLYD: finalPriceUSD * exchangeRate,
            serviceFee,
            discount: discountAmount,
            halfDiscount: halfDiscountAmount,
            internalShippingUSD: internalShippingInUSD,
            feePercentage: systemSettings?.purchaseCommissionPercentage ?? 5
        };
    }, [hasDiscount, originalPriceInUSD, discountedPriceInUSD, internalShippingInUSD, exchangeRate, systemSettings]);

    const shippingCost = useMemo(() => {
        if (!selectedOrigin) return { totalWeight: 0, costUSD: 0, costLYD: 0 };
        const totalWeight = addedItems.reduce((sum, item) => sum + item.class.weight * item.quantity, 0);
        const costUSD = totalWeight * selectedOrigin.ratePerKgUSD;
        const costLYD = costUSD * exchangeRate;
        return { totalWeight, costUSD, costLYD };
    }, [addedItems, selectedOrigin, exchangeRate]);

    const grandTotal = productCost.finalPriceLYD + shippingCost.costLYD;

    const handleAddItem = (itemClass: { name: string; weight: number }, quantity: number) => {
        setAddedItems(prev => [...prev, { id: Date.now(), class: itemClass, quantity }]);
        setIsModalOpen(false);
    };
    
    const requestDeleteItem = (id: number) => {
        setItemToDeleteId(id);
    };

    const confirmDeleteItem = () => {
        if (itemToDeleteId !== null) {
            setAddedItems(prev => prev.filter(item => item.id !== itemToDeleteId));
            setItemToDeleteId(null);
        }
    };
    
    const inputClasses = "w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500";
    const selectCurrencyClasses = "p-3 border-r-0 rounded-l-lg rounded-r-none bg-gray-100 dark:bg-gray-600 border dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500";
    const inputWithCurrencyClasses = "flex-grow p-3 border rounded-r-lg rounded-l-none bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500";


    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-full" dir="rtl">
            {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />}
            {/* Delete Confirmation Modal */}
            {itemToDeleteId !== null && (
                <ConfirmDeleteModal 
                    onClose={() => setItemToDeleteId(null)} 
                    onConfirm={confirmDeleteItem} 
                />
            )}

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">حاسبة تكلفة الطلبية</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">احسب تكلفة شحنتك ومنتجاتك بسهولة ودقة</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column (Shipping and Total) */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Step 3 */}
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full flex flex-col transition-opacity duration-300 ${!isStep1Complete ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-gray-700 rounded-full ml-4"><ShippingIcon /></div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">الخطوة 3: تكلفة الشحن</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 w-full mb-4 text-base">
                                + إضافة صنف للشحن
                            </button>
                            <div className="flex-grow space-y-2 min-h-[150px]">
                                {addedItems.length > 0 ? (
                                    addedItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.class.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">الكمية: {item.quantity} | الوزن: {(item.class.weight * item.quantity).toFixed(2)} كجم</p>
                                            </div>
                                            <button onClick={() => requestDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon /></button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">لم يتم إضافة أي أصناف.</div>
                                )}
                            </div>
                             <div className="mt-4 pt-4 border-t-2 border-dashed dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">إجمالي الشحن:</span>
                                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 text-left">الوزن الكلي: {shippingCost.totalWeight.toFixed(2)} كجم</p>
                                </div>
                                <div className="text-left mt-1">
                                    <p className="font-mono font-bold text-xl text-blue-600 dark:text-blue-400">{shippingCost.costUSD.toFixed(2)} $</p>
                                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">≈ {shippingCost.costLYD.toFixed(2)} د.ل</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                         <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-opacity duration-300 ${!isStep1Complete ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-green-100 dark:bg-gray-700 rounded-full ml-4"><TotalIcon /></div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">الخطوة 4: التكلفة الإجمالية النهائية</h2>
                            </div>
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between text-lg"><span className="text-gray-600 dark:text-gray-300">تكلفة المنتجات:</span> <span className="font-semibold">{productCost.finalPriceLYD.toFixed(2)} د.ل</span></div>
                                <div className="flex justify-between text-lg"><span className="text-gray-600 dark:text-gray-300">تكلفة الشحن:</span> <span className="font-semibold">{shippingCost.costLYD.toFixed(2)} د.ل</span></div>
                            </div>
                           <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-dashed dark:border-gray-600">
                               <span className="text-xl font-bold text-gray-800 dark:text-gray-100">الإجمالي:</span>
                               <span className="font-extrabold text-3xl text-green-600">{grandTotal.toFixed(2)} د.ل</span>
                           </div>
                       </div>
                    </div>
                    
                    {/* Right Column (Info and Product Cost) */}
                    <div className="lg:col-span-3 flex flex-col gap-8">
                        {/* Step 1 */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                             <div className="flex items-center mb-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full ml-4"><InfoIcon /></div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">الخطوة 1: المعلومات الأساسية</h2>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1 block">اختر الموقع/الماركة</label>
                                    <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} className={inputClasses} required>
                                        <option value="" disabled>-- اختر --</option>
                                        {shoppingBrands.map(b => <option key={b.id} value={b.id} disabled={!b.isActive}>{b.name}{!b.isActive && ' (متوقف مؤقتاً)'}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1 block">اختر بلد الشحن</label>
                                    <select value={selectedOriginId} onChange={e => setSelectedOriginId(e.target.value)} className={inputClasses} required>
                                        <option value="" disabled>-- اختر --</option>
                                        {shippingOrigins.map(o => <option key={o.id} value={o.id} disabled={!o.isActive}>{o.name} ({o.ratePerKgUSD}$/كجم){!o.isActive && ' (متوقف مؤقتاً)'}</option>)}
                                    </select>
                                </div>
                             </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-opacity duration-300 ${!isStep1Complete ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-yellow-100 dark:bg-gray-700 rounded-full ml-4"><PriceIcon /></div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">الخطوة 2: تكلفة المنتجات</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2 block">هل سعر السلة/المنتج به تخفيض؟</label>
                                    <div className="flex gap-4">
                                        <button onClick={() => setHasDiscount('yes')} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${hasDiscount === 'yes' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>نعم</button>
                                        <button onClick={() => setHasDiscount('no')} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${hasDiscount === 'no' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>لا</button>
                                    </div>
                                </div>

                                {hasDiscount === 'yes' && (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                        <div>
                                            <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1 block">السعر الأساسي ({CURRENCIES.find(c=>c.code === originalPriceCurrency)?.name.split('(')[1].slice(0, -1)})</label>
                                            <div className="flex">
                                                <input type="number" step="any" value={originalPriceValue} onChange={e => setOriginalPriceValue(e.target.value)} className={inputWithCurrencyClasses} />
                                                <select value={originalPriceCurrency} onChange={e => setOriginalPriceCurrency(e.target.value)} className={selectCurrencyClasses}>
                                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                                </select>
                                            </div>
                                            {originalPriceCurrency !== 'USD' && <p className="text-xs text-gray-500 mt-1">≈ {originalPriceInUSD.toFixed(2)} $</p>}
                                        </div>
                                        <div>
                                            <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1 block">السعر بعد التخفيض ({CURRENCIES.find(c=>c.code === discountedPriceCurrency)?.name.split('(')[1].slice(0, -1)})</label>
                                            <div className="flex">
                                                <input type="number" step="any" value={discountedPriceValue} onChange={e => setDiscountedPriceValue(e.target.value)} className={inputWithCurrencyClasses} />
                                                <select value={discountedPriceCurrency} onChange={e => setDiscountedPriceCurrency(e.target.value)} className={selectCurrencyClasses}>
                                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                                </select>
                                            </div>
                                            {discountedPriceCurrency !== 'USD' && <p className="text-xs text-gray-500 mt-1">≈ {discountedPriceInUSD.toFixed(2)} $</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2 text-sm">
                                            <div className="flex justify-between py-2 border-b border-dashed dark:border-gray-700"><span>قيمة التخفيض:</span> <span className="font-mono font-semibold">{productCost.discount?.toFixed(2)} $</span></div>
                                            <div className="flex justify-between py-2 border-b border-dashed dark:border-gray-700"><span>نصف قيمة التخفيض (تضاف للتكلفة):</span> <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{productCost.halfDiscount?.toFixed(2)} $</span></div>
                                        </div>
                                    </div>
                                )}
                                {hasDiscount === 'no' && (
                                     <div className="pt-4 border-t dark:border-gray-700">
                                        <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1 block">سعر المنتج / السلة ({CURRENCIES.find(c=>c.code === originalPriceCurrency)?.name.split('(')[1].slice(0, -1)})</label>
                                        <div className="flex">
                                            <input type="number" step="any" value={originalPriceValue} onChange={e => {setOriginalPriceValue(e.target.value); setDiscountedPriceValue('');}} className={inputWithCurrencyClasses} />
                                            <select value={originalPriceCurrency} onChange={e => setOriginalPriceCurrency(e.target.value)} className={selectCurrencyClasses}>
                                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                            </select>
                                        </div>
                                        {originalPriceCurrency !== 'USD' && <p className="text-xs text-gray-500 mt-1">≈ {originalPriceInUSD.toFixed(2)} $</p>}
                                    </div>
                                )}

                                {/* Internal Shipping Section */}
                                <div className="pt-4 border-t dark:border-gray-700">
                                     <div className="flex items-center mb-2">
                                        <input 
                                            type="checkbox" 
                                            id="internalShipping" 
                                            checked={hasInternalShipping} 
                                            onChange={(e) => setHasInternalShipping(e.target.checked)}
                                            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="internalShipping" className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            يوجد شحن داخلي (مثلاً من موقع أمازون للمخزن)؟
                                        </label>
                                    </div>
                                    {hasInternalShipping && (
                                        <div className="animate-fade-in-up">
                                            <label className="font-semibold text-gray-700 dark:text-gray-200 mb-1 block">تكلفة الشحن الداخلي ({CURRENCIES.find(c=>c.code === (hasDiscount === 'yes' ? discountedPriceCurrency : originalPriceCurrency))?.name.split('(')[1].slice(0, -1)})</label>
                                            <div className="flex">
                                                <input 
                                                    type="number"
                                                    step="any"
                                                    value={internalShippingCost} 
                                                    onChange={e => setInternalShippingCost(e.target.value)} 
                                                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500" 
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">سيتم إضافة هذه التكلفة إلى سعر المنتج قبل احتساب العمولة.</p>
                                        </div>
                                    )}
                                </div>

                                {!productCost.isHighValue && hasDiscount !== null && (
                                    <div className="text-sm mt-2 text-gray-600 dark:text-gray-300 border-t pt-2 border-dashed dark:border-gray-700">
                                        <div className="flex justify-between">
                                            <span>عمولة الشراء ({productCost.feePercentage}%):</span> 
                                            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{productCost.serviceFee.toFixed(2)} $</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t-2 border-dashed dark:border-gray-600">
                                {productCost.isHighValue ? (
                                    <div className="bg-red-100 dark:bg-red-900/30 border-r-4 border-red-500 p-4 rounded-md">
                                        <h3 className="font-bold text-red-800 dark:text-red-200">قيمة الطلبية مرتفعة جداً</h3>
                                        <p className="text-red-700 dark:text-red-300 mt-2">للقيام بطلبيات تزيد قيمتها عن 1500$، يرجى التواصل مباشرة مع الإدارة على الأرقام: <br/><strong className="font-mono">{highValueOrderContact || 'غير محدد'}</strong></p>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg text-gray-700 dark:text-gray-200">التكلفة النهائية للمنتجات:</span>
                                        <div>
                                            <p className="font-mono font-bold text-xl text-yellow-600">{productCost.finalPriceUSD.toFixed(2)} $</p>
                                            <p className="font-mono text-sm text-gray-500 dark:text-gray-400 text-left">≈ {productCost.finalPriceLYD.toFixed(2)} د.ل</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ShippingCalculatorPage;
