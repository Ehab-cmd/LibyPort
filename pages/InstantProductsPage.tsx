
import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product, ProductCategory, UserRole, ProductVariant, OrderType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { compressImage } from '../utils/imageHelper';
import { useNotification } from '../context/NotificationContext';
import Breadcrumbs from '../components/Breadcrumbs';
import SuccessModal from '../components/SuccessModal';
import { COST_CURRENCIES, CATEGORY_MAP, CATEGORY_SIZES, CATEGORIES_WITHOUT_SIZES } from '../constants';

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const InstantProductCard = React.memo<{ 
    product: Product; 
    onQuickView: (p: Product) => void;
    onFullView: (p: number) => void;
    onAddToCart: (p: Product) => void;
    brandName?: string;
}>(({ product, onQuickView, onFullView, onAddToCart, brandName }) => {
    const [hoverIndex, setHoverIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const longPressTimer = useRef<any>(null);
    const isOutOfStock = product.stock <= 0;

    const allImages = useMemo(() => {
        const imgs = [];
        if (product.image) imgs.push(product.image);
        if (product.images) imgs.push(...product.images);
        return imgs;
    }, [product]);

    useEffect(() => {
        let interval: any;
        if (isHovered && allImages.length > 1) {
            interval = setInterval(() => {
                setHoverIndex(prev => (prev + 1) % allImages.length);
            }, 1200);
        } else {
            setHoverIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, allImages.length]);

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            onQuickView(product);
        }, 600);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    return (
        <div 
            className={`bg-white dark:bg-gray-800 rounded-[1rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 animate-fade-in-up ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                onClick={() => onFullView(product.id)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img 
                    src={allImages[hoverIndex] || 'https://up6.cc/2025/10/176278012677161.jpg'} 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
                    alt={product.name} 
                />
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] hidden md:flex"
                >
                    <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <EyeIcon /> عرض سريع
                    </div>
                </button>

                {allImages.length > 1 && isHovered && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10 px-4">
                        {allImages.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === hoverIndex ? 'w-4 bg-yellow-500 shadow-sm' : 'w-1 bg-white/50'}`}></div>
                        ))}
                    </div>
                )}

                {isOutOfStock ? (
                    <div className="absolute inset-0 z-10 bg-white/20 dark:bg-black/20 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[6px] md:text-[10px] font-black px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl shadow-2xl uppercase transform -rotate-12 border md:border-2 border-white">نافذ</span>
                    </div>
                ) : (
                    <div className="absolute top-1.5 md:top-4 right-1.5 md:right-4 flex flex-col gap-2">
                         <span className="bg-emerald-500 text-white text-[6px] md:text-[9px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg uppercase">فوري</span>
                    </div>
                )}
            </div>
            <div className="p-1.5 md:p-5 flex flex-col flex-grow">
                <h3 onClick={() => onFullView(product.id)} className="font-black text-gray-900 dark:text-white text-[8px] md:text-sm leading-tight mb-0.5 md:mb-2 truncate cursor-pointer hover:text-yellow-600 transition-colors" title={product.name}>{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[6px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{CATEGORY_MAP[product.category]?.label || product.category}</p>
                    {brandName && <p className="text-[6px] md:text-[8px] text-yellow-600 font-bold truncate">{brandName}</p>}
                </div>
                <div className="mt-auto pt-1.5 md:pt-4 flex justify-between items-end">
                    <div>
                        <p className="text-[6px] md:text-[9px] text-gray-400 font-black uppercase mb-0 md:mb-1">السعر</p>
                        <p className="text-xs md:text-xl font-black text-yellow-600 dark:text-yellow-400">{product.price.toLocaleString()} <span className="text-[6px] md:text-[10px]">د.ل</span></p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} 
                        disabled={isOutOfStock}
                        className={`w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 hover:scale-110'}`}
                    >
                        <div className="scale-75 md:scale-100">
                            <PlusIcon />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
});

const ProductQuickViewModal = React.memo<{
    product: Product;
    canManage: boolean;
    onClose: () => void;
    onFullView: (p: number) => void;
    onAddToCart: (p: Product, size: string) => void;
    brandName?: string;
}>(({ product, canManage, onClose, onFullView, onAddToCart, brandName }) => {
    const { showToast } = useNotification();
    const [activeImg, setActiveImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const allImages = useMemo(() => {
        const imgs = [];
        if (product.image) imgs.push(product.image);
        if (product.images) imgs.push(...product.images);
        return imgs;
    }, [product]);

    const sizes = product.sizes || [];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[200] p-4" dir="rtl" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col md:flex-row border dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-1/2 h-80 md:h-auto relative bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center border-l dark:border-gray-700">
                    <button onClick={onClose} className="absolute top-6 left-6 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-500 hover:text-red-500 transition-all shadow-md md:hidden">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
                    </button>
                    
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-xl">
                        <img src={allImages[activeImg]} className="w-full h-full object-cover transition-all" />
                    </div>

                    {allImages.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide w-full justify-center">
                            {allImages.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-yellow-500 scale-105' : 'border-transparent opacity-50'}`}>
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">{CATEGORY_MAP[product.category]?.label || product.category}</span>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-4 leading-tight">{product.name}</h2>
                            <p className="font-mono text-xs text-gray-400 font-bold mt-2 uppercase tracking-tighter">SKU: {product.sku}</p>
                        </div>
                        {canManage && (
                            <button 
                                onClick={() => onFullView(product.id)}
                                className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-200 rounded-2xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm group"
                                title="إدارة وتعديل المنتج"
                            >
                                <CogIcon />
                            </button>
                        )}
                    </div>

                    <div className="mb-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">اختر المقاس المطلوب</p>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((s, i) => (
                                <button 
                                    key={i} 
                                    disabled={s.stock <= 0}
                                    onClick={() => setSelectedSize(s.size)}
                                    className={`px-6 py-3 rounded-2xl font-black text-xs border-2 transition-all ${selectedSize === s.size ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : s.stock <= 0 ? 'opacity-30 border-gray-100 dark:border-gray-700 cursor-not-allowed' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-yellow-200'}`}
                                >
                                    {s.size}
                                    <span className="block text-[8px] font-bold opacity-60 mt-0.5">{s.stock <= 0 ? 'نافذ' : `متوفر: ${s.stock}`}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">السعر النهائي</p>
                            <p className="text-4xl font-black text-yellow-600 dark:text-yellow-400">{product.price.toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
                        </div>
                        <button 
                            onClick={() => {
                                if (sizes.length > 0 && !selectedSize) {
                                    showToast('الرجاء اختيار مقاس', 'error');
                                    return;
                                }
                                onAddToCart(product, selectedSize || product.size || 'Standard');
                                onClose();
                            }}
                            className="w-full sm:w-auto px-12 py-4 bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <ShoppingBagIcon /> إضافة للسلة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const AddInstantProductModal: React.FC<{
    onClose: () => void;
    onSave: (productData: any[]) => Promise<void>;
}> = ({ onClose, onSave }) => {
    const { showToast } = useNotification();
    const { shoppingBrands } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brandId, setBrandId] = useState('');
    const [price, setPrice] = useState<string>(''); 
    const [cost, setCost] = useState<string>('');
    const [costCurrency, setCostCurrency] = useState('USD');
    const [sku, setSku] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState<ProductCategory>(ProductCategory.WomenClothing);
    const [images, setImages] = useState<string[]>([]);
    const [sizes, setSizes] = useState<ProductVariant[]>([{ size: 'Standard', stock: 1 }]);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedProductName, setSavedProductName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImgs: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const compressed = await compressImage(files[i], 1000, 0.8);
                newImgs.push(compressed);
            }
            setImages(prev => [...prev, ...newImgs]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddSizeField = () => {
        setSizes([...sizes, { size: '', stock: 1 }]);
    };

    const handleRemoveSizeField = (index: number) => {
        if (sizes.length > 1) {
            setSizes(sizes.filter((_, i) => i !== index));
        }
    };

    const handleSizeChange = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newSizes = [...sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setSizes(newSizes);
    };

    const handleSave = async () => {
        if (!name || price === '') {
            showToast('يرجى تعبئة الحقول المطلوبة (الاسم والسعر).', 'error');
            return;
        }
        if (sizes.some(s => !s.size.trim())) {
            showToast('يرجى كتابة اسم لكل مقاس مضاف', 'error');
            return;
        }

        const rate = COST_CURRENCIES.find(c => c.code === costCurrency)?.rateToUSD || 1;
        const convertedCostUSD = (parseFloat(cost) || 0) * rate;
        
        const totalStock = (sizes || []).reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

        setIsSaving(true);
        try {
            const finalProduct = {
                name,
                description,
                brandId,
                price: parseFloat(price),
                costInUSD: convertedCostUSD,
                sku: sku || `INST-${Date.now()}`,
                category,
                url,
                image: images[0] || undefined, 
                images: images.slice(1), 
                sizes: sizes,
                stock: totalStock,
                isInstant: true,
                storeId: 1 
            };
            await onSave([finalProduct]);
            setSavedProductName(name);
            setShowSuccess(true);
        } catch (e) {
            showToast('حدث خطأ أثناء محاولة الحفظ، يرجى المحاولة لاحقاً.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (showSuccess) {
        return (
            <SuccessModal 
                isOpen={true} 
                onClose={onClose} 
                title="تم الحفظ بنجاح" 
                message="تم إضافة المنتج الجديد إلى المتجر بنجاح" 
                itemName={savedProductName}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-2 md:p-4 overflow-y-auto" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-3 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl animate-fade-in-up my-2 md:my-8 overflow-hidden">
                <div className="max-h-[92vh] overflow-y-auto custom-scrollbar pr-1">
                    <div className="flex justify-between items-center mb-3 md:mb-8 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 md:pb-0 md:border-none">
                        <h2 className="text-base md:text-2xl font-black">إضافة منتج لمتجر LibyPort</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-8">
                        {/* Top Section: Images */}
                        <div className="lg:col-span-4 space-y-2 md:space-y-6 order-1">
                            <div className="bg-gray-50 dark:bg-gray-900/30 p-1.5 md:p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2 text-center">صور المنتج</label>
                                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="aspect-square relative rounded-lg md:rounded-xl overflow-hidden border dark:border-gray-700 group">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => removeImage(idx)} 
                                                className="absolute top-0.5 right-0.5 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                                            </button>
                                            {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-[7px] text-white font-black text-center py-0.5 uppercase">الأساسية</span>}
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group overflow-hidden bg-white dark:bg-gray-900/50"
                                    >
                                        <div className="w-5 h-5 mb-0.5 text-gray-300 group-hover:text-yellow-500 transition-colors">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <span className="text-[7px] md:text-[9px] font-black text-yellow-600">إضافة</span>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                            </div>

                            <div className="hidden md:block">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">رابط المنتج الأصلي</label>
                                <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-mono text-xs focus:ring-2 focus:ring-yellow-500" placeholder="https://..." />
                            </div>
                        </div>

                        {/* Main Form Section */}
                        <div className="lg:col-span-8 space-y-4 md:space-y-6 order-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">اسم المنتج</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 shadow-inner dark:text-white text-sm md:text-base" placeholder="مثال: طقم نسائي ثلاث قطع..." />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">الماركة</label>
                                        <select 
                                            value={brandId} 
                                            onChange={e => setBrandId(e.target.value)} 
                                            className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 shadow-inner dark:text-white text-xs md:text-sm"
                                        >
                                            <option value="">-- اختر الماركة --</option>
                                            {shoppingBrands.filter(b => b.isActive).map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">وصف المنتج</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 shadow-inner dark:text-white min-h-[60px] md:min-h-[100px] text-xs md:text-sm" placeholder="اكتب وصفاً مفصلاً للمنتج هنا..." />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">فئة المنتج</label>
                                    <select 
                                        value={category} 
                                        onChange={e => {
                                            const newCat = e.target.value as ProductCategory;
                                            setCategory(newCat);
                                            if (CATEGORIES_WITHOUT_SIZES.includes(newCat)) {
                                                setSizes([{ size: 'Standard', stock: sizes[0]?.stock || 1 }]);
                                            }
                                        }} 
                                        className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold dark:text-white text-xs md:text-sm"
                                    >
                                        {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">سعر البيع (د.ل)</label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-black text-base md:text-xl text-green-600 text-center" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 mr-2">تكلفة الشراء</label>
                                    <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden shadow-inner">
                                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full p-3 md:p-4 bg-transparent border-none font-black text-sm md:text-lg text-center dark:text-white focus:ring-0" placeholder="0.00" />
                                        <select value={costCurrency} onChange={e => setCostCurrency(e.target.value)} className="p-2 md:p-4 bg-gray-100 dark:bg-gray-700 font-black text-[9px] md:text-[10px] border-r border-white/10 dark:text-gray-300 focus:ring-0">
                                            {COST_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code.split(' ')[0]}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                                    <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">SKU (رقم تتبع داخلي)</label>
                                    <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 border-none rounded-xl md:rounded-2xl font-mono text-xs dark:text-white shadow-sm" placeholder="INST-..." />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-widest mr-2">
                                            {CATEGORIES_WITHOUT_SIZES.includes(category) ? 'الكمية والمخزون' : 'المقاسات والمخزون'}
                                        </label>
                                        {!CATEGORIES_WITHOUT_SIZES.includes(category) && (
                                            <button type="button" onClick={handleAddSizeField} className="text-[8px] md:text-[9px] font-black bg-purple-600 text-white px-2.5 py-1 rounded-lg shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">+ إضافة</button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2 max-h-32 md:max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {sizes.map((s, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-center animate-fade-in-up">
                                                {!CATEGORIES_WITHOUT_SIZES.includes(category) ? (
                                                    <>
                                                        <div className="col-span-6">
                                                            <input 
                                                                type="text" 
                                                                list={`size-suggestions-${category}`}
                                                                value={s.size} 
                                                                onChange={e => handleSizeChange(idx, 'size', e.target.value)}
                                                                className="w-full p-2 bg-white dark:bg-gray-800 border-none rounded-lg font-bold text-[10px] shadow-sm" 
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
                                                                value={s.stock} 
                                                                onChange={e => handleSizeChange(idx, 'stock', Number(e.target.value))}
                                                                className="w-full p-2 bg-white dark:bg-gray-800 border-none rounded-lg font-black text-[10px] text-center shadow-sm" 
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 flex justify-center">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveSizeField(idx)}
                                                                className="p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-all"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-12">
                                                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                                            <span className="text-[9px] font-bold text-gray-400 mr-2">الكمية:</span>
                                                            <input 
                                                                type="number" 
                                                                value={s.stock} 
                                                                onChange={e => handleSizeChange(idx, 'stock', Number(e.target.value))}
                                                                className="flex-1 bg-transparent border-none font-black text-xs text-center dark:text-white focus:ring-0" 
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
                    </div>

                    <div className="flex flex-row gap-3 md:gap-4 mt-6 md:mt-10">
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-yellow-500 text-white font-black text-base md:text-xl shadow-xl shadow-yellow-500/30 hover:bg-yellow-600 transition-all transform active:scale-95 disabled:bg-gray-400">
                            {isSaving ? 'جاري الحفظ...' : 'حفظ ونشر المنتج'}
                        </button>
                        <button onClick={onClose} className="flex-1 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold transition-all hover:bg-gray-200 text-sm md:text-base">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InstantProductsPage: React.FC = () => {
    const { products, currentUser, addToCart, addInstantProductsBatch, shoppingBrands, t } = useAppContext();
    const { showToast } = useNotification();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const selectedCategory = searchParams.get('cat') || 'all';

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams(prev => {
                if (searchTerm === '') prev.delete('q');
                else prev.set('q', searchTerm);
                return prev;
            }, { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, setSearchParams]);
    
    const [visibleCount, setVisibleCount] = useState(() => {
        const saved = sessionStorage.getItem('ip_visible_count');
        return saved ? parseInt(saved) : 24;
    });
    const lastSearchParams = useRef({ q: searchTerm, cat: selectedCategory });
    const isInitialMount = useRef(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    
    const loaderRef = useRef<HTMLDivElement>(null);
    const isAdmin = useMemo(() => currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role), [currentUser]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 24);
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (lastSearchParams.current.q !== searchTerm || lastSearchParams.current.cat !== selectedCategory) {
            setVisibleCount(24);
            lastSearchParams.current = { q: searchTerm, cat: selectedCategory };
        }
    }, [searchTerm, selectedCategory]);

    const handleFullView = (productId: number) => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            sessionStorage.setItem('ip_scroll_pos', mainContent.scrollTop.toString());
        }
        sessionStorage.setItem('ip_visible_count', visibleCount.toString());
        navigate(`/products/${productId}`);
    };

    useLayoutEffect(() => {
        const savedScrollPos = sessionStorage.getItem('ip_scroll_pos');
        if (savedScrollPos && products.length > 0) {
            const top = parseInt(savedScrollPos);
            const mainContent = document.getElementById('main-content');
            
            if (mainContent) {
                const attemptScroll = () => {
                    if (mainContent) {
                        mainContent.scrollTo({ top, behavior: 'instant' });
                    }
                };

                // محاولات متعددة لضمان استقرار التمرير بعد رندر العناصر وتحميل الصور
                attemptScroll();
                const t1 = setTimeout(attemptScroll, 50);
                const t2 = setTimeout(attemptScroll, 150);
                const t3 = setTimeout(() => {
                    attemptScroll();
                    sessionStorage.removeItem('ip_scroll_pos');
                    sessionStorage.removeItem('ip_visible_count');
                }, 400);

                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                };
            }
        }
    }, [products.length]);

    const counts = useMemo(() => {
        const res: Record<string, number> = {};
        const storeProducts = products.filter(p => {
            return (p.isInstant || p.storeId === 1) && !p.isDeleted;
        });
        
        storeProducts.forEach(p => {
            res[p.category] = (res[p.category] || 0) + 1;
        });
        
        return { total: storeProducts.length, byCategory: res };
    }, [products]);

    const filteredInstantProducts = useMemo(() => {
        return products.filter(p => {
            const isStoreMatch = p.storeId === 1 || p.isInstant;
            const isNotDeleted = !p.isDeleted;
            const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
            const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // Hide out of stock products for non-admin users
            const stockMatch = isAdmin || p.stock > 0;
            
            const isMatch = isStoreMatch && isNotDeleted && categoryMatch && searchMatch && stockMatch;
            
            return isMatch;
        }).sort((a, b) => b.id - a.id);
    }, [products, searchTerm, selectedCategory, isAdmin]);

    const updateFilter = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value === 'all' || value === '') prev.delete(key);
            else prev.set(key, value);
            return prev;
        }, { replace: true });
    };

    const handleAddToCart = (product: Product, size: string) => {
        addToCart(product, 1, size);
        showToast(`تمت إضافة ${product.name} (مقاس: ${size}) للسلة.`, 'success');
    };

    return (
        <div className="max-w-[1600px] mx-auto p-2 md:p-8 min-h-screen" dir="rtl">
            {isAddModalOpen && <AddInstantProductModal onClose={() => setIsAddModalOpen(false)} onSave={async (d) => { await addInstantProductsBatch(d); }} />}
            
            {quickViewProduct && (
                <ProductQuickViewModal 
                    product={quickViewProduct} 
                    canManage={isAdmin || (currentUser?.role === UserRole.Store && quickViewProduct.storeId === currentUser.storeIds[0])}
                    onClose={() => setQuickViewProduct(null)} 
                    onFullView={handleFullView}
                    onAddToCart={handleAddToCart}
                    brandName={shoppingBrands.find(b => b.id === quickViewProduct.brandId)?.name}
                />
            )}

            <div className="mb-10">
                <Breadcrumbs items={[{ label: 'الرئيسية', path: '/' }, { label: t('instantProducts'), path: undefined }]} />
                <div className="flex flex-row justify-between items-center mt-4 gap-4">
                    <div>
                        <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('instantProducts')}</h1>
                        <p className="text-[10px] md:text-base text-gray-500 dark:text-gray-400 mt-1 font-bold">تسوق من مخزوننا المحلي المتاح للتسليم الفوري.</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setIsAddModalOpen(true)} className="flex-shrink-0 bg-yellow-500 text-white px-4 py-2 md:px-10 md:py-4 rounded-xl md:rounded-[1.5rem] font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 text-[10px] md:text-base">
                            <PlusIcon /> <span className="hidden sm:inline">إضافة منتج فوري</span><span className="sm:hidden">إضافة</span>
                        </button>
                    )}
                </div>
            </div>

            {/* شريط البحث والفلترة المطور */}
            <div className="bg-white dark:bg-gray-800 p-2 md:p-5 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 mb-6 md:mb-10">
                <div className="flex flex-row gap-2 md:gap-4 items-center">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="ابحث..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 md:p-3.5 pr-9 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white shadow-inner text-[10px] md:text-sm"
                        />
                        <div className="absolute right-3 md:right-4 top-2.5 md:top-3.5 text-gray-400 scale-75 md:scale-90">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="relative w-32 md:w-72 flex-shrink-0">
                        <select 
                            value={selectedCategory} 
                            onChange={e => updateFilter('cat', e.target.value)}
                            className="w-full appearance-none p-2.5 md:p-3.5 pr-7 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-black text-[9px] md:text-xs dark:text-white shadow-inner focus:ring-2 focus:ring-yellow-500 transition-all cursor-pointer"
                        >
                            <option value="all">📁 الكل ({counts.total})</option>
                            {Object.entries(CATEGORY_MAP).map(([catKey, data]) => {
                                const count = counts.byCategory[catKey] || 0;
                                return (
                                    <option key={catKey} value={catKey}>
                                        {data.icon} {data.label} ({count})
                                    </option>
                                );
                            })}
                        </select>
                        <div className="absolute right-2 md:right-4 top-2.5 md:top-3.5 text-gray-400 pointer-events-none scale-75 md:scale-90">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 md:gap-6">
                {filteredInstantProducts.slice(0, visibleCount).map((product, index) => {
                    const brand = shoppingBrands.find(b => b.id === product.brandId);
                    return (
                        <InstantProductCard 
                            key={`${product.id}-${index}`} 
                            product={product} 
                            onQuickView={setQuickViewProduct} 
                            onFullView={handleFullView}
                            onAddToCart={(p) => handleAddToCart(p, p.sizes?.[0]?.size || p.size || 'Standard')}
                            brandName={brand?.name}
                        />
                    );
                })}
            </div>

            <div ref={loaderRef} className="h-20 flex items-center justify-center mt-10">
                {visibleCount < filteredInstantProducts.length ? (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                         <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent animate-spin rounded-full"></div>
                    </div>
                ) : (
                    filteredInstantProducts.length > 0 && (
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">لقد وصلت إلى نهاية القائمة</p>
                    )
                )}
            </div>

            {filteredInstantProducts.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mt-6">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner"><SearchIcon /></div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لا توجد منتجات مطابقة</h3>
                </div>
            )}
            <div className="h-24"></div>
        </div>
    );
};

export default InstantProductsPage;
