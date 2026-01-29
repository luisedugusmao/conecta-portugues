import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../firebase';

export const NotificationBell = ({ userId, userRole, onNavigate }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Refs for manual diffing
    const lastSeenIds = React.useRef(new Set());
    const isFirstLoad = React.useRef(true);

    useEffect(() => {
        if (!userId) return;

        // Listen for notifications for this user
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'notifications'),
            where('recipientId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            } catch (error) {
                console.error("Notification snapshot error:", error);
            }
        }, (error) => {
            console.error("Notification listener failed:", error);
        });

        return () => unsubscribe();
    }, [userId]);

    // Separate effect for Toasts to ensure stability and avoid Firestore SDK conflicts
    useEffect(() => {
        if (notifications.length === 0) return;

        // On first load, don't toast everything. Mark current IDs as seen.
        if (isFirstLoad.current) {
            notifications.forEach(n => lastSeenIds.current.add(n.id));
            isFirstLoad.current = false;
            return;
        }

        // Check for new notifications
        notifications.forEach(n => {
            if (!lastSeenIds.current.has(n.id)) {
                lastSeenIds.current.add(n.id);
                // Only toast if unread
                if (!n.read) {
                    toast(n.title, {
                        description: n.message,
                        duration: 4000,
                    });
                }
            }
        });
    }, [notifications]);

    const handleNotificationClick = async (notif) => {
        // Mark as read
        if (!notif.read) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', notif.id), {
                read: true
            });
        }

        // Navigate
        if (onNavigate && notif.link) {
            // Check if link is a view name (starts with /)
            if (notif.link.startsWith('/')) {
                const view = notif.link.substring(1); // remove /
                onNavigate(view);
            } else if (notif.link.startsWith('http')) {
                window.open(notif.link, '_blank');
            }
            setIsOpen(false);
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        for (const n of unread) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', n.id), {
                read: true
            });
        }
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notificações"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-[#a51a8f] animate-pulse-slow' : 'text-slate-500 dark:text-slate-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-slideUp">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-slate-800 dark:text-white">Notificações</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs font-bold text-[#a51a8f] hover:underline">
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhuma notificação nova.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${!notif.read ? 'bg-[#fdf2fa]/50 dark:bg-[#a51a8f]/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-[#a51a8f]' : 'bg-transparent'}`}></div>
                                                <div className="flex-1">
                                                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 mt-2 block">
                                                        {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Recente'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
