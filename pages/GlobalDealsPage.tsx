
import React, { useState, useMemo, useLayoutEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { Product, UserRole, ProductCategory, OrderType } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1.158a3.998 3.998 0 005.455 3.585l.698-.233A1 1 0 0114 8.586V10a1 1 0 11-2 0V8.243l-.698.233A2 2 0 0110 9.414l-.382-.382a2 2 0 00-2.828 0L6 9.828V12a1 1 0 11-2 0V9.414a2 2 0 01.586-1.414l.382-.382a3.998 3.998 0 00-3.125-4.46V3a1 1 0 011-1z" clipRule="evenodd" /></svg>;

type GeneratedProductVariant = {
    id: number;
    name: string;
    price: number;
    costInUSD: number;
    category: ProductCategory;
    sku: string;
    size: string;
    image: string;
    isSelected: boolean;
};

type ProductIdea = {
    name: string;
    descriptionForImage: string;
    priceInUSD: number;
    category: ProductCategory;
    sku: string;
    sizes: string[];
};

const GenerateDealsModal: React.FC<{
    onClose: () => void;
    addProduct: (productData: Omit<Product, 'id' | 'isPendingDeletion' | 'isDeleted' | 'deletionReason'>) => Promise<void>;
    exchangeRate: number;
}> = ({ onClose, addProduct, exchangeRate }) => {
    const { showToast } = useNotification();
    const [url, setUrl] = useState('');
    const [step, setStep] = useState(1);
    const [generatedVariants, setGeneratedVariants] = useState<GeneratedProductVariant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    const handleGenerateProducts = async () => {
        if (!url.trim() || !url.startsWith('http')) {
            setError('الرجاء إدخال رابط فئة منتجات صحيح.');
            return;
        }

        setIsLoading(true);
        setError('');
        setStep(2);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            setLoadingMessage('جاري تحليل الرابط واستخلاص بيانات المنتجات...');
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'اسم المنتج الدقيق باللغة العربية كما هو متوقع في الموقع.' },
                        descriptionForImage: { type: Type.STRING, description: 'وصف دقيق ومفصل باللغة الإنجليزية للمنتج لتوليد صورة واقعية له. يجب أن يتضمن اللون، الخامة، التصميم، وخلفية بيضاء نظيفة.' },
                        priceInUSD: { type: Type.NUMBER, description: 'السعر الدقيق للمنتج بالدولار الأمريكي.' },
                        category: { type: Type.STRING, enum: Object.values(ProductCategory) },
                        sku: { type: Type.STRING, description: 'SKU المقترح للمنتج، يجب أن يكون فريداً ومعبراً.' },
                        sizes: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة بالمقاسات المتوفرة للمنتج مثل ["S", "M", "L"] أو ["38", "39", "40"].' }
                    },
                    required: ['name', 'descriptionForImage', 'priceInUSD', 'category', 'sku', 'sizes']
                }
            };

            const detailsResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `أنت خبير في استخلاص بيانات المنتجات من مواقع التجارة الإلكترونية. بناءً على معرفتك بالمنتجات الموجودة في الرابط التالي، قم بتوليد قائمة تحتوي على 10 منتجات على الأقل. لكل منتج، قم بتوفير البيانات المطلوبة بدقة. الرابط: "${url}"`,
                config: { responseMimeType: 'application/json', responseSchema: schema }
            });

            const productIdeas: ProductIdea[] = JSON.parse(detailsResponse.text);
            
            if (!productIdeas || productIdeas.length === 0) {
                throw new Error("لم يتمكن الذكاء الاصطناعي من استخلاص البيانات. قد يكون الرابط غير مدعوم أو حدث خطأ.");
            }

            setLoadingMessage(`جاري توليد ${productIdeas.length} صور للمنتجات الأساسية...`);
            const imagePromises = productIdeas.map(idea => 
                ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: `A high-quality e-commerce product photo, clean white background, for the following item: ${idea.descriptionForImage}` }] }
                })
            );

            const imageResponses = await Promise.all(imagePromises);
            
            let variantCounter = 0;
            const finalVariants: GeneratedProductVariant[] = [];
            productIdeas.forEach((idea, index) => {
                let imageBase64 = "";
                for (const part of imageResponses[index].candidates[0].content.parts) {
                    if (part.inlineData) imageBase64 = part.inlineData.data;
                }
                const priceInLYD = Math.ceil((idea.priceInUSD * exchangeRate) * 1.25); // 25% profit margin

                if (idea.sizes && idea.sizes.length > 0) {
                    idea.sizes.forEach(size => {
                        finalVariants.push({
                            id: Date.now() + variantCounter++ + Math.floor(Math.random() * 1000),
                            name: `${idea.name} (${size})`,
                            price: priceInLYD,
                            costInUSD: idea.priceInUSD,
                            category: idea.category,
                            sku: `${idea.sku}-${size.replace(/\s+/g, '')}`.toUpperCase(),
                            size: size,
                            image: `data:image/jpeg;base64,${imageBase64}`,
                            isSelected: true,
                        });
                    });
                }
            });

            setGeneratedVariants(finalVariants);

        } catch (e) {
            console.error(e);
            setError('فشل في استيراد المنتجات. قد يكون الرابط غير مدعوم أو حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.');
            setStep(1);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleSaveProducts = async () => {
        const productsToSave = generatedVariants.filter(p => p.isSelected);
        if (productsToSave.length === 0) {
            showToast("الرجاء تحديد منتج واحد على الأقل للحفظ.", 'error');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const savePromises = productsToSave.map(p => addProduct({
                name: p.name,
                price: p.price,
                stock: 100, 
                category: p.category,
                storeId: 1,
                sku: p.sku,
                image: p.image,
                costInUSD: p.costInUSD,
                isAggregated: true,
                size: p.size,
                isInstant: false
            }));
            await Promise.all(savePromises);
            onClose();
        } catch(e) {
            console.error(e);
            setError('حدث خطأ أثناء حفظ المنتجات.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFieldChange = (id: number, field: keyof GeneratedProductVariant, value: string | number | boolean) => {
        setGeneratedVariants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl transform transition-all h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex-shrink-0">استيراد منتجات بالذكاء الاصطناعي</h2>
                
                {step === 1 && (
                    <>
                        <p className="text-gray-600 mb-4">الصق رابط فئة المنتجات من المواقع العالمية (مثل شي ان، ترينديول). سيقوم الذكاء الاصطناعي بتحليل الرابط واستخلاص البيانات وإنشاء منتجات لكل مقاس متوفر.</p>
                        <div>
                            <label htmlFor="category-url" className="font-semibold text-gray-800">رابط فئة المنتجات</label>
                            <input
                                id="category-url"
                                type="url"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-lg"
                                placeholder="https://www.shein.com/Women-Dresses-c-1727.html"
                                required
                            />
                        </div>
                    </>
                )}

                {step === 2 && (
                     <>
                        <p className="text-gray-600 mb-4 flex-shrink-0">تم استخلاص المنتجات وإنشاء نسخ لكل مقاس. راجعها وقم بتعديلها أو إلغاء تحديد ما لا تريده قبل الحفظ.</p>
                        {isLoading && loadingMessage && (
                            <div className="flex-grow flex flex-col items-center justify-center text-center">
                                 <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                                <p className="text-lg font-semibold text-gray-700">{loadingMessage}</p>
                            </div>
                        )}
                        {!isLoading && (
                            <div className="flex-grow overflow-y-auto -mx-4 px-4 space-y-4">
                                {generatedVariants.map(p => (
                                    <div key={p.id} className={`p-4 rounded-lg flex gap-4 transition-all ${p.isSelected ? 'bg-green-50' : 'bg-gray-100 opacity-60'}`}>
                                        <input type="checkbox" checked={p.isSelected} onChange={(e) => handleFieldChange(p.id, 'isSelected', e.target.checked)} className="form-checkbox h-6 w-6 text-yellow-600 focus:ring-yellow-500 mt-1" />
                                        <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-md border" />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 flex-grow">
                                            <div className="col-span-2 md:col-span-4">
                                                <label className="text-xs font-semibold">الاسم</label>
                                                <input type="text" value={p.name} onChange={(e) => handleFieldChange(p.id, 'name', e.target.value)} className="w-full p-1 border rounded" />
                                            </div>
                                             <div>
                                                <label className="text-xs font-semibold">السعر (د.ل)</label>
                                                <input type="number" value={p.price} onChange={(e) => handleFieldChange(p.id, 'price', Number(e.target.value))} className="w-full p-1 border rounded" />
                                            </div>
                                             <div>
                                                <label className="text-xs font-semibold">التكلفة ($)</label>
                                                <input type="number" value={p.costInUSD} onChange={(e) => handleFieldChange(p.id, 'costInUSD', Number(e.target.value))} className="w-full p-1 border rounded" />
                                            </div>
                                             <div>
                                                <label className="text-xs font-semibold">SKU</label>
                                                <input type="text" value={p.sku} onChange={(e) => handleFieldChange(p.id, 'sku', e.target.value)} className="w-full p-1 border rounded" />
                                            </div>
                                             <div>
                                                <label className="text-xs font-semibold">الفئة</label>
                                                 <select value={p.category} onChange={(e) => handleFieldChange(p.id, 'category', e.target.value)} className="w-full p-1 border rounded bg-white">
                                                    {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                                 </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </>
                )}


                {error && <p className="text-red-500 text-sm mt-4 text-center flex-shrink-0">{error}</p>}
                
                <div className="flex justify-between items-center pt-6 border-t mt-6 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300" disabled={isLoading}>إلغاء</button>
                    {step === 1 ? (
                        <button type="button" onClick={handleGenerateProducts} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400" disabled={isLoading}>
                            {isLoading ? 'جاري العمل...' : 'استخلاص المنتجات'}
                        </button>
                    ) : (
                         <button type="button" onClick={handleSaveProducts} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 disabled:bg-gray-400" disabled={isLoading || generatedVariants.length === 0}>
                            {isLoading ? 'جاري الحفظ...' : `حفظ المنتجات المحددة (${generatedVariants.filter(p=>p.isSelected).length})`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const GlobalDealsPage: React.FC = () => {
    const { products, currentUser, addProduct, exchangeRate, addToCart } = useAppContext();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();
    const navigate = ReactRouterDOM.useNavigate();
    
    const searchTerm = searchParams.get('q') || '';
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(20);
    const loaderRef = React.useRef<HTMLDivElement>(null);

    // استعادة موقع التمرير
    useLayoutEffect(() => {
        const savedScrollPos = sessionStorage.getItem('gd_scroll_pos');
        const savedVisibleCount = sessionStorage.getItem('gd_visible_count');
        
        if (savedVisibleCount) {
            setVisibleCount(parseInt(savedVisibleCount));
        }

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
                    sessionStorage.removeItem('gd_scroll_pos');
                    sessionStorage.removeItem('gd_visible_count');
                }, 400);

                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                };
            }
        }
    }, [products.length]);

    // Infinite Scroll Observer
    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 20);
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, []);

    const isSuperAdmin = useMemo(() => currentUser?.role === UserRole.SuperAdmin, [currentUser]);
    
    const filteredProducts = useMemo(() => {
        return products
            .filter(p => p.isAggregated && !p.isDeleted)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.id - a.id);
    }, [products, searchTerm]);

    const aggregatedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const handleProductClick = (productId: number) => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            sessionStorage.setItem('gd_scroll_pos', mainContent.scrollTop.toString());
            sessionStorage.setItem('gd_visible_count', visibleCount.toString());
        }
        navigate(`/products/${productId}`);
    };

    const handleOrderClick = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        addToCart(product, 1, product.size);
        navigate('/checkout');
    };
    
    const handleAddProduct = async (productData: Omit<Product, 'id' | 'isPendingDeletion' | 'isDeleted' | 'deletionReason'>) => {
        await addProduct(productData);
    };

    const breadcrumbItems = [
        { label: 'الرئيسية', path: '/dashboard' },
        { label: 'متجر العروض العالمية', path: undefined },
    ];

    return (
        <div className="container mx-auto p-6 min-h-screen" dir="rtl">
            {isAddModalOpen && <GenerateDealsModal onClose={() => setIsAddModalOpen(false)} addProduct={handleAddProduct} exchangeRate={exchangeRate} />}
            
            <div className="mb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">متجر العروض العالمية</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">استورد منتجات مع مقاساتها من مواقع عالمية باستخدام الذكاء الاصطناعي.</p>
                </div>
                 <div className="flex gap-2">
                    <input 
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchTerm}
                        onChange={(e) => setSearchParams(prev => {
                            if (!e.target.value) prev.delete('q');
                            else prev.set('q', e.target.value);
                            return prev;
                        }, { replace: true })}
                        className="p-2 border border-gray-300 rounded-lg w-full md:w-auto placeholder-gray-600 dark:placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600"
                    />
                    {isSuperAdmin && (
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 whitespace-nowrap">
                            <SparklesIcon />
                            <span>استيراد بـ AI</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {aggregatedProducts.map(product => (
                    <div 
                        key={product.id} 
                        onClick={() => handleProductClick(product.id)}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-shadow"
                    >
                        <div className="relative">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">لا توجد صورة</div>
                                )}
                            </div>
                            {product.costInUSD && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">${product.costInUSD}</span>}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex-grow">{product.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</p>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{product.price.toLocaleString()} د.ل</p>
                                 <button onClick={(e) => handleOrderClick(e, product)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600">
                                    أضف للسلة واطلب
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Infinite Scroll Loader */}
            {filteredProducts.length > visibleCount && (
                <div ref={loaderRef} className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
            )}

            {aggregatedProducts.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات في متجر العروض بعد.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">استخدم زر "استيراد بـ AI" لجلب أول مجموعة منتجات.</p>
                </div>
            )}
        </div>
    );
};

export default GlobalDealsPage;
