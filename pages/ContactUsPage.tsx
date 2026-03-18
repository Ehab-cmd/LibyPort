import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const ContactUsPage: React.FC = () => {
    const { sendContactFormMessage } = useAppContext();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', company: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            const result = await sendContactFormMessage(formData);
            setSubmitStatus(result);
            if (result.success) {
                setFormData({ name: '', phone: '', email: '', company: '', subject: '', message: '' });
            }
        } catch (error) {
            setSubmitStatus({ success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white";

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">تواصل معنا</h1>
                    <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
                        لديك استفسار؟ نحن هنا للمساعدة. املأ النموذج أدناه وسنعاود الاتصال بك في أقرب وقت ممكن.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="mt-12 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">الاسم *</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200">رقم الهاتف *</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClasses} required />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">البريد الإلكتروني *</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-200">الشركة (اختياري)</label>
                            <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} className={inputClasses} />
                        </div>
                         <div className="sm:col-span-2">
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200">الموضوع *</label>
                            <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">سؤالك أو استفسارك *</label>
                            <textarea name="message" id="message" value={formData.message} onChange={handleChange} rows={4} className={inputClasses} required />
                        </div>
                    </div>

                    {submitStatus && (
                        <div className={`p-4 rounded-md text-center ${submitStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <div className="text-center">
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full sm:w-auto inline-flex justify-center py-3 px-12 border border-transparent rounded-md shadow-sm text-base font-bold text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactUsPage;
