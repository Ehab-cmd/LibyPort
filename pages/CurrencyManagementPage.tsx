
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CurrencyType, CurrencyTxType, UserRole, CompanyTxType, ExpenseCategory, PaymentStatus } from '../types';

import { useNotification } from '../context/NotificationContext';

const BuyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const SpendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const CurrencyManagementPage: React.FC = () => {
    const { currentUser, currencyBalances, currencyTransactions, addCurrencyTransaction, deleteCurrencyTransaction, exchangeRate, addCompanyTransaction } = useAppContext();
    const { showToast, showConfirm } = useNotification();
    
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [spendModalOpen, setSpendModalOpen] = useState(false);
    const [adjModalOpen, setAdjModalOpen] = useState(false);
    
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(CurrencyType.USD);
    const [usdAmountToSpend, setUsdAmountToSpend] = useState(''); // Always input in USD
    const [amount, setAmount] = useState(''); // Used for Adjustment/Buy
    const [buyRate, setBuyRate] = useState(String(exchangeRate));
    const [description, setDescription] = useState('');
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | 'none'>('none');

    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    // Parity Constants
    const EUR_USD_PARITY = 1.085;
    const USD_AED_PARITY = 3.6725;
    const USD_SAR_PARITY = 3.7500;

    const report = useMemo(() => {
        const usd = currencyBalances[CurrencyType.USD] || 0;
        const eur = currencyBalances[CurrencyType.EUR] || 0;
        const aed = currencyBalances[CurrencyType.AED] || 0;
        const sar = currencyBalances[CurrencyType.SAR] || 0;
        const lyd = currencyBalances[CurrencyType.LYD] || 0;
        
        const totalLydCapital = currencyTransactions
            .filter(tx => tx.type === CurrencyTxType.Adjustment && tx.currency === CurrencyType.LYD)
            .reduce((sum, tx) => sum + tx.amount, 0);

        const consolidatedUSD = usd + (eur * EUR_USD_PARITY) + (aed / USD_AED_PARITY) + (sar / USD_SAR_PARITY);
        const foreignAssetsMarketValueLYD = consolidatedUSD * exchangeRate;
        const totalPortfolioMarketValueLYD = foreignAssetsMarketValueLYD + lyd;
        const netProfitLoss = totalPortfolioMarketValueLYD - totalLydCapital;

        return {
            totalLydCapital,
            consolidatedUSD,
            foreignAssetsMarketValueLYD,
            totalPortfolioMarketValueLYD,
            netProfitLoss,
            usdInUSD: usd,
            eurInUSD: eur * EUR_USD_PARITY,
            aedInUSD: aed / USD_AED_PARITY,
            sarInUSD: sar / USD_SAR_PARITY,
            lydCash: lyd
        };
    }, [currencyBalances, currencyTransactions, exchangeRate]);

    // Calculate cross-currency spend feedback
    const spendFeedback = useMemo(() => {
        const usdValue = parseFloat(usdAmountToSpend) || 0;
        const currentWalletBal = currencyBalances[selectedCurrency] || 0;
        
        // Calculate how much to deduct from the selected wallet based on parity
        let amountToDeductFromWallet = usdValue;
        if (selectedCurrency === CurrencyType.EUR) amountToDeductFromWallet = usdValue / EUR_USD_PARITY;
        if (selectedCurrency === CurrencyType.AED) amountToDeductFromWallet = usdValue * USD_AED_PARITY;
        if (selectedCurrency === CurrencyType.SAR) amountToDeductFromWallet = usdValue * USD_SAR_PARITY;

        const remaining = currentWalletBal - amountToDeductFromWallet;
        const lydEquiv = usdValue * exchangeRate;

        return { amountToDeductFromWallet, remaining, lydEquiv, usdValue };
    }, [usdAmountToSpend, selectedCurrency, currencyBalances, exchangeRate]);

    const handleAddBuyTx = async () => {
        if (!amount || !buyRate || !description) {
            showToast('الرجاء تعبئة كافة البيانات', 'error');
            return;
        }
        const numAmount = parseFloat(amount);
        const numRate = parseFloat(buyRate);
        
        await addCurrencyTransaction({
            date: new Date().toISOString(),
            type: CurrencyTxType.Buy,
            currency: selectedCurrency,
            amount: numAmount,
            rateToLYD: numRate,
            lydAmount: numAmount * numRate,
            description: description
        });
        
        setBuyModalOpen(false);
        setAmount('');
        setDescription('');
    };

    const handleAddSpendTx = async () => {
        if (!usdAmountToSpend || !description) {
            showToast('الرجاء تعبئة كافة البيانات', 'error');
            return;
        }
        const currentBal = currencyBalances[selectedCurrency] || 0;

        if (spendFeedback.amountToDeductFromWallet > currentBal) {
            const confirmed = await showConfirm('تنبيه الرصيد', `⚠️ تنبيه: الرصيد المتوفر في محفظة ${selectedCurrency} هو (${currentBal})، بينما تكلفة المصروف تعادل (${spendFeedback.amountToDeductFromWallet.toFixed(2)}). هل تريد تسجيل العملية كعجز؟`);
            if (!confirmed) return;
        }
        
        // 1. Record the Foreign Currency Deduction (using the converted amount for the specific wallet)
        await addCurrencyTransaction({
            date: new Date().toISOString(),
            type: CurrencyTxType.Spend,
            currency: selectedCurrency,
            amount: spendFeedback.amountToDeductFromWallet,
            description: `[سداد مصروف بـ $] ${description} (القيمة الأصلية: $${spendFeedback.usdValue})`
        });

        // 2. If categorized, record in LYD general ledger
        if (expenseCategory !== 'none') {
            await addCompanyTransaction({
                type: CompanyTxType.Expense,
                expenseCategory: expenseCategory as ExpenseCategory,
                amount: spendFeedback.lydEquiv,
                beneficiary: `سداد مصروف من رصيد ${selectedCurrency}`,
                description: `[مصروف دولي] ${description} ($${spendFeedback.usdValue})`,
                paymentStatus: PaymentStatus.Paid,
                processedBy: currentUser?.id,
                date: new Date().toISOString()
            });
        }
        
        setSpendModalOpen(false);
        setUsdAmountToSpend('');
        setDescription('');
        setExpenseCategory('none');
    };

    const handleAddAdjustment = async () => {
        if (!amount || !description) {
            showToast('الرجاء إدخال القيمة والبيان', 'error');
            return;
        }
        
        await addCurrencyTransaction({
            date: new Date().toISOString(),
            type: CurrencyTxType.Adjustment,
            currency: CurrencyType.LYD,
            amount: parseFloat(amount),
            description: description
        });
        
        setAdjModalOpen(false);
        setAmount('');
        setDescription('');
    };

    if (!isSuperAdmin) return <div className="p-20 text-center font-black text-red-600">🚫 غير مصرح لك بدخول هذه المنطقة المالية الحساسة.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <div className="animate-fade-in-up flex-1">
                    <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">خزينة العملات والأصول</h1>
                    <p className="hidden md:block text-gray-500 mt-2 font-medium">إدارة السيولة الأجنبية، سداد الإعلانات والمشتريات المباشرة.</p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <button onClick={() => setAdjModalOpen(true)} className="flex-1 md:flex-none bg-blue-600 text-white p-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex flex-col md:flex-row items-center justify-center gap-1 text-[10px] md:text-sm">
                        <PlusIcon /> <span className="whitespace-nowrap">رأس مال</span>
                    </button>
                    <button onClick={() => setBuyModalOpen(true)} className="flex-1 md:flex-none bg-green-600 text-white p-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all flex flex-col md:flex-row items-center justify-center gap-1 text-[10px] md:text-sm">
                        <BuyIcon /> <span className="whitespace-nowrap">شراء عملة</span>
                    </button>
                    <button onClick={() => setSpendModalOpen(true)} className="flex-1 md:flex-none bg-red-600 text-white p-3 md:px-5 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all flex flex-col md:flex-row items-center justify-center gap-1 text-[10px] md:text-sm">
                        <SpendIcon /> <span className="whitespace-nowrap">تسجيل مصروف</span>
                    </button>
                </div>
            </div>

            {/* Performance Widgets (LYD View) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
                <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 md:w-2 h-full bg-blue-500"></div>
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رأس المال النقدي المودع</p>
                    <p className="text-xl md:text-4xl font-black text-gray-900 dark:text-white font-mono">
                        {report.totalLydCapital.toLocaleString()} <span className="text-[10px] md:text-sm opacity-50">د.ل</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 md:w-2 h-full bg-yellow-500"></div>
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">القيمة السوقية الحالية (Market Value)</p>
                    <p className="text-xl md:text-4xl font-black text-gray-900 dark:text-white font-mono">
                        {report.totalPortfolioMarketValueLYD.toLocaleString(undefined, {maximumFractionDigits: 2})} <span className="text-[10px] md:text-sm opacity-50">د.ل</span>
                    </p>
                </div>

                <div className={`p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl border relative overflow-hidden ${report.netProfitLoss >= 0 ? 'bg-green-50 border-green-100 dark:bg-green-900/20' : 'bg-red-50 border-red-100 dark:bg-red-900/20'}`}>
                    <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${report.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {report.netProfitLoss >= 0 ? 'صافي الربح التقديري' : 'صافي العجز التقديري'}
                    </p>
                    <p className={`text-xl md:text-4xl font-black font-mono ${report.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(report.netProfitLoss).toLocaleString(undefined, {maximumFractionDigits: 2})} <span className="text-[10px] md:text-sm opacity-50">د.ل</span>
                    </p>
                </div>
            </div>

            {/* Wallets Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
                {[
                    { type: CurrencyType.USD, bal: currencyBalances[CurrencyType.USD], usdVal: report.usdInUSD, label: 'رصيد الدولار' },
                    { type: CurrencyType.EUR, bal: currencyBalances[CurrencyType.EUR], usdVal: report.eurInUSD, label: 'رصيد اليورو' },
                    { type: CurrencyType.AED, bal: currencyBalances[CurrencyType.AED], usdVal: report.aedInUSD, label: 'رصيد الدرهم' },
                    { type: CurrencyType.SAR, bal: currencyBalances[CurrencyType.SAR], usdVal: report.sarInUSD, label: 'رصيد الريال' }
                ].map(item => (
                    <div key={item.type} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:border-yellow-500 transition-all group shadow-sm">
                         <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">{item.label}</p>
                         <p className="text-sm md:text-2xl font-black font-mono text-gray-900 dark:text-white mb-1 md:mb-2 truncate">{item.bal.toLocaleString()} <span className="text-[8px] md:text-xs font-normal opacity-40">{item.type}</span></p>
                         <p className="text-[8px] md:text-[10px] text-green-600 dark:text-green-500 font-bold italic">المعادل: {item.usdVal.toLocaleString()} $</p>
                    </div>
                ))}
            </div>

            {/* Transactions View (Table for Desktop, Cards for Mobile) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-xl border dark:border-gray-700 overflow-hidden">
                <div className="p-5 md:p-8 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h2 className="text-sm md:text-xl font-black text-gray-800 dark:text-white">سجل حركات الخزينة والعملات</h2>
                </div>
                
                {/* Desktop View Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-5">التاريخ</th>
                                <th className="px-6 py-5">نوع الحركة</th>
                                <th className="px-6 py-5">البيان</th>
                                <th className="px-6 py-5 text-center">المبلغ (أجنبي)</th>
                                <th className="px-8 py-5 text-left">التأثير (د.ل)</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {[...currencyTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-8 py-5 text-gray-500 font-bold text-xs">{new Date(tx.date).toLocaleDateString('ar-LY')}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                            tx.type === CurrencyTxType.Buy ? 'bg-green-50 text-green-700 border-green-100' : 
                                            tx.type === CurrencyTxType.Adjustment ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-black text-gray-800 dark:text-white">{tx.description}</td>
                                    <td className={`px-6 py-5 text-center font-black ${tx.type === CurrencyTxType.Spend ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === CurrencyTxType.Spend ? '-' : '+'}{tx.amount.toLocaleString(undefined, {maximumFractionDigits: 2})} {tx.currency}
                                    </td>
                                    <td className={`px-8 py-5 text-left font-black ${tx.type === CurrencyTxType.Buy ? 'text-red-500' : (tx.currency === 'LYD' ? 'text-green-600' : 'text-gray-400')}`}>
                                        {tx.lydAmount ? `-${tx.lydAmount.toLocaleString()} د.ل` : (tx.currency === 'LYD' ? `+${tx.amount.toLocaleString()} د.ل` : '-')}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button onClick={() => deleteCurrencyTransaction(tx.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-3 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                    {[...currencyTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                        <div key={tx.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border dark:border-gray-700 relative animate-fade-in-up">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-right">
                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{new Date(tx.date).toLocaleDateString('ar-LY')}</span>
                                    <h3 className="font-black text-gray-900 dark:text-white text-xs leading-tight mt-1 truncate max-w-[150px]">{tx.description}</h3>
                                </div>
                                <div className="text-left">
                                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase border ${
                                        tx.type === CurrencyTxType.Buy ? 'bg-green-50 text-green-700 border-green-100' : 
                                        tx.type === CurrencyTxType.Adjustment ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                        {tx.type}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">المبلغ (أجنبي)</p>
                                    <p className={`text-sm font-black font-mono leading-none ${tx.type === CurrencyTxType.Spend ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === CurrencyTxType.Spend ? '-' : '+'}{tx.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                    </p>
                                    <span className="text-[7px] font-bold text-gray-400">{tx.currency}</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">التأثير (د.ل)</p>
                                    <p className={`text-sm font-black font-mono leading-none ${tx.type === CurrencyTxType.Buy ? 'text-red-500' : (tx.currency === 'LYD' ? 'text-green-600' : 'text-gray-400')}`}>
                                        {tx.lydAmount ? `-${tx.lydAmount.toLocaleString()}` : (tx.currency === 'LYD' ? `+${tx.amount.toLocaleString()}` : '-')}
                                    </p>
                                    {tx.lydAmount && <span className="text-[7px] font-bold text-gray-400">د.ل</span>}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => deleteCurrencyTransaction(tx.id)}
                                className="absolute top-3 left-3 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
                
                {[...currencyTransactions].length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-gray-800">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-200 mb-4 border-2 border-dashed">
                             <BuyIcon />
                        </div>
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest italic">لا توجد حركات مسجلة</h3>
                    </div>
                )}
            </div>

            {/* SPEND MODAL WITH AUTOMATIC CROSS-CURRENCY CONVERSION */}
            {spendModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4" dir="rtl">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-red-600 flex items-center gap-3">
                                <SpendIcon /> تسجيل مصروف (إعلانات / مشتريات)
                            </h2>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-800">
                                <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-widest">$1 = {exchangeRate} LYD</span>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Base USD Cost Input */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border-2 border-red-500">
                                <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 mr-2">قيمة التكلفة المطلوبة بـ (الدولار الأمريكي $)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={usdAmountToSpend} 
                                        onChange={e => setUsdAmountToSpend(e.target.value)} 
                                        className="w-full p-5 bg-white dark:bg-gray-700 border-none rounded-2xl font-black text-4xl text-center text-red-600 focus:ring-0" 
                                        placeholder="0.00" 
                                        autoFocus
                                    />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-200">$</span>
                                </div>
                                <p className="text-[9px] text-center text-gray-400 mt-3 font-bold">ادخل السعر كما هو في فيسبوك أو فاتورة المورد</p>
                            </div>

                            {/* Wallet Selection */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 mr-2">اختر المحفظة التي سيتم الخصم منها:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[CurrencyType.USD, CurrencyType.EUR, CurrencyType.AED, CurrencyType.SAR].map(cur => (
                                        <button 
                                            key={cur}
                                            onClick={() => setSelectedCurrency(cur)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${selectedCurrency === cur ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md scale-105' : 'border-transparent bg-gray-50 dark:bg-gray-800 opacity-60'}`}
                                        >
                                            <span className="font-black text-sm">{cur === 'USD' ? 'محفظة الدولار' : cur === 'EUR' ? 'محفظة اليورو' : cur === 'AED' ? 'محفظة الدرهم' : 'محفظة الريال'}</span>
                                            <span className="text-[10px] font-bold text-gray-400 mt-1">المتوفر: {currencyBalances[cur]?.toLocaleString() || 0}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conversion Feedback */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-blue-400 uppercase mb-1">سيتم خصم من المحفظة</p>
                                    <p className={`text-xl font-black ${spendFeedback.remaining < 0 ? 'text-red-600 animate-pulse' : 'text-blue-700 dark:text-blue-300'}`}>
                                        {spendFeedback.amountToDeductFromWallet.toLocaleString(undefined, {maximumFractionDigits: 2})} <span className="text-xs font-normal opacity-60">{selectedCurrency}</span>
                                    </p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-blue-400 uppercase mb-1">المعادل بالدينار</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">
                                        {spendFeedback.lydEquiv.toLocaleString()} <span className="text-xs font-normal opacity-60">د.ل</span>
                                    </p>
                                </div>
                                {selectedCurrency !== CurrencyType.USD && (
                                    <div className="col-span-2 border-t border-blue-100 dark:border-blue-800 pt-2">
                                        <p className="text-[8px] text-blue-400 font-bold italic uppercase">سعر التحويل المعتمد: {selectedCurrency === 'EUR' ? '1€ = 1.085$' : selectedCurrency === 'AED' ? '1$ = 3.67 AED' : '1$ = 3.75 SAR'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Expense Details */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">وصف المصروف</label>
                                <input 
                                    type="text" 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold" 
                                    placeholder="مثال: إعلانات فيسبوك شهر يناير، شراء بضاعة تركيا..." 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-10">
                            <button onClick={() => setSpendModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                            <button onClick={handleAddSpendTx} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all transform active:scale-95">تأكيد عملية السداد</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Adjustment and Buy Modals */}
            {adjModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4" dir="rtl">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up">
                        <h2 className="text-2xl font-black mb-6">إيداع رأس مال (د.ل)</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">المبلغ المودع</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-2xl text-center" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">البيان</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl font-bold" placeholder="إيداع نقدي..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-10">
                            <button onClick={() => setAdjModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                            <button onClick={handleAddAdjustment} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl">تأكيد الإيداع</button>
                        </div>
                    </div>
                </div>
            )}

            {buyModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4" dir="rtl">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up">
                        <h2 className="text-2xl font-black mb-6">شراء عملة أجنبية</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">العملة</label>
                                <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value as CurrencyType)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-lg">
                                    <option value={CurrencyType.USD}>الدولار ($)</option>
                                    <option value={CurrencyType.EUR}>اليورو (€)</option>
                                    <option value={CurrencyType.AED}>الدرهم (AED)</option>
                                    <option value={CurrencyType.SAR}>الريال (SAR)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">القيمة</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-xl text-center" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">السعر (د.ل)</label>
                                    <input type="number" value={buyRate} onChange={e => setBuyRate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-xl text-center" placeholder="7.20" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 mr-2">وصف</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold" placeholder="شراء عملة..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-10">
                            <button onClick={() => setBuyModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-2xl">إلغاء</button>
                            <button onClick={handleAddBuyTx} className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl">تأكيد الشراء</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="h-20"></div>
        </div>
    );
};

export default CurrencyManagementPage;
