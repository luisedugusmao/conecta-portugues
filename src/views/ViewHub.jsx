import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, addDoc, setDoc, deleteDoc, serverTimestamp, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { Hash, Send, ThumbsUp, Heart, MessageCircle, MoreHorizontal, X, Paperclip, Image, FileText, Video, Smile, Plus, Trash2 } from 'lucide-react';
import { getFrameClass, getColorClass } from '../utils/items';
import { calculateLevel } from '../utils/levelLogic';

const DEFAULT_CHANNELS = [
    { id: 'quadro-de-avisos', label: 'Quadro de Avisos', type: 'announcement' },
    { id: 'geral', label: 'Geral', type: 'chat' },
    { id: 'novas-aulas', label: 'Novas Aulas', type: 'system' },
    { id: 'desafios', label: 'Desafios', type: 'system' },
    { id: '6-ano', label: '6º Ano', type: 'chat' },
    { id: '7-ano', label: '7º Ano', type: 'chat' },
    { id: '8-ano', label: '8º Ano', type: 'chat' },
    { id: '9-ano', label: '9º Ano', type: 'chat' }
];

export const ViewHub = ({ user, students = [] }) => {
    const [showUsers, setShowUsers] = useState(false);
    const [showAttach, setShowAttach] = useState(false);
    const [activeChannel, setActiveChannel] = useState('quadro-de-avisos');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [channels, setChannels] = useState([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [openReactionMenu, setOpenReactionMenu] = useState(null);
    const dummyRef = useRef();

    // Fetch Channels
    useEffect(() => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'channels'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty && user.role === 'admin') {
                // Seed defaults if empty and admin
                DEFAULT_CHANNELS.forEach(async (ch, index) => {
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'channels', ch.id), {
                        ...ch,
                        createdAt: serverTimestamp(),
                        order: index
                    });
                });
            } else {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (data.length > 0) {
                    // Sort manually by 'order' or fallback to index if needed, though orderBy createdAt helps
                    // Explicit sort by order if available
                    data.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setChannels(data);
                } else {
                    // Fallback to defaults purely for display if strictly empty and not admin (though seed should happen)
                    // But better to wait for seed.
                }
            }
        });
        return () => unsubscribe();
    }, [user.role]); // Depend on user.role to trigger seed check

    // Fallback for initial render or if DB fails/is empty momentarily
    const displayChannels = channels.length > 0 ? channels : DEFAULT_CHANNELS;

    // Auto-select grade channel if student
    useEffect(() => {
        if (user.role === 'student' && user.schoolYear) {
            const gradeId = user.schoolYear.toLowerCase().replace('º', '').replace(' ', '-') + '-ano';
            const slug = user.schoolYear.replace('º Ano', '-ano');
            // Check if exists in loaded channels
            if (displayChannels.some(c => c.id === slug)) {
                // Logic to auto-switch could go here if desired, 
                // but usually we let them stay on default or handle initial state.
                // For now, let's just ensure activeChannel is valid? 
                // Actually existing logic was empty, just keeping the useEffect structure.
            }
        }
    }, [user, displayChannels]);

    useEffect(() => {
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'feed'),
            where('channel', '==', activeChannel)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort to avoid missing index issues
            msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setMessages(msgs);
            // Scroll to bottom
            setTimeout(() => dummyRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => unsubscribe();
    }, [activeChannel]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Restriction: Only Admin can post in Announcement/System channels?
        const channelType = displayChannels.find(c => c.id === activeChannel)?.type;
        if ((channelType === 'announcement' || channelType === 'system') && user.role !== 'admin') {
            alert("Apenas professores podem postar aqui.");
            return;
        }

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feed'), {
            channel: activeChannel,
            content: newMessage,
            authorId: user.id,
            authorName: user.name,
            authorAvatar: user.avatar || '👤',
            role: user.role,
            createdAt: serverTimestamp(),
            reactions: {}
        });
        setNewMessage('');
    };

    const handleReaction = async (msgId, currentReactions, emoji) => {
        const msgRef = doc(db, 'artifacts', appId, 'public', 'data', 'feed', msgId);
        const reactions = { ...currentReactions };
        const userList = reactions[emoji] || [];

        if (userList.includes(user.id)) {
            // Remove reaction
            reactions[emoji] = userList.filter(id => id !== user.id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
            // Add reaction
            reactions[emoji] = [...userList, user.id];
        }

        await updateDoc(msgRef, { reactions });
    };

    const handleAddChannel = async () => {
        const name = prompt("Nome do novo canal:");
        if (!name) return;

        const id = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const type = confirm("É um canal apenas para avisos (ninguém responde)?") ? 'announcement' : 'chat';

        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'channels', id), {
                id,
                label: name,
                type,
                createdAt: serverTimestamp(),
                order: displayChannels.length + 1
            });
        } catch (error) {
            console.error(error);
            alert("Erro ao criar canal");
        }
    };

    const handleDeleteChannel = async (channelId) => {
        if (!confirm("Tem certeza que deseja excluir este canal? Todas as mensagens serão perdidas (ou ocultas).")) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'channels', channelId));
            if (activeChannel === channelId) setActiveChannel('quadro-de-avisos');
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir canal");
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 animate-fadeIn pt-0 md:pt-0 relative z-0">
            {/* Sidebar Channels */}
            <div className="w-28 md:w-64 bg-[#f3f4f6] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300">
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-700 dark:text-white flex items-center justify-start gap-2">
                        <MessageCircle className="text-[#a51a8f] shrink-0" /> <span className="truncate text-sm">O Hub</span>
                    </h2>
                    {user.role === 'admin' && (
                        <div className="flex items-center gap-1">
                            <button onClick={handleAddChannel} className="text-slate-400 hover:text-[#a51a8f] transition-colors p-1" title="Adicionar Canal">
                                <Plus size={16} />
                            </button>
                            <button onClick={() => setIsDeleteMode(!isDeleteMode)} className={`text-slate-400 hover:text-red-500 transition-colors p-1 ${isDeleteMode ? 'text-red-500 bg-red-50 rounded' : ''}`} title="Remover Canais">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {displayChannels.map(ch => (
                        <div key={ch.id} className="relative group/channel">
                            <button
                                onClick={() => setActiveChannel(ch.id)}
                                className={`w-full flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left overflow-hidden ${activeChannel === ch.id
                                    ? 'bg-white dark:bg-slate-800 text-[#a51a8f] shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                title={ch.label}
                            >
                                <span className="shrink-0"><Hash size={18} /></span>
                                <span className="truncate text-xs md:text-sm flex-1">{ch.label}</span>
                            </button>
                            {isDeleteMode && user.role === 'admin' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteChannel(ch.id); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors z-10"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* User Profile Footer */}
                <div className="py-5 px-4 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden relative">
                            {user?.avatar?.includes('http') ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="overflow-hidden hidden md:block lg:block xl:block min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">Online</p>
                        </div>
                        <div className="overflow-hidden md:hidden block min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user?.name?.split(' ')[0]}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 relative">
                {/* Channel Header */}
                <div className="h-16 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 shadow-sm z-10 bg-white dark:bg-slate-800">
                    <Hash className="text-slate-400 mr-2" />
                    <h3 className="font-bold text-slate-800 dark:text-white">{displayChannels.find(c => c.id === activeChannel)?.label || 'Selecione um canal'}</h3>
                    <div className="flex-1"></div>
                    <button onClick={() => setShowUsers(!showUsers)} className="md:hidden text-slate-400 hover:text-[#a51a8f]">
                        <MoreHorizontal />
                    </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 mt-10">
                            <p>Este canal está silencioso... por enquanto.</p>
                        </div>
                    )}
                    {messages.map(msg => {
                        const author = students.find(s => s.id === msg.authorId);
                        const isMe = msg.authorId === user.id;

                        return (
                            <div key={msg.id} className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'} group animate-slideUp`}>
                                {/* Avatar (Only for others) */}
                                {!isMe && (
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden ${getFrameClass(author?.equipped?.frame)}`}>
                                        {msg.authorAvatar.includes('http') ? <img src={msg.authorAvatar} alt="av" className="w-full h-full object-cover" /> : msg.authorAvatar}
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Author Name and Info */}
                                    {!isMe && (
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className={`font-bold text-xs ${msg.role === 'admin' ? 'text-[#a51a8f]' : getColorClass(author?.equipped?.color)}`}>
                                                {msg.authorName}
                                                {msg.role === 'admin' && <span className="ml-1 text-[9px] bg-[#a51a8f] text-white px-1 rounded uppercase">PROF</span>}
                                            </span>
                                            {msg.role === 'student' && (
                                                <span className="text-[9px] font-bold text-slate-400 leading-none">Nv. {author ? calculateLevel(author.xp || 0).level : 1}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`relative px-4 py-3 shadow-sm text-sm break-words
                                        ${isMe
                                            ? 'bg-[#a51a8f] text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm'
                                        }
                                    `}>
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                            {/* Support for system attachments/links */}
                                            {msg.metadata && msg.metadata.link && (
                                                <a href={msg.metadata.link} target="_blank" rel="noreferrer" className={`block mt-2 underline text-xs ${isMe ? 'text-white/90' : 'text-[#a51a8f]'}`}>
                                                    {msg.metadata.linkText || 'Ver Conteúdo'}
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer: Time + Reactions */}
                                    <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[10px] text-slate-400">
                                            {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </span>

                                        {/* Reactions Display */}
                                        <div className="flex flex-wrap items-center gap-1">
                                            {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg.id, msg.reactions || {}, emoji)}
                                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${users.includes(user.id) ? 'bg-[#a51a8f]/10 border-[#a51a8f]/30 text-[#a51a8f]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                >
                                                    <span>{emoji}</span>
                                                    <span className="font-bold">{users.length}</span>
                                                </button>
                                            ))}

                                            {/* Reaction Button */}
                                            <div className="relative flex items-center">
                                                <button
                                                    onClick={() => setOpenReactionMenu(openReactionMenu === msg.id ? null : msg.id)}
                                                    className={`text-slate-300 hover:text-[#a51a8f] transition-opacity ${openReactionMenu === msg.id ? 'opacity-100 text-[#a51a8f]' : 'opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    <Smile size={14} />
                                                </button>

                                                {openReactionMenu === msg.id && (
                                                    <div className={`absolute bottom-6 ${isMe ? 'right-0' : 'left-0'} bg-white dark:bg-slate-800 shadow-xl rounded-full px-2 py-1 flex gap-1 animate-scaleIn z-10 border border-slate-100 dark:border-slate-700`}>
                                                        {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => {
                                                                    handleReaction(msg.id, msg.reactions || {}, emoji);
                                                                    setOpenReactionMenu(null);
                                                                }}
                                                                className="hover:scale-125 transition-transform text-sm p-0.5"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Backdrop to close when clicking outside (simple implementation) */}
                                                {openReactionMenu === msg.id && (
                                                    <div className="fixed inset-0 z-0" onClick={() => setOpenReactionMenu(null)}></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={dummyRef}></div>
                </div>

                {/* Input Area */}
                <div className="py-3.5 px-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 relative">
                    {showAttach && (
                        <div className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 p-1.5 flex flex-col gap-1 z-30 animate-scaleIn origin-bottom-left min-w-[180px]">
                            <button className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors w-full text-left group">
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                    <Image size={16} />
                                </div>
                                <span className="text-sm font-bold">Galeria</span>
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors w-full text-left group">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <FileText size={16} />
                                </div>
                                <span className="text-sm font-bold">Documento</span>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAttach(!showAttach)}
                            className={`p-3 rounded-xl transition-colors ${showAttach ? 'bg-slate-100 text-[#a51a8f]' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-[#a51a8f]'}`}
                            title="Anexar arquivo"
                        >
                            <Paperclip size={20} />
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enviar mensagem..."
                                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 pr-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#a51a8f] focus:outline-none"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#a51a8f] disabled:opacity-50 transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Users Sidebar */}
            <div className={`w-64 bg-[#f3f4f6] dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col transition-all absolute md:relative right-0 h-full z-20 ${showUsers ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-500 text-xs uppercase">Online — {students.length}</span>
                    <button onClick={() => setShowUsers(false)} className="md:hidden text-slate-400"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Teachers */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Professores — 1</h4>
                        <div className="flex items-center gap-2 opacity-100">
                            <div className="w-8 h-8 rounded-full bg-[#a51a8f] text-white flex items-center justify-center text-sm border-2 border-green-500 relative shrink-0">
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></span>
                                🎓
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Diretoria</span>
                        </div>
                    </div>

                    {/* Students */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Alunos — {students.filter(s => s.role === 'student').length}</h4>
                        {students.filter(s => s.role === 'student').map(st => (
                            <div key={st.id} className="flex items-center gap-2 mb-2 opacity-50 hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm relative shrink-0 overflow-hidden">
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-400 rounded-full border border-white"></span>
                                    {st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.avatar || '👤'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-medium text-slate-600 dark:text-slate-300 text-sm truncate">{st.name}</p>
                                    {st.schoolYear && <p className="text-[10px] text-slate-400">{st.schoolYear}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};
