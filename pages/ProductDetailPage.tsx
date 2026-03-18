
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product, ProductCategory, UserRole, ProductVariant } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductReviews from '../components/ProductReviews';
import { compressImage } from '../utils/imageHelper';
import SuccessModal from '../components/SuccessModal';

// Icons
const TrashIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ExternalLinkIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const TagIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.01" /></svg>;
const BackIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const PlusIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const CheckIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const MoneyIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PhotoIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className || ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const ImageViewModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[300] p-4" onClick={onClose} dir="rtl">
        <button className="absolute top-8 right-8 text-white/50 hover:text-white p-3 bg-white/10 rounded-full transition-all text-2xl font-bold">&times;</button>
        <img src={imageUrl} alt="Product Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()} />
    </div>
);

const AdminPermanentDeleteModal: React.FC<{
    productName: string;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ productName, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[250] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up border dark:border-gray-700 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/30 mb-6 text-red-500">
                <TrashIcon />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تأكيد الحذف النهائي</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                هل أنت متأكد من حذف المنتج <span className="text-red-600 dark:text-red-400 font-black">"{productName}"</span> نهائياً من المخزن؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">تراجع</button>
                <button onClick={onConfirm} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transform active:scale-95 transition-all">نعم، احذف الآن</button>
            </div>
        </div>
    </div>
);

const DeletionReasonModal: React.FC<{
    onClose: () => void;
    onConfirm: (reason: string) => void;
}> = ({ onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[250] p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up border dark:border-gray-700">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">طلب حذف منتج</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-bold">يرجى توضيح سبب الحذف للإدارة (نفاد الكمية نهائياً، خطأ في البيانات، إلخ).</p>
                <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 min-h-[120px] mb-6 shadow-inner"
                    placeholder="اكتب السبب هنا..."
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl">إلغاء</button>
                    <button onClick={() => reason.trim() && onConfirm(reason)} disabled={!reason.trim()} className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl shadow-lg hover:bg-red-700 disabled:bg-gray-300">إرسال الطلب</button>
                </div>
            </div>
        </div>
    );
};

import { useNotification } from '../context/NotificationContext';

const ProductDetailPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { products, currentUser, updateProduct, deleteProductDirectly, requestDeletion, addToCart, t } = useAppContext(); 
    const { showToast } = useNotification();

    const [product, setProduct] = useState<Product | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProduct, setEditableProduct] = useState<Partial<Product>>({});
    const [editableSizes, setEditableSizes] = useState<ProductVariant[]>([]);
    const [selectedSizeForOrder, setSelectedSizeForOrder] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
    const [isAdminConfirmDeleteOpen, setIsAdminConfirmDeleteOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputMainRef = useRef<HTMLInputElement>(null);
    const fileInputAdditionalRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const foundProduct = products.find(p => p.id === Number(id));
        if (foundProduct) {
            setProduct(foundProduct);
            setEditableProduct(foundProduct);
            if (foundProduct.sizes && foundProduct.sizes.length > 0) {
                setEditableSizes(foundProduct.sizes);
            } else {
                const defaultSize = foundProduct.size || 'Standard';
                setEditableSizes([{ size: defaultSize, stock: foundProduct.stock }]);
            }
        }
    }, [id, products]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['price', 'stock', 'costInUSD'].includes(name);
        setEditableProduct(prev => ({ 
            ...prev, 
            [name]: isNumberField ? (value === '' ? '' : Number(value)) : value 
        }));
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const compressed = await compressImage(file, 1200, 0.7);
                setEditableProduct(prev => ({ ...prev, image: compressed }));
                setActiveImageIndex(0);
            } catch (err) {
                showToast('فشل معالجة الصورة', 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setIsUploading(true);
            try {
                const newImgs: string[] = [];
                for (let i = 0; i < files.length; i++) {
                    const compressed = await compressImage(files[i], 1000, 0.7);
                    newImgs.push(compressed);
                }
                setEditableProduct(prev => ({ 
                    ...prev, 
                    images: [...(prev.images || []), ...newImgs] 
                }));
            } catch (err) {
                showToast('فشل معالجة الصور', 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const removeImage = (index: number, isMain: boolean) => {
        if (isMain) {
            setEditableProduct(prev => ({ ...prev, image: undefined }));
        } else {
            setEditableProduct(prev => ({ 
                ...prev, 
                images: (prev.images || []).filter((_, i) => i !== index) 
            }));
        }
        if (activeImageIndex >= (allImages.length - 1)) setActiveImageIndex(0);
    };

    const allImages = useMemo(() => {
        const imgs = [];
        if (isEditing) {
            if (editableProduct.image) imgs.push(editableProduct.image);
            if (editableProduct.images) imgs.push(...editableProduct.images);
        } else {
            if (product?.image) imgs.push(product.image);
            if (product?.images) imgs.push(...product.images);
        }
        return imgs;
    }, [product, editableProduct, isEditing]);

    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);
    const isStoreOwner = currentUser?.role === UserRole.Store && product?.storeId === currentUser.storeIds[0];
    const canManage = isAdmin || isStoreOwner;

    const handleSaveChanges = async () => {
        if (product) {
            const finalUpdates = { 
                ...editableProduct, 
                sizes: editableSizes, 
                stock: (editableSizes || []).reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
            };
            await updateProduct(product.id, finalUpdates);
            setSuccessMessage('تم تحديث بيانات المنتج بنجاح!');
            setShowSuccessModal(true);
            setIsEditing(false);
        }
    };

    const handleDeleteClick = () => {
        if (!product) return;
        if (isAdmin) {
            setIsAdminConfirmDeleteOpen(true);
        } else {
            setIsDeletionModalOpen(true);
        }
    };

    const handleConfirmPermanentDelete = async () => {
        if (product) {
            const isInstant = product.isInstant;
            await deleteProductDirectly(product.id);
            if (isInstant) {
                navigate('/dashboard/instant-products');
            } else {
                navigate('/products');
            }
        }
    };

    const handleConfirmDeletionRequest = async (reason: string) => {
        if (!product) return;
        await requestDeletion('product', product.id, reason);
        setIsDeletionModalOpen(false);
        setSuccessMessage('تم إرسال طلب حذف المنتج للإدارة للمراجعة.');
        setShowSuccessModal(true);
    };

    if (!product) return <div className="p-20 text-center font-black animate-pulse">جاري تحميل تفاصيل المنتج...</div>;

    const inputClasses = "w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 shadow-inner text-gray-900 dark:text-white";

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {viewingImage && <ImageViewModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
            {isDeletionModalOpen && <DeletionReasonModal onClose={() => setIsDeletionModalOpen(false)} onConfirm={handleConfirmDeletionRequest} />}
            {isAdminConfirmDeleteOpen && <AdminPermanentDeleteModal productName={product.name} onClose={() => setIsAdminConfirmDeleteOpen(false)} onConfirm={handleConfirmPermanentDelete} />}

            <div className="flex flex-col mb-6 md:mb-10 gap-4">
                <div className="flex flex-row justify-between items-center gap-4">
                    <Breadcrumbs items={[{ label: 'لوحة التحكم', path: '/dashboard' }, { label: product.isInstant ? 'متجر LibyPort' : 'المخزن', path: product.isInstant ? '/dashboard/instant-products' : '/products' }, { label: product.name, path: undefined }]} />
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 font-black text-xs md:text-sm transition-all"><BackIcon /> <span>رجوع</span></button>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="w-full md:w-auto">
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight line-clamp-2 mb-2">{isEditing ? 'تعديل المنتج' : product.name}</h1>
                        {!isEditing && (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">{product.category}</span>
                                <span className="text-[10px] font-black text-gray-400 font-mono uppercase tracking-tighter">SKU: {product.sku || 'N/A'}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {!isEditing ? (
                            <>
                                {canManage && (
                                    <div className="flex gap-2 flex-1 md:flex-none">
                                        <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-black shadow-sm hover:bg-gray-50 transition-all text-sm md:text-base">إدارة المنتج</button>
                                        <button onClick={handleDeleteClick} className="p-3.5 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center" title="حذف المنتج">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                )}
                                <button 
                                    onClick={() => selectedSizeForOrder ? addToCart(product, 1, selectedSizeForOrder) : showToast('يرجى اختيار مقاس', 'error')} 
                                    disabled={product.stock <= 0} 
                                    className="flex-1 md:flex-none px-12 py-3.5 bg-yellow-500 text-white rounded-2xl font-black shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transition-all transform active:scale-95 disabled:bg-gray-400 text-sm md:text-base"
                                >
                                    أضف للسلة
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsEditing(false)} className="flex-1 px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold">إلغاء</button>
                                <button onClick={handleSaveChanges} className="flex-1 px-8 py-4 bg-yellow-500 text-white rounded-2xl font-black shadow-xl shadow-yellow-500/20">حفظ التغييرات</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl p-4 border border-gray-50 dark:border-gray-700 overflow-hidden group relative">
                        {/* Main Image View */}
                        <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
                            {allImages[activeImageIndex] ? (
                                <>
                                    <img 
                                        src={allImages[activeImageIndex]} 
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-zoom-in" 
                                        alt={product.name} 
                                        onClick={() => setViewingImage(allImages[activeImageIndex] || '')}
                                    />
                                    {isEditing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => fileInputMainRef.current?.click()}
                                                className="bg-white text-gray-900 px-6 py-2 rounded-xl font-black text-sm mb-2 shadow-xl flex items-center gap-2"
                                            >
                                                <PhotoIcon /> {activeImageIndex === 0 ? 'تبديل الصورة الأساسية' : 'تبديل هذه الصورة'}
                                            </button>
                                            <button 
                                                onClick={() => removeImage(activeImageIndex === 0 ? 0 : activeImageIndex - 1, activeImageIndex === 0)}
                                                className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-xl flex items-center gap-2"
                                            >
                                                <TrashIcon /> حذف الصورة
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div 
                                    className="h-full flex flex-col items-center justify-center text-gray-300 font-bold cursor-pointer"
                                    onClick={() => isEditing && fileInputMainRef.current?.click()}
                                >
                                    <div className="w-16 h-16 mb-2 opacity-20"><PhotoIcon /></div>
                                    {isEditing ? 'اضغط لرفع صورة أساسية' : 'لا توجد صورة'}
                                </div>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent animate-spin rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Hidden File Inputs */}
                        <input type="file" ref={fileInputMainRef} className="hidden" accept="image/*" onChange={handleMainImageUpload} />
                        <input type="file" ref={fileInputAdditionalRef} className="hidden" accept="image/*" multiple onChange={handleAdditionalImagesUpload} />

                        {/* Thumbnails Grid */}
                        <div className="flex flex-wrap gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide items-center">
                            {allImages.map((img, idx) => (
                                <div key={idx} className="relative group/thumb">
                                    <img 
                                        src={img} 
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-16 h-16 rounded-xl object-cover cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-yellow-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                                    />
                                    {isEditing && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeImage(idx === 0 ? 0 : idx - 1, idx === 0); }}
                                            className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-all scale-75"
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <button 
                                    onClick={() => fileInputAdditionalRef.current?.click()}
                                    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-yellow-500 hover:text-yellow-500 transition-all"
                                    title="إضافة صور إضافية"
                                >
                                    <PlusIcon />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6 md:space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                            <div className="md:col-span-2">
                                {isEditing ? (
                                    <>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">اسم المنتج</label>
                                        <input name="name" value={editableProduct.name} onChange={handleInputChange} className={inputClasses} />
                                    </>
                                ) : (
                                    <div className="hidden md:block">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">اسم المنتج</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white leading-relaxed">{product.name}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:col-span-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">الفئة</label>
                                    {isEditing ? (
                                        <select name="category" value={editableProduct.category} onChange={handleInputChange} className={inputClasses}>
                                            {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/30 w-fit">
                                            <TagIcon className="text-yellow-600 h-3.5 w-3.5" />
                                            <span className="font-black text-[10px] md:text-xs text-yellow-700 dark:text-yellow-400 truncate">{product.category}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">رقم التتبع (SKU)</label>
                                    {isEditing ? (
                                        <input name="sku" type="text" value={editableProduct.sku} onChange={handleInputChange} className={`${inputClasses} font-mono`} />
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 w-full">
                                            <p className="text-xs md:text-lg font-black text-gray-500 font-mono tracking-tighter truncate">{product.sku || 'N/A'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">سعر البيع</label>
                                    {isEditing ? (
                                        <input name="price" type="number" value={editableProduct.price} onChange={handleInputChange} className={`${inputClasses} text-2xl text-green-600`} />
                                    ) : (
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl md:text-4xl font-black text-yellow-600 font-mono">{product.price.toLocaleString()}</p>
                                            <span className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest">د.ل</span>
                                        </div>
                                    )}
                                </div>

                                {canManage && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">تكلفة الشراء الأصلية ($)</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input name="costInUSD" type="number" step="any" value={editableProduct.costInUSD || ''} onChange={handleInputChange} className={`${inputClasses} text-xl text-blue-600 pl-8 font-mono`} />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-black">$</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 w-fit">
                                                <div className="text-blue-600 dark:text-blue-400"><MoneyIcon /></div>
                                                <p className="text-lg md:text-xl font-black text-blue-700 dark:text-blue-300 font-mono">${product.costInUSD?.toLocaleString() || '0'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {canManage && (
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">رابط المنتج الأصلي</label>
                                    {isEditing ? (
                                        <input name="url" type="url" value={editableProduct.url || ''} onChange={handleInputChange} className={`${inputClasses} font-mono text-xs`} placeholder="https://..." />
                                    ) : (
                                        <div className="mt-1">
                                            {product.url ? (
                                                <a 
                                                    href={product.url.startsWith('http') ? product.url : `https://${product.url}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-md group w-full md:w-auto justify-center md:justify-start"
                                                >
                                                    <ExternalLinkIcon />
                                                    زيارة رابط المتجر العالمي
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-bold italic">لا يوجد رابط مسجل لهذا المنتج</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 mr-2">المخزون الإجمالي</label>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`w-3 h-3 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                                    <p className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-100">
                                        {product.sizes && product.sizes.length > 0 
                                            ? product.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) 
                                            : product.stock} <span className="text-xs md:text-sm font-bold opacity-60">قطعة</span>
                                    </p>
                                    {isAdmin && product.sizes && product.sizes.length > 0 && product.stock !== product.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0) && (
                                        <button 
                                            onClick={async () => {
                                                const actualTotal = product.sizes!.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
                                                await updateProduct(product.id, { stock: actualTotal });
                                                setSuccessMessage('تم تصحيح المخزون الإجمالي بناءً على المقاسات.');
                                                setShowSuccessModal(true);
                                            }}
                                            className="text-[9px] bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-black hover:bg-red-600 hover:text-white transition-all no-print"
                                        >
                                            تصحيح المخزون
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-base md:text-lg font-black flex items-center gap-3">
                                <span className="bg-yellow-500 w-2.5 h-6 rounded-full inline-block"></span>
                                المقاسات المتوفرة
                            </h2>
                            {isEditing && (
                                <button onClick={() => setEditableSizes([...editableSizes, { size: '', stock: 0 }])} className="bg-yellow-500 text-white p-2.5 rounded-xl shadow-lg hover:bg-yellow-600 transition-all"><PlusIcon /></button>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 md:gap-4">
                            {editableSizes.map((s, idx) => {
                                const isOutOfStock = s.stock <= 0;
                                return isEditing ? (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 md:p-4 rounded-2xl border dark:border-gray-700 animate-fade-in-up w-full sm:w-auto">
                                        <input type="text" value={s.size} onChange={e => {
                                            const ns = [...editableSizes]; ns[idx].size = e.target.value; setEditableSizes(ns);
                                        }} className="flex-1 sm:w-24 p-2.5 bg-white dark:bg-gray-800 border rounded-xl text-center font-bold text-xs" placeholder="المقاس" />
                                        <input type="number" value={s.stock} onChange={e => {
                                            const ns = [...editableSizes]; ns[idx].stock = Number(e.target.value); setEditableSizes(ns);
                                        }} className="w-20 p-2.5 bg-white dark:bg-gray-800 border rounded-xl text-center font-black text-xs text-yellow-600" />
                                        <button onClick={() => setEditableSizes(editableSizes.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-2"><TrashIcon /></button>
                                    </div>
                                ) : (
                                    <button 
                                        key={idx}
                                        onClick={() => !isOutOfStock && setSelectedSizeForOrder(s.size)}
                                        disabled={isOutOfStock}
                                        className={`px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm border-2 transition-all transform active:scale-95 flex flex-col items-center flex-1 sm:flex-none min-w-[80px] md:min-w-[120px] ${
                                            selectedSizeForOrder === s.size 
                                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 shadow-md scale-105' 
                                                : isOutOfStock 
                                                    ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-300 dark:text-gray-600 cursor-not-allowed border-dashed opacity-50' 
                                                    : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-yellow-200'
                                        }`}
                                    >
                                        <span>{s.size}</span>
                                        {isOutOfStock ? (
                                            <span className="text-[8px] md:text-[10px] font-black uppercase text-red-400 mt-1">غير متوفر</span>
                                        ) : (
                                            canManage && <span className="block text-[9px] md:text-[11px] font-bold opacity-60 mt-1">مخزون: {s.stock}</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                        {!isEditing && (
                            <p className="text-[10px] md:text-xs text-gray-400 mt-6 font-bold italic">* المقاسات الباهتة تعني نفاد الكمية من المخزن المحلي حالياً.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <ProductReviews product={product} />
            </div>
            
            <div className="h-20"></div>

            <SuccessModal 
                isOpen={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)} 
                title="تم بنجاح" 
                message={successMessage || ''} 
                itemName={product?.name}
            />
        </div>
    );
};

export default ProductDetailPage;
