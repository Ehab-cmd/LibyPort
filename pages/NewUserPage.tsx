
import React, { useState, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User, UserRole, SubscriptionType } from '../types';
import { compressImage } from '../utils/imageHelper';

import { useNotification } from '../context/NotificationContext';

const SuccessModal: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg text-center transform transition-all animate-fade-in-up border dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">تم بنجاح!</h2>
            <p className="text-gray-600 dark:text-gray-300 my-4 text-lg">{message}</p>
            <button onClick={onClose} className="bg-yellow-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-yellow-600 mt-4">
                موافق
            </button>
        </div>
    </div>
);

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const COLORS = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500'];
const getColorForName = (name: string) => {
    if (!name) return COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index]!;
};
const Avatar: React.FC<{ name: string; src?: string | null; className?: string; textSize?: string }> = ({ name, src, className = 'w-10 h-10', textSize = 'text-lg' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colorClass = getColorForName(name || '');
    if (src) {
        return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} />;
    }
    return (
        <div className={`rounded-full flex items-center justify-center font-bold text-white ${colorClass} ${className}`}>
            <span className={textSize}>{initial}</span>
        </div>
    );
};


const NewUserPage: React.FC = () => {
    const { addUser, currentUser } = useAppContext();
    const { showToast } = useNotification();
    const navigate = ReactRouterDOM.useNavigate();

    const [newUser, setNewUser] = useState<Omit<Partial<User>, 'storeIds'>>({
        name: '',
        email: '',
        password: '',
        role: UserRole.Store, 
        isApproved: true,
        isActive: true,
        phone: '',
        city: '',
        address: '',
        subscriptionType: SubscriptionType.Standard
    });
    const [storeNames, setStoreNames] = useState<string[]>(['']);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const roleOptions = useMemo(() => {
        const allRoles = Object.values(UserRole);
        if (currentUser?.role === UserRole.Admin) {
            return allRoles.filter(r => r !== UserRole.SuperAdmin);
        }
        return allRoles;
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setNewUser(prev => ({ ...prev, [name]: checked }));
    };

    const handleStoreNameChange = (index: number, value: string) => {
        const newStoreNames = [...storeNames];
        newStoreNames[index] = value;
        setStoreNames(newStoreNames);
    };
    
    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setProfilePicture(compressed);
            } catch (error) {
                console.error("Failed to compress image", error);
                showToast("حدث خطأ أثناء معالجة الصورة", 'error');
            }
        }
    };

    const addStoreNameField = () => {
        setStoreNames([...storeNames, '']);
    };
    
    const removeStoreNameField = (index: number) => {
        const newStoreNames = storeNames.filter((_, i) => i !== index);
        setStoreNames(newStoreNames);
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.password) {
            showToast('الرجاء تعبئة الحقول المطلوبة: الاسم، البريد الإلكتروني، وكلمة المرور.', 'error');
            return;
        }
        
        // تصحيح: نستخدم null بدلاً من undefined لـ profilePicture
        const userPayload: Omit<User, 'id' | 'isDeleted' | 'storeIds'> = {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role || UserRole.Store,
            isApproved: newUser.isApproved ?? true,
            isActive: newUser.isActive ?? true,
            phone: newUser.phone || '',
            city: newUser.city || '',
            address: newUser.address || '',
            profilePicture: profilePicture || null, 
            subscriptionType: newUser.role === UserRole.Store ? (newUser.subscriptionType || SubscriptionType.Standard) : SubscriptionType.None
        };
        
        const finalStoreNames = storeNames.filter(name => name.trim() !== '');
        addUser(userPayload, finalStoreNames);

        setSuccessMessage('تم إنشاء المستخدم بنجاح!');
    };
    
    const handleCloseSuccessModal = () => {
        setSuccessMessage(null);
        navigate('/users');
    };

    const inputClasses = "w-full mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-yellow-500 focus:border-yellow-500";
    const placeholderInputClasses = `${inputClasses} placeholder-gray-500 dark:placeholder-gray-400`;

    return (
         <div className="container mx-auto p-6" dir="rtl">
            {successMessage && <SuccessModal message={successMessage} onClose={handleCloseSuccessModal} />}
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">إضافة مستخدم جديد</h1>
                <ReactRouterDOM.Link to="/users" className="text-yellow-600 hover:underline">العودة إلى القائمة</ReactRouterDOM.Link>
            </div>

            <form onSubmit={handleSaveChanges} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <Avatar name={newUser.name || ''} src={profilePicture} className="w-24 h-24" textSize="text-4xl" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                            اختر صورة للمستخدم (اختياري)
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProfilePicUpload} className="hidden" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-100">الاسم الكامل</label>
                            <input type="text" name="name" value={newUser.name || ''} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-100">البريد الإلكتروني</label>
                            <input type="email" name="email" value={newUser.email || ''} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-100">كلمة المرور</label>
                            <input type="password" name="password" value={newUser.password || ''} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-100">الدور</label>
                            <select name="role" value={newUser.role || ''} onChange={handleChange} className={inputClasses}>
                                {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        {newUser.role === UserRole.Store && (
                            <div>
                                <label className="font-semibold text-gray-800 dark:text-gray-100">نوع الاشتراك</label>
                                <select name="subscriptionType" value={newUser.subscriptionType || SubscriptionType.Standard} onChange={handleChange} className={inputClasses}>
                                    <option value={SubscriptionType.Standard}>{SubscriptionType.Standard}</option>
                                    <option value={SubscriptionType.VIP}>{SubscriptionType.VIP}</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-100">رقم الهاتف</label>
                            <input type="tel" name="phone" value={newUser.phone || ''} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-100">المدينة</label>
                            <input type="text" name="city" value={newUser.city || ''} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="font-semibold text-gray-800 dark:text-gray-100">العنوان</label>
                            <textarea name="address" value={newUser.address || ''} onChange={handleChange} className={inputClasses} rows={2}></textarea>
                        </div>
                    </div>

                    {newUser.role === UserRole.Store && (
                        <div>
                            <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-100">المتاجر المرتبطة</h3>
                            <div className="space-y-2">
                                {storeNames.map((name, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder={`اسم المتجر ${index + 1}`}
                                            value={name}
                                            onChange={(e) => handleStoreNameChange(index, e.target.value)}
                                            className={`${placeholderInputClasses} flex-grow`}
                                        />
                                        {storeNames.length > 1 && (
                                            <button type="button" onClick={() => removeStoreNameField(index)} className="text-red-500 hover:text-red-700 p-2">
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addStoreNameField} className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm font-semibold">
                                + إضافة متجر آخر
                            </button>
                        </div>
                    )}

                    <div className="border-t dark:border-gray-700 pt-4">
                        <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-100">حالة الحساب</h3>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input type="checkbox" name="isApproved" checked={!!newUser.isApproved} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-yellow-600 focus:ring-yellow-500 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500"/>
                                <span className="text-gray-800 dark:text-gray-200">معتمد</span>
                            </label>
                            <label className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input type="checkbox" name="isActive" checked={!!newUser.isActive} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-yellow-600 focus:ring-yellow-500 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500"/>
                                <span className="text-gray-800 dark:text-gray-200">نشط</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button type="submit" className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600">
                            حفظ وإنشاء المستخدم
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewUserPage;
