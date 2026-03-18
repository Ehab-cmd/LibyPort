import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product, OrderItem, UserRole, OrderType, ProductCategory, PaymentMethod, User, Store, ProductVariant, TreasuryType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { LIBYAN_CITIES, COST_CURRENCIES, CATEGORY_MAP, CATEGORY_SIZES, CATEGORIES_WITHOUT_SIZES } from '../constants';
import { compressImage } from '../utils/imageHelper';
import Breadcrumbs from '../components/Breadcrumbs';

// --- Icons ---
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 00-1.381 1.382L15.211 6.276zM16.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM11 5a3 3 0 11-6 0 3 3 0 016 0zM8 7a1 1 0 00-1 1v9.382l4-2V15a1 1 0 112 0v.382l4 2V8a1 1 0 00-1-1H8z" /></svg>;
const BankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;

// --- نافذة تأكيد سعر المنتج الفوري ---
const InstantPriceConfirmationModal: React.FC<{
    product: Product;
    onClose: () => void;
    onConfirm: (soldPrice: number) => void;
}> = ({ product, onClose, onConfirm }) => {
    const [soldPrice, setSoldPrice] = useState(String(product.price));
    const [error, setError] = useState('');

    const handleConfirm = () => {
        const price = parseFloat(soldPrice);
        if (isNaN(price) || price < product.price) {
            setError(`لا يمكن البيع بسعر أقل من سعر العرض (${product.price} د.ل)`);
            return;
        }
        onConfirm(price);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up border-2 border-yellow-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-2xl"><CubeIcon /></div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">تأكيد سعر البيع (فوري)</h2>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl mb-6 border dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 mb-1">المنتج المختار:</p>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{product.name}</p>
                    <p className="text-xs text-yellow-600 font-black mt-2">سعر العرض في النظام: {product.price} د.ل</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-black text-gray-500 mb-1 mr-2">سعر البيع الفعلي للزبون (د.ل)</label>
                        <input 
                            type="number" 
                            value={soldPrice} 
                            onChange={e => { setSoldPrice(e.target.value); setError(''); }} 
                            className={`w-full p-4 border rounded-2xl dark:bg-gray-700 font-black text-3xl text-center focus:ring-2 focus:ring-yellow-500 outline-none ${error ? 'border-red-500 animate-shake' : 'border-gray-200 dark:border-gray-600'}`}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-[10px] font-bold mt-2 mr-2">{error}</p>}
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">إلغاء</button>
                    <button 
                        onClick={handleConfirm}
                        className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl hover:bg-yellow-600 transition-all transform active:scale-95"
                    >
                        تأكيد وإضافة
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- نافذة إضافة منتج جديد سريعة ---
const QuickAddProductModal: React.FC<{
    onClose: () => void;
    onAdd: (productData: any) => void;
}> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brandId, setBrandId] = useState('');
    const [price, setPrice] = useState('');
    const [cost, setCost] = useState('');
    const [costCurrency, setCostCurrency] = useState('USD');
    const [category, setCategory] = useState<ProductCategory>(ProductCategory.WomenClothing);
    const [sku, setSku] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([{ size: 'Standard', stock: 1 }]);
    const { shoppingBrands } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        const newImages: string[] = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const compressed = await compressImage(files[i]);
                newImages.push(compressed);
            } catch (err) {
                console.error("Image compression failed", err);
            }
        }
        setImages(prev => [...prev, ...newImages]);
    };

    const addVariant = () => {
        setVariants([...variants, { size: '', stock: 1 }]);
    };

    const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        if (!name || !price) return;
        onAdd({
            name,
            description,
            brandId,
            price: parseFloat(price),
            cost: parseFloat(cost) || 0,
            costCurrency,
            category,
            sku,
            sourceUrl,
            images,
            sizes: variants,
            stock: variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
            isInstant: false,
            createdAt: new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[500] p-2 md:p-4 overflow-y-auto" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl border dark:border-gray-700 animate-scale-in my-2 md:my-8 overflow-hidden">
                <div className="p-4 md:p-8 max-h-[92vh] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-4 md:mb-8 border-b dark:border-gray-700 pb-3 md:pb-0 md:border-none">
                        <h2 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white">إضافة منتج لمتجر LibyPort</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-10">
                        {/* Top Section: Media (Moved to top for mobile) */}
                        <div className="lg:col-span-4 space-y-4 md:space-y-8 order-1">
                            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="block text-[9px] md:text-[11px] font-black text-gray-400 uppercase mb-2 text-center">صور المنتج</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl md:rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-all group overflow-hidden relative"
                                >
                                    {images.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-1.5 p-2 w-full h-full overflow-y-auto">
                                            {images.map((img, i) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
                                                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, idx) => idx !== i)); }}
                                                        className="absolute top-0.5 right-0.5 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500">
                                                <PlusIcon />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 md:w-16 md:h-16 bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <p className="text-yellow-600 font-black text-[10px] md:text-sm">ارفع صور المنتج</p>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                </div>
                            </div>

                            <div className="hidden md:block">
                                <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1.5 md:mb-2 mr-2">رابط المنتج الأصلي</label>
                                <input 
                                    type="url" 
                                    value={sourceUrl} 
                                    onChange={e => setSourceUrl(e.target.value)} 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-mono text-[10px] md:text-xs text-left focus:ring-2 focus:ring-yellow-500" 
                                    placeholder="https://..." 
                                />
                            </div>
                        </div>

                        {/* Main Form Section */}
                        <div className="lg:col-span-8 space-y-4 md:space-y-6 order-2">
                            <div>
                                <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1 mr-2">اسم المنتج / الوصف</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold text-sm md:text-lg focus:ring-2 focus:ring-yellow-500 transition-all" 
                                    placeholder="مثال: طقم نسائي ثلاث قطع..." 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1 mr-2">وصف تفصيلي (اختياري)</label>
                                <textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold text-xs md:text-sm focus:ring-2 focus:ring-yellow-500 transition-all min-h-[60px] md:min-h-[100px]" 
                                    placeholder="اكتب تفاصيل إضافية عن المنتج هنا..." 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1 mr-2">الماركة</label>
                                    <select 
                                        value={brandId} 
                                        onChange={e => setBrandId(e.target.value)} 
                                        className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold text-xs md:text-sm focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">-- اختر الماركة --</option>
                                        {shoppingBrands.filter(b => b.isActive).map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1 mr-2">فئة المنتج</label>
                                    <select 
                                        value={category} 
                                        onChange={e => {
                                            const newCat = e.target.value as ProductCategory;
                                            setCategory(newCat);
                                            if (CATEGORIES_WITHOUT_SIZES.includes(newCat)) {
                                                setVariants([{ size: 'Standard', stock: variants[0]?.stock || 1 }]);
                                            }
                                        }} 
                                        className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold text-xs md:text-sm focus:ring-2 focus:ring-yellow-500"
                                    >
                                        {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1 mr-2">سعر البيع (د.ل)</label>
                                    <input 
                                        type="number" 
                                        value={price} 
                                        onChange={e => setPrice(e.target.value)} 
                                        className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-black text-base md:text-xl text-yellow-600 text-center" 
                                        placeholder="0.00" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-400 uppercase mb-1 mr-2">تكلفة الشراء</label>
                                    <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden shadow-inner">
                                        <select 
                                            value={costCurrency} 
                                            onChange={e => setCostCurrency(e.target.value)}
                                            className="bg-transparent border-none font-black text-[9px] md:text-[10px] px-1.5 md:px-2 focus:ring-0"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="LYD">LYD</option>
                                            {COST_CURRENCIES.filter(c => c.code !== 'USD').map(c => (
                                                <option key={c.code} value={c.code}>{c.code}</option>
                                            ))}
                                        </select>
                                        <input 
                                            type="number" 
                                            value={cost} 
                                            onChange={e => setCost(e.target.value)} 
                                            className="w-full p-3 md:p-4 bg-transparent border-none font-black text-sm md:text-lg text-center focus:ring-0" 
                                            placeholder="0.00" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sizes Management & SKU */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border dark:border-gray-700">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 md:mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-purple-600 scale-75"><CubeIcon /></div>
                                        <h3 className="text-[9px] md:text-xs font-black text-purple-600 uppercase">
                                            {CATEGORIES_WITHOUT_SIZES.includes(category) ? 'الكمية والمخزون' : 'المقاسات والمخزون'}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="flex-grow md:w-48">
                                            <input 
                                                type="text" 
                                                value={sku} 
                                                onChange={e => setSku(e.target.value)} 
                                                className="w-full p-2 bg-white dark:bg-gray-800 border-none rounded-xl font-mono font-black text-[10px] md:text-xs text-center shadow-sm" 
                                                placeholder="SKU (رقم تتبع)" 
                                            />
                                        </div>
                                        {!CATEGORIES_WITHOUT_SIZES.includes(category) && (
                                            <button 
                                                onClick={addVariant}
                                                className="bg-purple-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black hover:bg-purple-700 transition-all flex items-center gap-1 shrink-0"
                                            >
                                                <PlusIcon /> إضافة
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-32 md:max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {variants.map((v, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center animate-fade-in">
                                            {!CATEGORIES_WITHOUT_SIZES.includes(category) ? (
                                                <>
                                                    <div className="col-span-6">
                                                        <input 
                                                            type="text" 
                                                            list={`size-suggestions-${category}`}
                                                            value={v.size} 
                                                            onChange={e => updateVariant(idx, 'size', e.target.value)}
                                                            className="w-full p-2 md:p-3 bg-white dark:bg-gray-800 border-none rounded-xl font-bold text-[10px] md:text-sm text-center shadow-sm"
                                                            placeholder="المقاس"
                                                        />
                                                        <datalist id={`size-suggestions-${category}`}>
                                                            {(CATEGORY_SIZES[category] || []).map(size => (
                                                                <option key={size} value={size} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                    <div className="col-span-4">
                                                        <input 
                                                            type="number" 
                                                            value={v.stock} 
                                                            onChange={e => updateVariant(idx, 'stock', e.target.value)}
                                                            className="w-full p-2 md:p-3 bg-white dark:bg-gray-800 border-none rounded-xl font-black text-[10px] md:text-sm text-center shadow-sm"
                                                            placeholder="الكمية"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex justify-center">
                                                        <button 
                                                            onClick={() => removeVariant(idx)}
                                                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="col-span-12">
                                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 md:p-3 rounded-xl shadow-sm">
                                                        <span className="text-[10px] md:text-xs font-bold text-gray-400 mr-2">الكمية المتوفرة:</span>
                                                        <input 
                                                            type="number" 
                                                            value={v.stock} 
                                                            onChange={e => updateVariant(idx, 'stock', e.target.value)}
                                                            className="flex-1 bg-transparent border-none font-black text-sm md:text-lg text-center dark:text-white focus:ring-0" 
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-12">
                        <button 
                            onClick={handleAdd} 
                            className="flex-[2] bg-yellow-500 text-white py-3.5 md:py-5 rounded-xl md:rounded-3xl font-black text-base md:text-xl shadow-xl shadow-yellow-500/30 hover:bg-yellow-600 transition-all transform active:scale-95"
                        >
                            حفظ ونشر المنتج
                        </button>
                        <button 
                            onClick={onClose} 
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-3.5 md:py-5 rounded-xl md:rounded-3xl font-black text-base md:text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SuccessOrderModal: React.FC<{ invoiceId: string; customerName: string; onClose: () => void }> = ({ invoiceId, customerName, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[500] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center transform transition-all animate-fade-in-up border dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/30 mb-6 text-green-500">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم بنجاح!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-bold leading-relaxed">
                تم تسجيل الفاتورة بنجاح للزبون <span className="text-yellow-600 dark:text-yellow-400 font-black">{customerName}</span>.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl mb-8 border dark:border-gray-600">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم الفاتورة</p>
                <span className="font-mono font-black text-2xl text-yellow-600 dark:text-yellow-400 tracking-wider select-all">{invoiceId}</span>
            </div>
            <button onClick={onClose} className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transition-all transform active:scale-95">موافق</button>
        </div>
    </div>
);

const SizeSelectionModal: React.FC<{
    product: Product;
    orderType: OrderType;
    onClose: () => void;
    onAdd: (size: string) => void;
}> = ({ product, orderType, onClose, onAdd }) => {
    const { showToast } = useNotification();
    const normalizedVariants = useMemo(() => {
        const list: ProductVariant[] = [...(product?.sizes || [])];
        // Only add the legacy single size if the specific sizes list is empty
        if (product?.size && list.length === 0) {
            list.unshift({ size: product.size, stock: product.stock });
        }
        return list;
    }, [product]);

    const isInstant = orderType === OrderType.InstantDelivery;
    const [customSize, setCustomSize] = useState('');

    const handleAddCustom = () => {
        if (!customSize.trim()) {
            showToast('يرجى كتابة المقاس', 'error');
            return;
        }
        const exists = normalizedVariants.some(v => v.size.toLowerCase() === customSize.trim().toLowerCase());
        if (exists) {
            showToast('هذا المقاس موجود مسبقاً في القائمة، يرجى اختياره من الأعلى', 'info');
            return;
        }
        onAdd(customSize.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white">اختيار المقاس المطلوب</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {normalizedVariants.length > 0 ? normalizedVariants.map((v, i) => {
                            const noStock = v.stock <= 0;
                            const isDisabled = isInstant && noStock;
                            return (
                                <button key={i} onClick={() => !isDisabled && onAdd(v.size)} disabled={isDisabled} className={`p-3 rounded-xl border-2 text-right transition-all flex justify-between items-center ${isDisabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50' : noStock && !isInstant ? 'border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-500' : 'border-gray-100 dark:border-gray-700 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}>
                                    <span className="font-bold">{v.size}</span>
                                    <span className="text-[10px] font-bold">{noStock ? (isInstant ? 'نفذت الكمية' : 'طلب شحنة جديدة') : `متوفر بالمخزن: ${v.stock}`}</span>
                                </button>
                            );
                        }) : <div className="text-center py-4 text-gray-400 text-sm italic border-2 border-dashed rounded-xl">لم يتم تسجيل أي مقاس لهذا المنتج مسبقاً.</div>}
                    </div>
                    {!isInstant && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <label className="block text-xs font-bold text-gray-500 mb-2">إضافة مقاس جديد تماماً:</label>
                            <div className="flex gap-2">
                                <input type="text" value={customSize} onChange={e => setCustomSize(e.target.value)} placeholder="اكتب المقاس هنا..." className="flex-grow p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-yellow-500" />
                                <button onClick={handleAddCustom} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-600 shadow-sm">إضافة</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewOrderPage: React.FC = () => {
    const { currentUser, stores, products, addOrder, cart, addToCart, removeFromCart, clearCart, orders, updateProduct, t, bankAccounts, treasuries, users, addProduct } = useAppContext();
    const { showToast } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();

    const [storeId, setStoreId] = useState<number | ''>('');
    const [orderType, setOrderType] = useState<OrderType>(OrderType.NewPurchase);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone1: string; phone2?: string; city: string; address: string } | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerMenu, setShowCustomerMenu] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [selectedBankId, setSelectedBankId] = useState<number | ''>('');
    const [discount, setDiscount] = useState('');
    const [deposit, setDeposit] = useState('');
    const [depositTreasuryId, setDepositTreasuryId] = useState<string>('');
    const [collectionTreasuryId, setCollectionTreasuryId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [savedOrderInfo, setSavedOrderInfo] = useState<{ id: string; customerName: string } | null>(null);
    const [productForSize, setProductForSize] = useState<Product | null>(null);
    const [instantPriceProduct, setInstantPriceProduct] = useState<{product: Product, size: string} | null>(null);
    const [isPhone2Visible, setIsPhone2Visible] = useState(false);
    // Added missing isSaving state to handle submission loading
    const [isSaving, setIsSaving] = useState(false);

    const handleAddNewProduct = async (productData: any) => {
        try {
            const newProduct = await addProduct({
                ...productData,
                storeId: storeId || 1,
            });
            addToCart(newProduct, 1, '');
            setIsAddProductModalOpen(false);
            showToast('تم إضافة المنتج الجديد وتلقائياً للسلة', 'success');
        } catch (error) {
            showToast('فشل في إضافة المنتج الجديد', 'error');
        }
    };

    const isAdmin = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;

    const userStores = useMemo(() => {
        if (isAdmin) return stores.filter(s => s.isApproved);
        return stores.filter(s => currentUser?.storeIds.includes(s.id) && s.isApproved);
    }, [stores, currentUser, isAdmin]);

    useEffect(() => {
        if (userStores.length === 1 && !storeId) setStoreId(userStores[0].id);
    }, [userStores]);

    // اختيار متجر LibyPort تلقائياً للمسؤولين عند اختيار "توصيل فوري" إذا لم يتم اختيار متجر
    useEffect(() => {
        if (orderType === OrderType.InstantDelivery && !storeId && isAdmin) {
            const libyPort = userStores.find(s => s.id === 1);
            if (libyPort) setStoreId(1);
        }
    }, [orderType, storeId, isAdmin, userStores]);

    const displayProducts = useMemo(() => {
        const selectedStoreId = storeId ? Number(storeId) : null;
        const search = (productSearch || '').toLowerCase().trim();
        
        // في التوصيل الفوري، نظهر المنتجات حتى لو لم يتم اختيار متجر بعد (نعرض منتجات LibyPort افتراضياً)
        if (!selectedStoreId && orderType !== OrderType.InstantDelivery && !search && selectedCategory === 'all') return [];
        
        return products.filter(p => {
            if (!p || p.isDeleted) return false;
            
            // فلترة الفئة
            if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

            // تحسين البحث ليكون أكثر مرونة ودفاعية
            const name = String(p.name || '').toLowerCase();
            const sku = String(p.sku || '').toLowerCase();
            
            const isSearchMatch = !search || name.includes(search) || sku.includes(search);
            if (!isSearchMatch) return false;

            // تحويل القيم إلى أرقام لضمان دقة المقارنة
            const pStoreId = Number(p.storeId);
            const sStoreId = selectedStoreId ? Number(selectedStoreId) : null;
            const pStock = Number(p.stock || 0);

            if (orderType === OrderType.InstantDelivery) {
                // في التوصيل الفوري:
                // 1. دائماً نظهر منتجات LibyPort (1)
                // 2. أو أي منتج معلم كـ "فوري" (isInstant)
                // 3. أو منتجات المتجر المختار
                // ملاحظة: نظهر فقط المنتجات المتوفرة (Stock > 0) بناءً على طلب المستخدم
                const isLibyPort = pStoreId === 1;
                const isInstant = !!p.isInstant;
                const isSelectedStore = sStoreId !== null && pStoreId === sStoreId;
                
                return (isLibyPort || isInstant || isSelectedStore) && pStock > 0;
            } else {
                // في الطلبات العادية (طلب شراء جديد):
                // نظهر كل المنتجات المتوفرة في LibyPort أو المتجر المختار بغض النظر عن المخزون
                if (pStoreId === 1) {
                    // نظهر منتجات LibyPort دائماً عند البحث أو اختيار فئة، أو إذا كان هو المتجر المختار
                    return sStoreId === 1 || !!search || selectedCategory !== 'all';
                }
                return sStoreId !== null && pStoreId === sStoreId;
            }
        });
    }, [products, storeId, productSearch, orderType, isAdmin, selectedCategory]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        const lowerSearch = customerSearch.toLowerCase();
        const map = new Map();
        orders.filter(o => !o.isDeleted && (isAdmin || o.storeId === Number(storeId))).forEach(o => {
            if (!map.has(o.phone1)) map.set(o.phone1, { name: o.customerName, phone1: o.phone1, phone2: o.phone2 || '', city: o.city, address: o.address });
        });
        return Array.from(map.values()).filter((c: any) => c.name.toLowerCase().includes(lowerSearch) || c.phone1.includes(lowerSearch)).slice(0, 5);
    }, [customerSearch, orders, storeId, isAdmin]);

    const subtotal = useMemo(() => (cart || []).reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
    const total = subtotal - (parseFloat(discount) || 0);

    const handleProductClick = (p: Product) => {
        if (CATEGORIES_WITHOUT_SIZES.includes(p.category)) {
            if (orderType === OrderType.InstantDelivery) {
                setInstantPriceProduct({ product: p, size: 'Standard' });
            } else {
                finalizeAddToCart(p, 'Standard');
            }
            return;
        }
        setProductForSize(p);
    };

    const handleAddWithSize = async (size: string) => {
        if (!productForSize) return;
        // إذا كان نوع الطلب "توصيل فوري"، نطلب تأكيد السعر دائماً لضمان مرونة البيع المباشر
        if (orderType === OrderType.InstantDelivery) {
            setInstantPriceProduct({ product: productForSize, size });
            setProductForSize(null);
        } else {
            finalizeAddToCart(productForSize, size);
            setProductForSize(null);
        }
    };

    const handleConfirmInstantPrice = (soldPrice: number) => {
        if (instantPriceProduct) {
            finalizeAddToCart(instantPriceProduct.product, instantPriceProduct.size, soldPrice);
            setInstantPriceProduct(null);
        }
    };

    const finalizeAddToCart = (p: Product, size: string, soldPrice?: number) => {
        const finalPrice = soldPrice !== undefined ? soldPrice : p.price;
        const basePrice = p.price; // سعر العرض في النظام

        addToCart({ 
            ...p, 
            productId: p.id, 
            quantity: 1, 
            size: size || p.size || '', 
            price: finalPrice, 
            basePriceSnapshot: basePrice 
        } as any, 1, size);
    };

    const handleSubmit = async () => {
        if (!storeId) {
            showToast('يرجى اختيار المتجر', 'error');
            return;
        }
        if (!selectedCustomer) {
            showToast('يرجى اختيار زبون', 'error');
            return;
        }
        if (!selectedCustomer.phone1) {
            showToast('رقم الهاتف الأساسي مطلوب', 'error');
            return;
        }
        if (cart.length === 0) {
            showToast('السلة فارغة', 'error');
            return;
        }
        
        setIsSaving(true);
        const depositTreasury = Number(deposit) > 0 ? treasuries.find(t => String(t.id) === String(depositTreasuryId)) : null;
        const depositTreasuryType = depositTreasury ? depositTreasury.type : (users.find(u => String(u.id) === String(depositTreasuryId)) ? TreasuryType.Cash : undefined);

        const colTreasury = orderType === OrderType.InstantDelivery ? treasuries.find(t => String(t.id) === String(collectionTreasuryId)) : null;
        const colTreasuryType = colTreasury ? colTreasury.type : (users.find(u => String(u.id) === String(collectionTreasuryId)) ? TreasuryType.Cash : undefined);

        const result = await addOrder({
            storeId: Number(storeId),
            customerName: selectedCustomer.name,
            phone1: selectedCustomer.phone1,
            phone2: selectedCustomer.phone2,
            city: selectedCustomer.city,
            address: selectedCustomer.address,
            items: cart,
            total,
            orderType: orderType,
            productType: ProductCategory.Miscellaneous,
            paymentMethod,
            bankTransferDetails: selectedBankId ? (bankAccounts.find(b => b.id === selectedBankId)?.bankName || '') : '',
            notes,
            discount: Number(discount) || 0,
            deposit: Number(deposit) || 0,
            depositTreasuryId: Number(deposit) > 0 ? depositTreasuryId : undefined,
            depositTreasuryType: depositTreasuryType,
            isDepositPaid: Number(deposit) > 0 && !!depositTreasuryId,
            collectionTreasuryId: orderType === OrderType.InstantDelivery ? collectionTreasuryId : undefined,
            collectedToTreasury: colTreasuryType,
            isPaymentConfirmed: orderType === OrderType.InstantDelivery && !!collectionTreasuryId
        });

        setIsSaving(false);
        if (result.success) {
            showToast('تم إنشاء الطلبية بنجاح', 'success');
            setSavedOrderInfo({ id: result.id!, customerName: selectedCustomer.name });
            clearCart();
        } else {
            showToast(result.message, 'error');
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-12 px-4" dir="rtl">
            {savedOrderInfo && (
                <SuccessOrderModal 
                    invoiceId={savedOrderInfo.id} 
                    customerName={savedOrderInfo.customerName} 
                    onClose={() => { setSavedOrderInfo(null); navigate('/orders'); }} 
                />
            )}
            
            {productForSize && (
                <SizeSelectionModal product={productForSize} orderType={orderType} onClose={() => setProductForSize(null)} onAdd={handleAddWithSize} />
            )}

            {instantPriceProduct && (
                <InstantPriceConfirmationModal 
                    product={instantPriceProduct.product} 
                    onClose={() => setInstantPriceProduct(null)} 
                    onConfirm={handleConfirmInstantPrice} 
                />
            )}

            <div className="mb-6">
                <Breadcrumbs items={[{ label: 'لوحة التحكم', path: '/dashboard' }, { label: 'الفواتير', path: '/orders' }, { label: 'فاتورة جديدة', path: undefined }]} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-sm mb-4 md:mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 md:p-2 rounded-lg"><CubeIcon /></div>
                        <div className="flex-grow">
                            <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-0.5 md:mb-1">اختر المتجر</label>
                            <select value={storeId} onChange={e => setStoreId(Number(e.target.value))} className="w-full md:w-64 p-1.5 md:p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 text-xs md:text-sm">
                                <option value="">-- اختر المتجر --</option>
                                {userStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto no-scrollbar">
                        {[OrderType.NewPurchase, OrderType.InstantDelivery, OrderType.DepositPurchase].map(type => (
                            <button key={type} onClick={() => setOrderType(type)} className={`flex-1 md:flex-none whitespace-nowrap px-3 md:px-6 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-bold transition-all ${orderType === type ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{type}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
                {/* 1. بيانات الزبون - تظهر في الأعلى دائماً */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-5 relative">
                     <div className="flex items-center justify-between mb-3 md:mb-5 border-b dark:border-gray-700 pb-2 md:pb-3">
                        <h3 className="text-sm md:text-base font-bold flex items-center gap-2 text-gray-800 dark:text-white"><UserIcon /> بيانات الزبون</h3>
                    </div>

                    {!selectedCustomer ? (
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="ابحث بالاسم أو الهاتف..." 
                                value={customerSearch} 
                                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerMenu(true); }} 
                                className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-all shadow-inner" 
                            />
                            {showCustomerMenu && customerSearch && (
                                <ul className="absolute z-[130] w-full bg-white dark:bg-gray-700 border shadow-2xl rounded-xl text-sm mt-2 overflow-hidden animate-fade-in-up">
                                    {filteredCustomers.map((c: any, i) => (
                                        <li key={i} onClick={() => { setSelectedCustomer(c); setShowCustomerMenu(false); }} className="p-4 hover:bg-yellow-50 dark:hover:bg-gray-600 cursor-pointer border-b last:border-0 border-gray-100 font-bold">{c.name} ({c.phone1})</li>
                                    ))}
                                    <li onClick={() => { setSelectedCustomer({ name: customerSearch, phone1: '', city: '', address: '' }); setShowCustomerMenu(false); }} className="p-4 text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">+ إضافة زبون جديد: {customerSearch}</li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <input type="text" value={selectedCustomer.name} onChange={e => setSelectedCustomer({...selectedCustomer, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-700 font-bold text-sm" placeholder="اسم الزبون" />
                                <div className="space-y-2">
                                    <input type="tel" value={selectedCustomer.phone1} onChange={e => setSelectedCustomer({...selectedCustomer, phone1: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-700 font-mono text-sm" placeholder="رقم الهاتف" required />
                                    
                                    {!isPhone2Visible && !selectedCustomer.phone2 ? (
                                        <button 
                                            type="button" 
                                            onClick={() => setIsPhone2Visible(true)} 
                                            className="text-[10px] font-bold text-blue-600 hover:underline mr-2 transition-all"
                                        >
                                            + إضافة رقم هاتف آخر
                                        </button>
                                    ) : (
                                        <div className="relative animate-fade-in">
                                            <input 
                                                type="tel" 
                                                value={selectedCustomer.phone2 || ''} 
                                                onChange={e => setSelectedCustomer({...selectedCustomer, phone2: e.target.value})} 
                                                className="w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-700 font-mono text-sm" 
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
                                <select value={selectedCustomer.city} onChange={e => setSelectedCustomer({...selectedCustomer, city: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-700 text-xs font-bold" required>
                                    <option value="">المدينة</option>
                                    {LIBYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input type="text" value={selectedCustomer.address} onChange={e => setSelectedCustomer({...selectedCustomer, address: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-700 text-xs" placeholder="العنوان بالتفصيل" />
                            </div>
                            <button type="button" onClick={() => setSelectedCustomer(null)} className="text-[11px] font-bold text-red-500 hover:underline">تغيير الزبون</button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* 2. اختيار المنتجات */}
                    <div className="w-full lg:flex-grow space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                                    <CubeIcon /> {orderType === OrderType.InstantDelivery ? 'المنتجات الفورية المتوفرة' : 'اختر المنتجات من المخزن'}
                                </h2>
                                {orderType === OrderType.NewPurchase && (
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddProductModalOpen(true)}
                                        className="text-[10px] md:text-xs font-black text-yellow-600 hover:text-yellow-700 flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg transition-colors border border-yellow-100 dark:border-yellow-800"
                                    >
                                        <PlusIcon /> إضافة منتج جديد
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-row gap-2 md:gap-3 items-center">
                                <div className="relative flex-grow">
                                    <input 
                                        type="text" 
                                        placeholder="بحث بالاسم أو SKU..." 
                                        value={productSearch} 
                                        onChange={e => setProductSearch(e.target.value)} 
                                        className="w-full p-2.5 md:p-3 pr-10 md:pr-12 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-xs md:text-sm" 
                                    />
                                    <div className="absolute right-3 md:right-4 top-2.5 md:top-3 text-gray-400 scale-75 md:scale-90"><SearchIcon /></div>
                                </div>
                                <div className="relative w-32 md:w-48 flex-shrink-0">
                                    <select 
                                        value={selectedCategory} 
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="w-full appearance-none p-2.5 md:p-3 pr-8 md:pr-10 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none font-black text-[10px] md:text-xs bg-white dark:text-white cursor-pointer"
                                    >
                                        <option value="all">📁 الكل</option>
                                        {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
                                            <option key={key} value={key}>{cat.icon} {cat.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-2.5 md:right-3 md:top-3 text-gray-400 pointer-events-none scale-75 md:scale-90">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2 md:gap-4 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-1 md:pr-2">
                                {displayProducts.map(p => {
                                    const isOutOfStock = p.stock <= 0;
                                    return (
                                        <div key={p.id} onClick={() => handleProductClick(p)} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-2 md:p-3 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-yellow-500 hover:shadow-md transition-all group relative overflow-hidden">
                                            <div className="aspect-[4/5] bg-gray-50 dark:bg-gray-800 rounded-lg mb-1.5 md:mb-2 overflow-hidden relative">
                                                {p.image ? (
                                                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-300 text-[10px] text-center p-2">
                                                        <CubeIcon />
                                                        <span>لا توجد صورة</span>
                                                    </div>
                                                )}
                                                
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg transform -rotate-12">نفذت الكمية</span>
                                                    </div>
                                                )}
                                                
                                                <div className="absolute top-1 left-1 flex flex-col gap-1">
                                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black shadow-sm ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        مخزون: {p.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-black text-[10px] text-gray-900 dark:text-gray-100 truncate leading-tight">{p.name}</p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-1">
                                                        <div className="text-purple-600 scale-50 -ml-1"><CubeIcon /></div>
                                                        <p className="text-[8px] text-gray-400 font-mono truncate">{p.sku}</p>
                                                    </div>
                                                    <p className="text-yellow-600 font-black text-[11px] whitespace-nowrap">{p.price.toLocaleString()} د.ل</p>
                                                </div>
                                            </div>
                                            
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>
                                        </div>
                                    );
                                })}
                                {displayProducts.length === 0 && (
                                    <div className="col-span-full py-24 text-center flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300">
                                            <SearchIcon />
                                        </div>
                                        <p className="text-gray-400 text-xs font-bold italic">
                                            {storeId ? 'لا توجد منتجات مطابقة لخيارات البحث والفلترة.' : 'يرجى اختيار المتجر أولاً لاستعراض المنتجات.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. محتويات الفاتورة */}
                    <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-[400px]">
                            <div className="p-3 md:p-4 border-b bg-gray-50 dark:bg-gray-700/30 font-bold flex items-center justify-between text-gray-800 dark:text-white text-sm">
                                <div className="flex items-center gap-2"><CartIcon /> محتويات الفاتورة</div>
                                <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-lg text-[10px]">{cart.length} منتجات</span>
                            </div>
                            <div className="flex-grow p-3 md:p-4 space-y-2 md:space-y-3 overflow-y-auto max-h-[300px] md:max-h-[450px]">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group border-b dark:border-gray-700 pb-1.5 md:pb-2 last:border-0">
                                        <div className="min-w-0 flex-grow">
                                            <p className="text-[10px] md:text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                                            <p className="text-[9px] md:text-[10px] text-yellow-600 font-bold">{item.price.toLocaleString()} د.ل × {item.quantity} {item.size && <span className="text-gray-400">({item.size})</span>}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.productId, item.size)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><TrashIcon /></button>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                                        <CartIcon />
                                        <p className="text-[10px] font-bold">السلة فارغة حالياً</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 md:p-4 border-t bg-gray-50 dark:bg-gray-700/20 space-y-2 md:space-y-3">
                                <div className="flex justify-between text-xs md:text-sm"><span>{t('subtotal')}:</span> <span className="font-bold">{subtotal.toLocaleString()} د.ل</span></div>
                                <div className="flex justify-between items-center text-red-600 text-xs md:text-sm"><span>{t('discount')}:</span><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-16 md:w-20 p-1 md:p-1.5 border rounded-lg text-left text-[10px] md:text-xs bg-white dark:bg-gray-800" placeholder="0.00" /></div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-green-600 text-xs md:text-sm">
                                        <span>العربون:</span>
                                        <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-16 md:w-20 p-1 md:p-1.5 border rounded-lg text-left text-[10px] md:text-xs bg-white dark:bg-gray-800" placeholder="0.00" />
                                    </div>
                                    {orderType === OrderType.InstantDelivery && (
                                        <div className="animate-fade-in">
                                            <label className="block text-[9px] font-bold text-gray-400 mb-1">خزينة استلام المبلغ (توصيل فوري):</label>
                                            <select 
                                                value={collectionTreasuryId} 
                                                onChange={e => setCollectionTreasuryId(e.target.value)}
                                                className="w-full p-1.5 border rounded-lg text-[10px] bg-white dark:bg-gray-800 border-yellow-500"
                                            >
                                                <option value="">-- اختر الخزينة --</option>
                                                {/* Manual Treasuries */}
                                                {treasuries.filter(t => t.type === TreasuryType.Cash || t.type === TreasuryType.Bank).map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                                {/* Admin/SuperAdmin as cash treasuries */}
                                                {users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin').map(u => (
                                                    <option key={u.id} value={String(u.id)}>{u.name} (كاش)</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {Number(deposit) > 0 && (
                                        <div className="animate-fade-in">
                                            <label className="block text-[9px] font-bold text-gray-400 mb-1">خزينة استلام العربون:</label>
                                            <select 
                                                value={depositTreasuryId} 
                                                onChange={e => setDepositTreasuryId(e.target.value)}
                                                className="w-full p-1.5 border rounded-lg text-[10px] bg-white dark:bg-gray-800 border-green-200"
                                            >
                                                <option value="">-- اختر الخزينة --</option>
                                                {/* Manual Treasuries */}
                                                {treasuries.filter(t => t.type === TreasuryType.Cash || t.type === TreasuryType.Bank).map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                                {/* Admin/SuperAdmin as cash treasuries */}
                                                {users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin').map(u => (
                                                    <option key={u.id} value={String(u.id)}>{u.name} (كاش)</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center py-2 md:py-3 bg-gray-900 text-white px-3 md:px-4 rounded-xl shadow-lg"><span className="text-xs md:text-sm">المطلوب تحصيله:</span><span className="text-lg md:text-xl font-black">{total.toLocaleString()} <span className="text-[10px] font-normal opacity-50">د.ل</span></span></div>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={isSaving || cart.length === 0} 
                                    className="w-full bg-yellow-500 text-white py-3 md:py-4 rounded-2xl font-black shadow-xl hover:bg-yellow-600 transition-all active:scale-95 disabled:bg-gray-400 text-sm md:text-base flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        'حفظ الفاتورة'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isAddProductModalOpen && (
                <QuickAddProductModal 
                    onClose={() => setIsAddProductModalOpen(false)} 
                    onAdd={handleAddNewProduct} 
                />
            )}
        </div>
    );
};

export default NewOrderPage;