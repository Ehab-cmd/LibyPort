
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface Dialog {
    isOpen: boolean;
    title: string;
    message: string;
    isConfirm: boolean;
    resolve?: (value: boolean) => void;
}

interface NotificationContextType {
    showToast: (message: string, type?: ToastType) => void;
    showAlert: (message: string, title?: string) => Promise<void>;
    showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [dialog, setDialog] = useState<Dialog>({
        isOpen: false,
        title: '',
        message: '',
        isConfirm: false
    });

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const showAlert = useCallback((message: string, title: string = 'تنبيه') => {
        return new Promise<void>((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                isConfirm: false,
                resolve: () => {
                    setDialog(prev => ({ ...prev, isOpen: false }));
                    resolve();
                }
            });
        });
    }, []);

    const showConfirm = useCallback((message: string, title: string = 'تأكيد') => {
        return new Promise<boolean>((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                isConfirm: true,
                resolve: (value: boolean) => {
                    setDialog(prev => ({ ...prev, isOpen: false }));
                    resolve(value);
                }
            });
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ showToast, showAlert, showConfirm }}>
            {children}
            
            {/* Toasts Container */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 w-full max-w-xs px-4">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
                                toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                                toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                                'bg-gray-900/90 border-gray-700 text-white'
                            }`}
                        >
                            {toast.type === 'success' && (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {toast.type === 'error' && (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className="font-bold text-sm">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Dialog Modal */}
            <AnimatePresence>
                {dialog.isOpen && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !dialog.isConfirm && dialog.resolve?.(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
                        >
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{dialog.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 leading-relaxed">{dialog.message}</p>
                            
                            <div className="flex gap-3">
                                {dialog.isConfirm && (
                                    <button 
                                        onClick={() => dialog.resolve?.(false)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-4 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                )}
                                <button 
                                    onClick={() => dialog.resolve?.(true)}
                                    className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                                >
                                    {dialog.isConfirm ? 'تأكيد' : 'موافق'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};
