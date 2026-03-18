
import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, ProductCategory, Product, ProductVariant } from '../types';
import { CATEGORY_MAP } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const BoxesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center transition-all hover:shadow-md">
        <div className="text-right min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">{title}</p>
            <p className="text-sm sm:text-base md:text-xl font-black text-gray-900 dark:text-white leading-none truncate">{value}</p>
        </div>
    </div>
);

const ProductCard = React.memo<{ 
    product: Product; 
    onQuickView: (p: Product) => void;
    onFullView: (id: number) => void;
}>(({ product, onQuickView, onFullView }) => {
    const [hoverIndex, setHoverIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const longPressTimer = useRef<any>(null);
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

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
                    loading="lazy"
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
                ) : isLowStock ? (
                    <div className="absolute top-1.5 md:top-4 right-1.5 md:right-4 flex flex-col gap-2">
                         <span className="bg-orange-500 text-white text-[6px] md:text-[9px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg uppercase">محدود</span>
                    </div>
                ) : null}
            </div>
            <div className="p-2 md:p-4 flex flex-col flex-grow">
                <h3 onClick={() => onFullView(product.id)} className="font-black text-gray-900 dark:text-white text-[9px] md:text-sm leading-tight mb-1 md:mb-1.5 truncate cursor-pointer hover:text-yellow-600 transition-colors" title={product.name}>{product.name}</h3>
                <p className="text-[7px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{CATEGORY_MAP[product.category]?.label || product.category}</p>
                <div className="mt-auto pt-1.5 md:pt-3 flex justify-between items-end">
                    <div>
                        <p className="text-[7px] md:text-[10px] text-gray-400 font-black uppercase mb-0.5">السعر</p>
                        <p className="text-xs md:text-lg font-black text-yellow-600 dark:text-yellow-400 leading-none">{product.price.toLocaleString()} <span className="text-[7px] md:text-[10px]">د.ل</span></p>
                    </div>
                    <div className="text-left">
                        <p className="text-[7px] md:text-[10px] text-gray-400 font-black uppercase mb-0.5">SKU</p>
                        <p className="text-[7px] md:text-[10px] font-black text-gray-400 font-mono truncate max-w-[50px] md:max-w-[80px]">{product.sku || '---'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

const ProductQuickViewModal = React.memo<{
    product: Product;
    canManage: boolean;
    onClose: () => void;
    onFullView: (id: number) => void;
    onAddToCart: (p: Product, size: string) => void;
}>(({ product, canManage, onClose, onFullView, onAddToCart }) => {
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

                <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">{CATEGORY_MAP[product.category]?.label || product.category}</span>
                            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mt-3 leading-tight">{product.name}</h2>
                            <p className="font-mono text-xs text-gray-400 font-bold mt-1.5 uppercase tracking-tighter">SKU: {product.sku}</p>
                        </div>
                        {canManage && (
                            <button 
                                onClick={() => onFullView(product.id)}
                                className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-200 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm group"
                                title="إدارة وتعديل المنتج"
                            >
                                <CogIcon />
                            </button>
                        )}
                    </div>

                    <div className="mb-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">المقاسات المتوفرة في المخزن</p>
                        <div className="flex flex-wrap gap-1.5">
                            {sizes.length > 0 ? sizes.map((s, i) => (
                                <button 
                                    key={i} 
                                    disabled={s.stock <= 0}
                                    onClick={() => setSelectedSize(s.size)}
                                    className={`px-4 py-2 rounded-xl font-black text-xs border-2 transition-all ${selectedSize === s.size ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : s.stock <= 0 ? 'opacity-30 border-gray-100 dark:border-gray-700 cursor-not-allowed' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-yellow-200'}`}
                                >
                                    {s.size}
                                    <span className="block text-[9px] font-bold opacity-60 mt-0.5">{s.stock <= 0 ? 'نافذ' : `متوفر: ${s.stock}`}</span>
                                </button>
                            )) : (
                                <p className="text-xs text-gray-400 font-bold italic">لا توجد مقاسات مسجلة لهذا المنتج.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">سعر البيع</p>
                            <p className="text-xl md:text-2xl font-black text-yellow-600 dark:text-yellow-400">{product.price.toLocaleString()} <span className="text-xs font-normal">د.ل</span></p>
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
                            disabled={product.stock <= 0}
                            className="w-full sm:w-auto px-10 py-3.5 bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 rounded-xl font-black shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2.5 active:scale-95 disabled:bg-gray-300 disabled:shadow-none text-sm"
                        >
                            <ShoppingBagIcon /> إضافة للسلة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const ProductsPage: React.FC = () => {
    const { currentUser, products, addToCart } = useAppContext();
    const { showToast } = useNotification();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();
    
    const [urlSearchTerm, setUrlSearchTerm] = useState(searchParams.get('search') || '');
    const categoryParam = searchParams.get('category') || 'all';

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams(prev => {
                if (urlSearchTerm === '') prev.delete('search');
                else prev.set('search', urlSearchTerm);
                return prev;
            }, { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [urlSearchTerm, setSearchParams]);
    
    const [visibleCount, setVisibleCount] = useState(24);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const loaderRef = useRef<HTMLDivElement>(null);

    const isAdmin = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;

    // مراقب التمرير اللانهائي (Infinite Scroll)
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 24);
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, []);

    // تصفير العداد عند تغيير الفلاتر
    useEffect(() => {
        setVisibleCount(24);
    }, [urlSearchTerm, categoryParam]);

    const handleFullView = (productId: number) => {
        const container = document.getElementById('main-content');
        if (container) {
            sessionStorage.setItem('products_scroll_pos', container.scrollTop.toString());
        }
        navigate(`/products/${productId}`);
    };

    const handleAddToCart = (p: Product, size: string) => {
        addToCart(p, 1, size);
        showToast(`تمت إضافة ${p.name} للسلة.`, 'success');
    };

    const updateFilter = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value === 'all' || value === '') prev.delete(key);
            else prev.set(key, value);
            return prev;
        }, { replace: true });
    };

    useLayoutEffect(() => {
        const savedPos = sessionStorage.getItem('products_scroll_pos');
        if (savedPos && products.length > 0) {
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
                    sessionStorage.removeItem('products_scroll_pos');
                }, 400);

                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                };
            }
        }
    }, [products.length]);

    const userStoreIds = useMemo(() => isAdmin ? products.map(p => p.storeId) : currentUser?.storeIds || [], [isAdmin, products, currentUser]);

    // حساب العدادات للفئات
    const counts = useMemo(() => {
        const res: Record<string, number> = {};
        const availableProducts = products.filter(p => !p.isDeleted && !p.isInstant && userStoreIds.includes(p.storeId));
        availableProducts.forEach(p => {
            res[p.category] = (res[p.category] || 0) + 1;
        });
        return { total: availableProducts.length, byCategory: res };
    }, [products, userStoreIds]);

    const filteredProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => b.id - a.id)
            .filter(p => !p.isDeleted && !p.isInstant && userStoreIds.includes(p.storeId))
            .filter(p => categoryParam === 'all' || p.category === categoryParam)
            .filter(p => {
                const s = urlSearchTerm.toLowerCase().trim();
                if (!s) return true;
                return p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)) || String(p.id).includes(s);
            });
    }, [products, userStoreIds, urlSearchTerm, categoryParam]);

    const stats = useMemo(() => ({
        outOfStock: filteredProducts.filter(p => p.stock === 0).length,
        lowStock: filteredProducts.filter(p => p.stock > 0 && p.stock <= 5).length
    }), [filteredProducts]);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8" dir="rtl">
            {quickViewProduct && (
                <ProductQuickViewModal 
                    product={quickViewProduct}
                    canManage={isAdmin || (currentUser?.role === UserRole.Store && quickViewProduct.storeId === currentUser.storeIds[0])}
                    onClose={() => setQuickViewProduct(null)}
                    onFullView={handleFullView}
                    onAddToCart={handleAddToCart}
                />
            )}

            <div className="mb-6 md:mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="animate-fade-in-up">
                        <Breadcrumbs items={[{ label: 'لوحة التحكم', path: '/dashboard' }, { label: 'المخزن والمنتجات', path: undefined }]} />
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">إدارة المخزن العام</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-yellow-600 font-black text-xs md:text-sm transition-all group"
                    >
                        <BackIcon />
                        <span>العودة للرئيسية</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
                <StatCard title="إجمالي المنتجات" value={counts.total} />
                <StatCard title="نافذ" value={stats.outOfStock} />
            </div>

            {/* شريط البحث والفلترة المطور */}
            <div className="bg-white dark:bg-gray-800 p-2 md:p-5 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 mb-6 md:mb-10">
                <div className="flex flex-row gap-2 md:gap-4 items-center">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="ابحث بالاسم أو SKU..." 
                            value={urlSearchTerm} 
                            onChange={e => setUrlSearchTerm(e.target.value)} 
                            className="w-full p-2.5 md:p-3.5 pr-9 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-bold dark:text-white shadow-inner focus:ring-2 focus:ring-yellow-500 transition-all text-[10px] md:text-sm" 
                        />
                        <div className="absolute right-3 md:right-4 top-2.5 md:top-3.5 text-gray-400 scale-75 md:scale-90">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="relative w-32 md:w-48 flex-shrink-0">
                        <select 
                            value={categoryParam} 
                            onChange={e => updateFilter('category', e.target.value)}
                            className="w-full appearance-none p-2.5 md:p-3.5 pr-7 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl font-black text-xs md:text-sm dark:text-white shadow-inner focus:ring-2 focus:ring-yellow-500 transition-all cursor-pointer"
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
                {filteredProducts.slice(0, visibleCount).map((product, index) => (
                    <ProductCard 
                        key={`${product.id}-${index}`} 
                        product={product} 
                        onQuickView={setQuickViewProduct}
                        onFullView={handleFullView}
                    />
                ))}
            </div>

            {/* عنصر مراقبة للتحميل اللانهائي */}
            <div ref={loaderRef} className="h-20 flex items-center justify-center mt-10">
                {visibleCount < filteredProducts.length ? (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                         <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent animate-spin rounded-full"></div>
                    </div>
                ) : (
                    filteredProducts.length > 0 && (
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">لقد وصلت إلى نهاية القائمة</p>
                    )
                )}
            </div>
            
            {filteredProducts.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-inner">
                        <BoxesIcon />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-widest">لا توجد منتجات</h3>
                </div>
            )}
            
            <div className="h-20"></div>
        </div>
    );
};

export default ProductsPage;
