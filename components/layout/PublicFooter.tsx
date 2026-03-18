
import React from 'react';
import { useAppContext } from '../../context/AppContext';

// --- Social Icons ---
const FacebookIcon = () => ( <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg> );
const InstagramIcon = () => ( <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.149 0-3.51.012-4.74.069-2.73.125-3.951 1.346-4.076 4.076-.057 1.23-.069 1.59-.069 4.74s.012 3.51.069 4.74c.125 2.73 1.346 3.951 4.076 4.076 1.23.057 1.59.069 4.74.069s3.51-.012 4.74-.069c2.73-.125 3.951-1.346 4.076-4.076.057-1.23.069-1.59.069-4.74s-.012-3.51-.069-4.74c-.125-2.73-1.346-3.951-4.076-4.076-1.23-.057-1.59-.069-4.74-.069zM12 6.873a5.127 5.127 0 100 10.254 5.127 5.127 0 000-10.254zm0 8.372a3.245 3.245 0 110-6.49 3.245 3.245 0 010 6.49zm6.361-8.435a1.232 1.232 0 100-2.464 1.232 1.232 0 000 2.464z" /></svg> );
const WhatsAppIcon = () => ( <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.12c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24zm4.52-6.13c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79 1-.15.17-.29.2-.54.07-.25-.12-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.38.1-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.4-.42-.55-.42h-.5c-.15 0-.39.04-.6.31-.2.25-.79.76-.79 1.85s.81 2.15.93 2.3.79 1.25 1.93 1.8 1.6.39 1.88.31c.28-.08.88-.36 1-.71.12-.35.12-.64.08-.76-.04-.12-.15-.2-.25-.31z" /></svg> );

const PublicFooter: React.FC = () => {
    const { companyInfo } = useAppContext();
    
    return (
        <footer className="bg-gray-950 text-white relative overflow-hidden">
            {/* Top Decorative Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
            
            <div className="container mx-auto py-8 md:py-12 px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
                    
                    {/* Brand Section */}
                    <div className="flex-1 text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                             <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-xl">
                                <img src="https://up6.cc/2025/10/176278012677161.jpg" alt="L" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                             </div>
                             <div>
                                <h3 className="text-xl md:text-3xl font-black text-yellow-500 tracking-tighter leading-none">LibyPort</h3>
                                <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1">بوابة طرابلس العالمية</p>
                             </div>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto md:mx-0">
                            نحن ملتزمون بتقديم أفضل حلول الشحن والخدمات اللوجستية في ليبيا، نربطك بالعالم بكل سهولة وأمان.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex-1 grid grid-cols-2 gap-8 text-right">
                        <div>
                            <h4 className="text-yellow-500 font-black text-sm mb-4 uppercase tracking-widest">الروابط السريعة</h4>
                            <ul className="space-y-2 text-xs text-gray-400 font-bold">
                                <li><a href="/" className="hover:text-white transition-colors">الرئيسية</a></li>
                                <li><a href="/track" className="hover:text-white transition-colors">تتبع الشحنات</a></li>
                                <li><a href="/shipping-calculator" className="hover:text-white transition-colors">حاسبة الشحن</a></li>
                                <li><a href="/instant-products" className="hover:text-white transition-colors">متجر LibyPort</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-yellow-500 font-black text-sm mb-4 uppercase tracking-widest">تواصل معنا</h4>
                            <ul className="space-y-2 text-xs text-gray-400 font-bold">
                                <li className="flex items-center gap-2 justify-end">
                                    <span>طرابلس، ليبيا</span>
                                </li>
                                <li className="flex items-center gap-2 justify-end">
                                    <span dir="ltr">+218 94 440 0399</span>
                                </li>
                                <li className="flex items-center gap-2 justify-end">
                                    <span>info@liby2port.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Social & Dev Section */}
                    <div className="flex-1 flex flex-col items-center md:items-end gap-6">
                         <div className="flex gap-3">
                            <a href="https://www.facebook.com/LibyPort" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-yellow-600 hover:border-yellow-500 transition-all transform hover:-translate-y-1 shadow-2xl">
                                <FacebookIcon />
                            </a>
                            <a href="#" className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-yellow-600 hover:border-yellow-500 transition-all transform hover:-translate-y-1 shadow-2xl">
                                <InstagramIcon />
                            </a>
                            <a href={`https://wa.me/218944400399?text=${encodeURIComponent("طلبت فتح حساب لديكم من اجل العمل في مجال التجارة الاكترونية")}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-green-600 hover:border-green-500 transition-all transform hover:-translate-y-1 shadow-2xl">
                                <WhatsAppIcon />
                            </a>
                         </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} LibyPort Enterprise. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-yellow-500 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
