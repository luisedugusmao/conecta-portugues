import React, { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { toast } from 'sonner';
import { Trophy, Star } from 'lucide-react';

export const GlobalBroadcastListener = ({ currentUserId }) => {
    const lastSeenIds = useRef(new Set());
    const isFirstLoad = useRef(true);

    useEffect(() => {
        // Listen to 'activity-log' channel in feed
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'feed'),
            where('channel', '==', 'activity-log'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (isFirstLoad.current) {
                activities.forEach(a => lastSeenIds.current.add(a.id));
                isFirstLoad.current = false;
            } else {
                activities.forEach(activity => {
                    if (!lastSeenIds.current.has(activity.id)) {
                        lastSeenIds.current.add(activity.id);

                        // If it's my own activity, I probably already saw it/know it, 
                        // but user said "notify ALL users". 
                        // Usually you don't notify yourself "You just did X" via a global broadcast 
                        // because you just did it.
                        if (activity.authorId === currentUserId) return;

                        // Toast It!
                        toast.custom((t) => (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 animate-slideUp max-w-sm relative overflow-hidden">
                                {/* User Avatar */}
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#eec00a]">
                                    {activity.authorAvatar && activity.authorAvatar.includes('http') ? (
                                        <img src={activity.authorAvatar} alt="user" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl">{activity.authorAvatar || '👤'}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                        {activity.title || 'Parabéns!'}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{activity.content}</p>

                                    {/* Rewards Badge */}
                                    {(activity.xpEarned || activity.coinsEarned) && (
                                        <div className="flex items-center gap-2 mt-1">
                                            {activity.xpEarned && (
                                                <span className="bg-[#a51a8f]/10 text-[#a51a8f] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#a51a8f]/20">
                                                    +{activity.xpEarned} XP
                                                </span>
                                            )}
                                            {activity.coinsEarned && (
                                                <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" /> +{activity.coinsEarned}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => toast.dismiss(t)} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 text-lg leading-none">&times;</button>
                            </div>
                        ), { duration: 6000 });
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [currentUserId]);

    return null; // Invisible component
};
