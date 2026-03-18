
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, User, ChatMessage } from '../types';
import * as ReactRouterDOM from 'react-router-dom';
import { compressImage } from '../utils/imageHelper';

// --- Professional Icons ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const AttachmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const DoubleCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

// --- Styled Components ---
const Avatar: React.FC<{ name: string; src?: string | null; className?: string; isOnline?: boolean }> = ({ name, src, className = 'w-12 h-12', isOnline }) => {
    const COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
    const getColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return COLORS[Math.abs(hash) % COLORS.length];
    };
    
    return (
        <div className="relative flex-shrink-0">
            {src ? (
                <img src={src} alt={name} className={`${className} rounded-2xl object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm`} />
            ) : (
                <div className={`${className} rounded-2xl ${getColor(name)} flex items-center justify-center text-white font-black text-lg shadow-inner ring-2 ring-white dark:ring-gray-800`}>
                    {name.charAt(0).toUpperCase()}
                </div>
            )}
            {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>}
        </div>
    );
};

const ImageViewModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4" onClick={onClose} dir="rtl">
        <button className="absolute top-8 right-8 text-white/50 hover:text-white p-3 bg-white/10 rounded-full transition-all">&times;</button>
        <img src={imageUrl} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()} />
    </div>
);

interface Conversation {
    id: number;
    participantName: string;
    participantAvatar?: string | null;
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
}

const SupportChatPage: React.FC = () => {
    const { currentUser, users, chatMessages, sendChatMessage, markMessagesAsRead } = useAppContext();
    const { showToast } = useNotification();
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isAdmin = currentUser && [UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role);

    // Derived State
    const conversations = useMemo<Conversation[]>(() => {
        if (!isAdmin || !currentUser) return [];
        const convosMap = new Map<number, Conversation>();

        [...chatMessages].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).forEach(msg => {
            if (!convosMap.has(msg.conversationId)) {
                const participant = users.find(u => u.id === msg.conversationId);
                const unreadCount = chatMessages.filter(m => m.conversationId === msg.conversationId && !m.isRead && m.senderId !== currentUser.id).length;

                convosMap.set(msg.conversationId, {
                    id: msg.conversationId,
                    participantName: participant?.name || msg.senderName || 'مستخدم غير معروف',
                    participantAvatar: participant?.profilePicture,
                    lastMessage: msg.content,
                    lastMessageTimestamp: msg.timestamp,
                    unreadCount
                });
            }
        });
        return Array.from(convosMap.values()).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }, [chatMessages, users, isAdmin, currentUser]);

    const activeConversationId = isAdmin ? selectedConversationId : currentUser?.id;

    useEffect(() => {
        if (activeConversationId && chatMessages.some(m => m.conversationId === activeConversationId && !m.isRead && m.senderId !== currentUser?.id)) {
            markMessagesAsRead(activeConversationId);
        }
    }, [activeConversationId, chatMessages, currentUser]);

    const scrollToBottom = (smooth = true) => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
        }
    };

    useEffect(() => { setTimeout(() => scrollToBottom(false), 100); }, [activeConversationId]);
    useEffect(() => { setTimeout(() => scrollToBottom(true), 100); }, [chatMessages.length]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && !attachment) || !currentUser) return;
        const receiverId = isAdmin ? selectedConversationId : users.find(u => u.role === UserRole.SuperAdmin || u.role === UserRole.Admin)?.id;
        
        if (receiverId) {
            sendChatMessage({ content: newMessage, attachmentUrl: attachment || undefined }, receiverId);
            setNewMessage('');
            setAttachment(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setIsUploading(true);
            try {
                const compressed = await compressImage(file);
                setAttachment(compressed);
            } catch (error) { showToast("فشل معالجة الصورة", 'error'); }
            finally { setIsUploading(false); }
        }
    };

    const activeMessages = useMemo(() => {
        return chatMessages.filter(m => m.conversationId === activeConversationId)
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [chatMessages, activeConversationId]);

    const activeParticipant = useMemo(() => {
        if (!activeConversationId) return null;
        return users.find(u => u.id === activeConversationId);
    }, [activeConversationId, users]);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden" dir="rtl">
            {viewingImage && <ImageViewModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
            
            {/* Sidebar (Admin Only) */}
            {isAdmin && (
                <div className={`w-full md:w-[380px] border-l border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-8 pb-4">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">الدردشات</h1>
                        <div className="mt-4 relative">
                            <input type="text" placeholder="البحث في المحادثات..." className="w-full p-3 pr-10 rounded-2xl bg-white dark:bg-gray-800 border-none shadow-sm text-sm" />
                            <div className="absolute right-3 top-3.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto px-4 space-y-2 custom-scrollbar pb-10">
                        {conversations.map(convo => (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedConversationId(convo.id)}
                                className={`w-full text-right p-4 rounded-3xl flex items-center gap-4 transition-all group ${selectedConversationId === convo.id ? 'bg-yellow-500 text-white shadow-xl shadow-yellow-500/20' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            >
                                <Avatar name={convo.participantName} src={convo.participantAvatar} isOnline={true} />
                                <div className="min-w-0 flex-grow">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-black text-sm truncate">{convo.participantName}</h3>
                                        <span className={`text-[9px] font-bold opacity-70 ${selectedConversationId === convo.id ? 'text-white' : 'text-gray-400'}`}>
                                            {new Date(convo.lastMessageTimestamp).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${selectedConversationId === convo.id ? 'text-yellow-50' : 'text-gray-500 dark:text-gray-400'}`}>{convo.lastMessage}</p>
                                </div>
                                {convo.unreadCount > 0 && selectedConversationId !== convo.id && (
                                    <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">{convo.unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Viewport */}
            <div className={`flex-grow flex flex-col min-w-0 bg-white dark:bg-gray-900 ${isAdmin && !selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                {activeConversationId ? (
                    <>
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                {isAdmin && <button onClick={() => setSelectedConversationId(null)} className="md:hidden p-2 text-gray-400 hover:text-gray-900"><BackIcon /></button>}
                                <Avatar name={activeParticipant?.name || 'مستخدم'} src={activeParticipant?.profilePicture} className="w-11 h-11" />
                                <div>
                                    <h2 className="font-black text-gray-900 dark:text-white leading-tight">{activeParticipant?.name || 'دعم LibyPort'}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                         <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> متصل الآن
                                        </p>
                                        <span className="text-[8px] text-gray-400 font-bold bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full border dark:border-gray-700 flex items-center gap-1">
                                            <LockIcon /> الرسائل تختفي بعد 24 ساعة من القراءة
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30">
                            <div className="flex justify-center mb-4">
                                <span className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-[9px] font-black text-gray-400 border border-gray-100 dark:border-gray-800 uppercase tracking-widest">
                                    سيتم حذف الرسائل تلقائياً بعد 24 ساعة من فتحها
                                </span>
                            </div>
                            
                            {activeMessages.map((msg, i) => {
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
                                        <div className={`max-w-[80%] md:max-w-md lg:max-w-lg group relative`}>
                                            <div className={`p-4 shadow-sm transition-all ${isMe ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-3xl rounded-tr-none' : 'bg-gray-900 text-white rounded-3xl rounded-tl-none'}`}>
                                                {msg.attachmentUrl && (
                                                    <div className="mb-3 rounded-2xl overflow-hidden cursor-zoom-in border border-white/10" onClick={() => setViewingImage(msg.attachmentUrl!)}>
                                                        <img src={msg.attachmentUrl} alt="Attachment" className="w-full h-auto" />
                                                    </div>
                                                )}
                                                {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                                <div className={`mt-2 flex items-center text-[9px] font-bold opacity-50 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <span className="mr-2">{msg.isRead ? <DoubleCheckIcon /> : '✓'}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 md:p-8 bg-white dark:bg-gray-900">
                            {attachment && (
                                <div className="mb-4 inline-flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-yellow-500 animate-fade-in">
                                    <img src={attachment} className="h-16 w-16 object-cover rounded-xl shadow-md" alt="Preview" />
                                    <div className="pr-2">
                                        <p className="text-[10px] font-black text-yellow-600 uppercase">جاهز للإرسال</p>
                                        <button onClick={() => setAttachment(null)} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 mt-1"><CloseIcon /> حذف المرفق</button>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                                <div className="relative flex-grow group">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="اكتب رسالتك..."
                                        className="w-full p-4 pr-5 pl-24 rounded-3xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-medium focus:ring-2 focus:ring-yellow-500 transition-shadow shadow-inner text-gray-900 dark:text-white"
                                    />
                                    <div className="absolute left-2 top-2 flex gap-1">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-yellow-600 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all">
                                            {isUploading ? <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent animate-spin rounded-full"></div> : <AttachmentIcon />}
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </div>
                                </div>
                                <button type="submit" disabled={!newMessage.trim() && !attachment} className="bg-yellow-500 text-white p-4 rounded-3xl font-black shadow-xl shadow-yellow-500/30 hover:bg-yellow-600 hover:-translate-y-1 active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed">
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-900/50">
                        <div className="relative mb-8">
                             <div className="w-32 h-32 bg-yellow-100 rounded-[2.5rem] flex items-center justify-center text-5xl animate-bounce duration-[3000ms]">💬</div>
                             <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">?</div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">مرحباً بك في مركز الدعم</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed font-medium">
                            {isAdmin ? 'اختر محادثة من القائمة الجانبية للبدء في الرد على استفسارات المتاجر والموظفين.' : 'فريق LibyPort جاهز للرد على استفساراتك حول الشحنات والعمليات المالية.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportChatPage;
