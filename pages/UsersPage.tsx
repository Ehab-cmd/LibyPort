
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { UserRole, User } from '../types';

// --- Professional Icons ---
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.18-2.422a12.02 12.02 0 005.644 0L19 20.417A12.02 12.02 0 0017.618 5.984z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group transition-all hover:shadow-xl hover:-translate-y-1">
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 transition-transform group-hover:scale-110`}>
            {icon}
        </div>
    </div>
);

const UserAvatar: React.FC<{ name: string; src?: string | null; role: UserRole }> = ({ name, src, role }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const roleColors: Record<UserRole, string> = {
        [UserRole.SuperAdmin]: 'from-purple-500 to-purple-600',
        [UserRole.Admin]: 'from-blue-500 to-blue-600',
        [UserRole.Store]: 'from-yellow-500 to-yellow-600',
        [UserRole.Employee]: 'from-emerald-500 to-emerald-600',
    };
    if (src) return <img src={src} alt={name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-800 shadow-md" />;
    return <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white bg-gradient-to-br ${roleColors[role]} shadow-lg ring-2 ring-white dark:ring-gray-800`}>{initial}</div>;
};

const UsersPage: React.FC = () => {
    const { users, currentUser } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    const formatLastActive = (dateStr?: string) => {
        if (!dateStr) return 'لم يسجل دخول مسبقاً';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 5) return <span className="text-green-500 font-black animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> نشط الآن</span>;
        
        if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        
        return date.toLocaleDateString('ar-LY', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredUsers = useMemo(() => {
        let list = users.filter(user => !user.isDeleted);
        if (currentUser?.role === UserRole.Admin) {
            list = list.filter(user => user.role !== UserRole.SuperAdmin);
        }
        return list.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }, [users, currentUser, searchTerm, roleFilter]);

    const stats = useMemo(() => {
        const total = users.filter(u => !u.isDeleted).length;
        const admins = users.filter(u => !u.isDeleted && (u.role === UserRole.Admin || u.role === UserRole.SuperAdmin)).length;
        const stores = users.filter(u => !u.isDeleted && u.role === UserRole.Store).length;
        const pending = users.filter(u => !u.isDeleted && !u.isApproved).length;
        return { total, admins, stores, pending };
    }, [users]);

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case UserRole.SuperAdmin: return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30';
            case UserRole.Admin: return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30';
            case UserRole.Store: return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30';
            case UserRole.Employee: return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
                <div className="animate-fade-in-up flex-1">
                    <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">إدارة الكادر البشري</h1>
                    <p className="hidden md:block text-gray-500 dark:text-gray-400 mt-2 font-medium">التحكم في صلاحيات المستخدمين، اعتماد المتاجر، ومراقبة النشاط.</p>
                </div>
                <ReactRouterDOM.Link to="/users/new" className="w-full md:w-auto bg-yellow-500 text-white px-3 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all flex items-center justify-center gap-1.5 text-xs md:text-base whitespace-nowrap">
                    <UserPlusIcon /> إضافة مستخدم جديد
                </ReactRouterDOM.Link>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 mb-8 md:mb-12">
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between group transition-all hover:shadow-xl">
                    <div className="text-center md:text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">المستخدمين</p>
                        <p className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.total}</p>
                    </div>
                    <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/10 mt-2 md:mt-0 scale-75 md:scale-100">
                        <UserGroupIcon />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between group transition-all hover:shadow-xl">
                    <div className="text-center md:text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">المسؤولين</p>
                        <p className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.admins}</p>
                    </div>
                    <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/10 mt-2 md:mt-0 scale-75 md:scale-100">
                        <ShieldCheckIcon />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between group transition-all hover:shadow-xl">
                    <div className="text-center md:text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">المتاجر</p>
                        <p className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.stores}</p>
                    </div>
                    <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-yellow-500 text-white shadow-lg shadow-yellow-500/10 mt-2 md:mt-0 scale-75 md:scale-100">
                        <UserGroupIcon />
                    </div>
                </div>
                <div className="hidden lg:flex bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 items-center justify-between group transition-all hover:shadow-xl">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">بانتظار الاعتماد</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.pending}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/10">
                        <ClockIcon />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-700 mb-6 md:mb-8 flex flex-col lg:flex-row items-center gap-3 md:gap-4">
                <div className="relative flex-grow w-full">
                    <input type="text" placeholder="ابحث بالاسم، البريد الإلكتروني..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 md:p-4 pr-10 md:pr-12 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-yellow-500 font-bold dark:text-white transition-all shadow-inner text-xs md:text-base" />
                    <div className="absolute right-3 md:right-4 top-3 md:top-4.5 text-gray-400 scale-75 md:scale-100"><SearchIcon /></div>
                </div>
                <div className="flex gap-1.5 md:gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                    <button onClick={() => setRoleFilter('all')} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${roleFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 dark:bg-gray-700'}`}>الكل</button>
                    {Object.values(UserRole).map(role => (
                        <button key={role} onClick={() => setRoleFilter(role)} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${roleFilter === role ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-50 text-gray-500 dark:bg-gray-700'}`}>{role}</button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-50 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-right"><thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] border-b dark:border-gray-700"><tr><th className="px-8 py-6">المستخدم</th><th className="px-6 py-6">الدور الوظيفي</th>{isSuperAdmin && <th className="px-6 py-6">آخر تواجد بالمنظومة</th>}<th className="px-6 py-6 text-center">الحالة</th><th className="px-8 py-6 text-left">إجراءات</th></tr></thead><tbody className="divide-y dark:divide-gray-700">{filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <UserAvatar name={user.name} src={user.profilePicture} role={user.role} />
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white text-base leading-tight group-hover:text-yellow-600 transition-colors">{user.name}</p>
                                                <p className="text-xs text-gray-400 font-bold mt-1">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleBadgeColor(user.role)} shadow-sm`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    {isSuperAdmin && (
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{formatLastActive(user.lastActive)}</span>
                                                {!user.lastActive && <span className="text-[8px] text-red-400 uppercase font-black tracking-widest mt-1">Inactive</span>}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex justify-center">
                                            {user.isActive ? 
                                                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-100 dark:bg-green-900/20 dark:text-green-400">نشط</span> :
                                                <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-lg border border-red-100 dark:bg-red-900/20 dark:text-red-400">معطل</span>
                                            }
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <div className="flex items-center gap-2">
                                            <ReactRouterDOM.Link to={`/financials/settlement/${user.id}`} className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg font-black text-[10px] border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all" title="تقرير التصفية">تصفية</ReactRouterDOM.Link>
                                            <ReactRouterDOM.Link to={`/users/${user.id}`} className="bg-white dark:bg-gray-800 px-5 py-2.5 rounded-xl font-black text-xs text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-yellow-500 hover:text-white transition-all">إدارة الحساب</ReactRouterDOM.Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody></table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <UserAvatar name={user.name} src={user.profilePicture} role={user.role} />
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white text-sm leading-tight">{user.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
                                    {user.isActive ? 
                                        <span className="text-[8px] font-black text-green-500 flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full"></span> نشط</span> :
                                        <span className="text-[8px] font-black text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span> معطل</span>
                                    }
                                </div>
                            </div>
                            {isSuperAdmin && (
                                <div className="mb-4 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">آخر تواجد بالمنظومة</p>
                                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{formatLastActive(user.lastActive)}</p>
                                </div>
                            )}
                            <div className="pt-4 border-t dark:border-gray-700 flex gap-2">
                                <ReactRouterDOM.Link to={`/financials/settlement/${user.id}`} className="flex-1 text-center py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">تصفية مالية</ReactRouterDOM.Link>
                                <ReactRouterDOM.Link to={`/users/${user.id}`} className="flex-1 text-center py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-[10px] font-black text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all">إدارة الحساب ⬅️</ReactRouterDOM.Link>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400 font-bold text-sm">لا يوجد مستخدمين مطابقين للبحث</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
