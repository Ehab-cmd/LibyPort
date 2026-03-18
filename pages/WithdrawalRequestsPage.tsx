
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { WithdrawalRequest, WithdrawalRequestStatus, UserRole, TreasuryType } from '../types';

// --- Icons ---
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const WithdrawalRequestsPage: React.FC = () => {
    const { withdrawalRequests, users, updateWithdrawalRequestStatus, currentUser, treasuries } = useAppContext();
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [selectedTreasuryId, setSelectedTreasuryId] = useState('');

    const pendingRequests = useMemo(() => {
        return withdrawalRequests
            .filter(r => r.status === WithdrawalRequestStatus.Pending)
            .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [withdrawalRequests]);

    const historicalRequests = useMemo(() => {
        return withdrawalRequests
            .filter(r => r.status !== WithdrawalRequestStatus.Pending)
            .sort((a, b) => new Date(b.decisionDate || 0).getTime() - new Date(a.decisionDate || 0).getTime());
    }, [withdrawalRequests]);

    const stats = useMemo(() => {
        const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);
        const approvedCount = historicalRequests.filter(r => r.status === WithdrawalRequestStatus.Approved).length;
        return { totalPendingAmount, pendingCount: pendingRequests.length, approvedCount };
    }, [pendingRequests, historicalRequests]);

    const getUser = (userId: number) => users.find(u => u.id === userId);

    const handleApproveClick = (req: WithdrawalRequest) => {
        setSelectedRequest(req);
        setIsApproveModalOpen(true);
    };

    const handleConfirmApprove = () => {
        if (!selectedRequest || !selectedTreasuryId) return;
        const treasury = treasuries.find(t => t.id === selectedTreasuryId);
        if (!treasury) return;

        updateWithdrawalRequestStatus(selectedRequest.id, WithdrawalRequestStatus.Approved, treasury.type, treasury.id);
        setIsApproveModalOpen(false);
        setSelectedRequest(null);
        setSelectedTreasuryId('');
    };

    const getStatusStyles = (status: WithdrawalRequestStatus) => {
        switch (status) {
            case WithdrawalRequestStatus.Approved:
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    text: 'text-green-700 dark:text-green-400',
                    border: 'border-green-100 dark:border-green-800',
                    icon: <CheckIcon />
                };
            case WithdrawalRequestStatus.Rejected:
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    text: 'text-red-700 dark:text-red-400',
                    border: 'border-red-100 dark:border-red-800',
                    icon: <XIcon />
                };
            default:
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    text: 'text-amber-700 dark:text-amber-400',
                    border: 'border-amber-100 dark:border-amber-800',
                    icon: <PendingIcon />
                };
        }
    };

    if (!currentUser || ![UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full text-red-500 mb-4 animate-bounce">
                    <XIcon />
                </div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white">دخول غير مصرح</h2>
                <p className="text-gray-500 mt-2">عذراً، هذه الصفحة مخصصة لمديري النظام فقط.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8" dir="rtl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">طلبات سحب الرصيد</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">مراجعة ومعالجة طلبات سحب الأرباح للمتاجر والموظفين.</p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center min-w-[120px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">المبلغ المعلق</p>
                        <p className="text-lg font-black text-amber-600 font-mono">{stats.totalPendingAmount.toLocaleString()} د.ل</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">بانتظار القرار</p>
                        <p className="text-lg font-black text-gray-800 dark:text-white">{stats.pendingCount}</p>
                    </div>
                    <div className="hidden sm:flex bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">تمت الموافقة</p>
                        <p className="text-lg font-black text-green-600">{stats.approvedCount}</p>
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            {isApproveModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border dark:border-gray-700 animate-scale-in">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">الموافقة على طلب السحب</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-bold">يرجى اختيار الخزينة التي سيتم خصم المبلغ منها.</p>
                        
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl mb-6 border border-yellow-100 dark:border-yellow-800">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">المبلغ المطلوب:</span>
                                <span className="text-xl font-black text-yellow-800 dark:text-yellow-200 font-mono">{selectedRequest.amount.toLocaleString()} د.ل</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mr-2">اختر الخزينة</label>
                            <select 
                                value={selectedTreasuryId}
                                onChange={(e) => setSelectedTreasuryId(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold outline-none text-gray-900 dark:text-white"
                            >
                                <option value="">-- اختر الخزينة --</option>
                                {treasuries.filter(t => t.isActive).map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleConfirmApprove}
                                disabled={!selectedTreasuryId}
                                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                تأكيد الموافقة
                            </button>
                            <button 
                                onClick={() => { setIsApproveModalOpen(false); setSelectedRequest(null); setSelectedTreasuryId(''); }}
                                className="flex-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Tabs */}
            <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 overflow-hidden max-w-md">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <PendingIcon /> طلبات جديدة
                    {pendingRequests.length > 0 && <span className="bg-white text-yellow-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <CalendarIcon /> السجل المكتمل
                </button>
            </div>

            {/* Requests Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'pending' ? pendingRequests : historicalRequests).map(req => {
                    const user = getUser(req.userId);
                    const statusData = getStatusStyles(req.status);
                    const isPending = req.status === WithdrawalRequestStatus.Pending;

                    return (
                        <div 
                            key={req.id} 
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group animate-fade-in-up flex flex-col relative overflow-hidden"
                        >
                            {/* Visual Indicator Line */}
                            <div className={`absolute top-0 right-0 w-1.5 h-full ${isPending ? 'bg-amber-400' : req.status === WithdrawalRequestStatus.Approved ? 'bg-green-500' : 'bg-red-500'}`}></div>

                            <div className="flex justify-between items-start mb-6 pr-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600">
                                        {user?.profilePicture ? (
                                            <img src={user.profilePicture} className="w-full h-full object-cover" alt={user.name} />
                                        ) : (
                                            <span className="text-lg font-black text-gray-400 uppercase">{user?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800 dark:text-white leading-none">{user?.name || 'مستخدم غير معروف'}</h3>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-1.5">
                                            <CalendarIcon />
                                            <span>{new Date(req.requestDate).toLocaleDateString('ar-LY')}</span>
                                            <span className="mx-1">•</span>
                                            <span>{new Date(req.requestDate).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${statusData.bg} ${statusData.text} ${statusData.border}`}>
                                    <span className="w-3 h-3">{statusData.icon}</span>
                                    {req.status}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 mb-6 flex items-center justify-between border border-gray-100 dark:border-gray-700 pr-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                                        <BanknotesIcon />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">المبلغ المطلوب</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white font-mono leading-none">{req.amount.toLocaleString()}</p>
                                    <span className="text-[10px] font-bold text-gray-400 mr-1 uppercase">دينار ليبي</span>
                                </div>
                            </div>

                            {/* History Metadata */}
                            {!isPending && (
                                <div className="mb-6 space-y-2 border-t dark:border-gray-700 pt-4 px-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-bold">اتخذ القرار بتاريخ:</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-bold">{req.decisionDate ? new Date(req.decisionDate).toLocaleDateString('ar-LY') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-bold">تم بواسطة:</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-bold">{req.processedBy ? getUser(req.processedBy)?.name : '-'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons for Pending */}
                            {isPending && (
                                <div className="mt-auto flex gap-3 pr-2">
                                    <button 
                                        onClick={() => handleApproveClick(req)}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-600/20 hover:bg-green-700 transform transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <CheckIcon /> موافقة
                                    </button>
                                    <button 
                                        onClick={() => updateWithdrawalRequestStatus(req.id, WithdrawalRequestStatus.Rejected)}
                                        className="flex-1 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-2xl text-xs font-black border border-red-100 dark:border-red-900 shadow-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XIcon /> رفض
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Empty State */}
                {((activeTab === 'pending' && pendingRequests.length === 0) || (activeTab === 'history' && historicalRequests.length === 0)) && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100 dark:border-gray-600 shadow-inner">
                            <BanknotesIcon />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white">لا توجد طلبات هنا</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs text-center">كل شيء يبدو منظماً، لا توجد طلبات سحب {activeTab === 'pending' ? 'جديدة حالياً.' : 'في السجل حتى الآن.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawalRequestsPage;
