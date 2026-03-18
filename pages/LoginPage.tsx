
// ... (keep imports)
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';

// ... (keep icons)
const EyeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /> <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /> </svg> );
const EyeOffIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" /> <path d="M10 17a7 7 0 01-7-7c0-1.554.524-3.006 1.413-4.288l-1.473-1.473a1 1 0 111.414-1.414l14 14a1 1 0 11-1.414 1.414l-1.473-1.473A7.003 7.003 0 0110 17z" /> </svg> );


const LoginPage: React.FC = () => {
    const { login, currentUser, companyInfo } = useAppContext();
    const location = ReactRouterDOM.useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message);
        }
    };
    
    if (currentUser) {
        return <ReactRouterDOM.Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex flex-col flex-grow items-center justify-center p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row rounded-2xl shadow-xl overflow-hidden" style={{ maxHeight: '85vh' }}>
                <div className="w-full md:w-1/2 lg:w-5/12 p-8 lg:p-12 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col justify-center z-10 relative">
                    <div className="w-full max-w-md mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">أهلاً بكم في LibyPort ! 👋</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">يرجى تسجيل الدخول إلى حسابك.</p>
                        
                         {successMessage && (
                            <div className="bg-green-100 border-r-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 relative" role="alert">
                                <p className="font-bold">نجاح!</p> <p>{successMessage}</p> <button onClick={() => setSuccessMessage('')} className="absolute top-0 bottom-0 left-0 px-4 py-3"> <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg> </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-800 dark:text-gray-200"> البريد الإلكتروني </label>
                                <div className="mt-1"> <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required /> </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-800 dark:text-gray-200"> كلمة المرور </label>
                                    <div className="text-sm"> <ReactRouterDOM.Link to="/forgot-password" className="font-medium text-yellow-600 hover:text-yellow-500">نسيت كلمة المرور؟</ReactRouterDOM.Link> </div>
                                </div>
                                <div className="mt-1 relative"> <input id="password-login" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required /> <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600" aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} > {showPassword ? <EyeOffIcon /> : <EyeIcon />} </button> </div>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div> <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors" > تسجيل الدخول </button> </div>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300"> ليس لديك حساب؟{' '} <ReactRouterDOM.Link to="/register" className="font-medium text-yellow-600 hover:text-yellow-500"> إنشاء حساب جديد </ReactRouterDOM.Link> </p>
                    </div>
                </div>
                <div className="hidden md:block md:w-1/2 lg:w-7/12 relative min-h-[400px] bg-gray-900 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop')", }} ></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/60 to-yellow-600/30 mix-blend-hard-light"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-12 z-10 text-right">
                        <div className="flex justify-end"> <div className="w-16 h-16 border-2 border-yellow-500/50 rounded-full flex items-center justify-center animate-pulse"> <div className="w-10 h-10 bg-yellow-500/20 rounded-full"></div> </div> </div>
                        <div className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
                            <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-2">Liby<span className="text-yellow-500">Port</span></h1>
                            <h2 className="text-2xl text-gray-200 font-light mb-4 border-b-2 border-yellow-500 inline-block pb-1">بوابة طرابلس العالمية</h2>
                            <p className="text-gray-300 text-lg">نظامك المتكامل لإدارة الشحنات والتجارة الإلكترونية.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center animate-fade-in-up">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    برمجة وتطوير بواسطة <span className="text-yellow-600 dark:text-yellow-500">
                        {companyInfo.developerName || 'LibyPort Tech'}
                    </span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">&copy; {new Date().getFullYear()} كافة الحقوق محفوظة</p>
            </div>
        </div>
    );
};

export default LoginPage;
