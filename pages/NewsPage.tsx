
import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, News } from '../types';
import { compressImage } from '../utils/imageHelper';

// --- Professional Icons ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const MegaPhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const SuccessModal: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center transform transition-all animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <CheckCircleIcon />
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">تم النشر</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
            <button onClick={onClose} className="w-full bg-yellow-500 text-white py-3 rounded-2xl font-black shadow-lg hover:bg-yellow-600 transition-all">موافق</button>
        </div>
    </div>
);

const DeleteConfirmModal: React.FC<{ newsTitle: string; onClose: () => void; onConfirm: () => void }> = ({ newsTitle, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[200] p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm border dark:border-gray-700 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-gray-700 shadow-lg">
                <DeleteIcon />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تأكيد حذف المنشور</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-bold">هل أنت متأكد من حذف "{newsTitle}"؟ هذا الإجراء سيقوم بإزالته من لوحة متابعة الجميع.</p>
            <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all">تراجع</button>
                <button onClick={onConfirm} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all">
                    نعم، حذف
                </button>
            </div>
        </div>
    </div>
);

const NewsPage: React.FC = () => {
    const { currentUser, news, addNews, updateNews, deleteNews, users, markNewsAsSeen } = useAppContext();
    const { showToast } = useNotification();
    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
    const [isUploading, setIsUploading] = useState(false);
    
    const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sortedNews = useMemo(() => [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [news]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const compressed = await compressImage(file, 1200, 0.7);
                setImageFile(compressed);
                setVideoUrl(''); // Clear video if image is chosen
            } catch (error) {
                showToast("فشل رفع الصورة", 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            const mediaContent = mediaType === 'image' ? imageFile : videoUrl;
            addNews(title, content, mediaContent || undefined, isPinned, expiresAt || undefined);
            
            setTitle(''); setContent(''); setVideoUrl(''); setImageFile(null);
            setIsPinned(false); setExpiresAt('');
            setSuccessMessage('تم نشر الإعلان بنجاح في لوحة المتابعة.');
        }
    };

    const confirmDelete = () => {
        if (newsToDelete) {
            deleteNews(newsToDelete.id);
            setNewsToDelete(null);
        }
    };

    const renderMedia = (url?: string) => {
        if (!url) return null;

        if (url.startsWith('data:image')) {
            return <img src={url} className="w-full h-auto rounded-3xl object-cover border border-gray-100 dark:border-gray-700 shadow-inner" alt="News" />;
        }

        let embedUrl = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
                embedUrl = `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
            } else if (urlObj.hostname === 'youtu.be') {
                embedUrl = `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
            }
        } catch (e) { }

        return embedUrl ? (
            <div className="aspect-video rounded-3xl overflow-hidden border-4 border-gray-50 dark:border-gray-900 shadow-xl bg-black">
                <iframe className="w-full h-full" src={embedUrl} frameBorder="0" allowFullScreen></iframe>
            </div>
        ) : (
            <video className="w-full aspect-video rounded-3xl bg-black" src={url} controls></video>
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            {successMessage && <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />}
            {newsToDelete && <DeleteConfirmModal newsTitle={newsToDelete.title} onClose={() => setNewsToDelete(null)} onConfirm={confirmDelete} />}
            
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">النشرة الإخبارية</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">أحدث التعليمات والتحديثات من إدارة LibyPort.</p>
                </div>
            </div>

            {isAdmin && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 mb-16 animate-fade-in-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500"></div>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl text-yellow-600"><MegaPhoneIcon /></div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">نشر تعميم أو خبر جديد</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">عنوان المنشور</label>
                                <input type="text" placeholder="اكتب عنوان التعميم..." value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all font-bold text-gray-900 dark:text-white shadow-inner" required />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">محتوى الخبر</label>
                                <textarea placeholder="اكتب تفاصيل الخبر هنا..." value={content} onChange={e => setContent(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all min-h-[150px] text-gray-700 dark:text-gray-200 shadow-inner" required />
                            </div>

                            {/* Media Section */}
                            <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">مرفقات الوسائط (اختياري)</span>
                                    <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700">
                                        <button type="button" onClick={() => setMediaType('video')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mediaType === 'video' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-400'}`}><VideoIcon /> رابط فيديو</button>
                                        <button type="button" onClick={() => setMediaType('image')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mediaType === 'image' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-400'}`}><PhotoIcon /> رفع صورة</button>
                                    </div>
                                </div>

                                {mediaType === 'video' ? (
                                    <div className="animate-fade-in">
                                        <input type="url" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-mono" />
                                        <p className="text-[10px] text-gray-400 mt-2 mr-2">انسخ رابط اليوتيوب وسيتم عرضه تلقائياً.</p>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in">
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10 transition-all bg-white dark:bg-gray-800 overflow-hidden group"
                                        >
                                            {imageFile ? (
                                                <img src={imageFile} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-full text-yellow-600 mb-2 group-hover:scale-110 transition-transform"><PhotoIcon /></div>
                                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{isUploading ? 'جاري المعالجة...' : 'اختر صورة من جهازك'}</span>
                                                    <span className="text-[10px] text-gray-400 mt-1 uppercase">JPG, PNG, WEBP (Max 5MB)</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                        {imageFile && <button type="button" onClick={() => setImageFile(null)} className="mt-2 text-xs font-bold text-red-500 hover:underline">إلغاء الصورة وإعادة الاختيار</button>}
                                    </div>
                                )}
                            </div>

                            {/* Settings Section */}
                            <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                                        </div>
                                        <span className="text-sm font-black text-gray-700 dark:text-gray-200">تثبيت التنبيه (دبوس)</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">تاريخ انتهاء الصلاحية (اختياري)</label>
                                    <input 
                                        type="datetime-local" 
                                        value={expiresAt} 
                                        onChange={e => setExpiresAt(e.target.value)} 
                                        className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-bold text-gray-700 dark:text-gray-200"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 mr-2">سيتم حذف التنبيه تلقائياً بعد هذا التاريخ. اتركه فارغاً للحذف التلقائي بعد 3 أيام (إلا إذا كان مثبتاً).</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isUploading} className="bg-yellow-500 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 hover:-translate-y-1 active:scale-95 transition-all disabled:bg-gray-300">نشر الآن</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                {sortedNews.map((item, idx) => {
                    const author = users.find(u => u.id === item.authorId);
                    const isAlert = item.title.includes('تنبيه') || item.title.includes('هام');

                    return (
                        <div key={`${item.id}-${idx}`} className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-gray-50 dark:border-gray-700 overflow-hidden group animate-fade-in-up">
                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                
                                {/* Media Section of Card */}
                                {item.videoUrl && (
                                    <div className="lg:col-span-5 relative bg-gray-50 dark:bg-gray-900">
                                        <div className="h-full">
                                            {renderMedia(item.videoUrl)}
                                        </div>
                                    </div>
                                )}

                                {/* Content Section of Card */}
                                <div className={`${item.videoUrl ? 'lg:col-span-7' : 'lg:col-span-12'} p-10 md:p-12 relative flex flex-col justify-between`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isAlert ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                        {isAlert ? '🚨 تنبيه إداري' : '📢 إعلان عام'}
                                                    </span>
                                                    {item.isPinned && (
                                                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                                                            مثبت
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 font-bold">• {new Date(item.date).toLocaleDateString('ar-LY')}</span>
                                                    {item.expiresAt && (
                                                        <span className="text-[10px] text-gray-400 font-bold">• ينتهي في {new Date(item.expiresAt).toLocaleString('ar-LY')}</span>
                                                    )}
                                                </div>
                                                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-yellow-600 transition-colors">{item.title}</h2>
                                            </div>
                                            
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!item.seenBy.includes(currentUser?.id || 0) && (
                                                    <button 
                                                        onClick={() => markNewsAsSeen(item.id)} 
                                                        className="p-2 md:p-3 bg-green-50 text-green-600 rounded-xl md:rounded-2xl hover:bg-green-100 flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-black"
                                                        title="تحديد كمقروء"
                                                    >
                                                        <CheckCircleIcon />
                                                        <span>تمت المشاهدة</span>
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button onClick={() => setNewsToDelete(item)} className="p-2 md:p-3 bg-red-50 text-red-600 rounded-xl md:rounded-2xl hover:bg-red-100"><DeleteIcon /></button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                                            {item.content}
                                        </div>
                                    </div>

                                    {/* Author Info */}
                                    <div className="mt-10 pt-8 border-t dark:border-gray-700 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-yellow-600 border dark:border-gray-600">
                                            {author?.profilePicture ? <img src={author.profilePicture} className="w-full h-full object-cover rounded-2xl" /> : author?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{author?.name || 'إدارة LibyPort'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">فريق العمليات المركزية</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {sortedNews.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><MegaPhoneIcon /></div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white">لا توجد أخبار حالياً</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">عند نشر أي تحديث من الإدارة سيظهر لك هنا فوراً.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
