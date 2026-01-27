import { useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';

export const useClassReminders = (user, classes) => {
    useEffect(() => {
        if (!user || user.role !== 'student' || !classes || classes.length === 0) return;

        const checkReminders = async () => {
            const now = new Date();

            classes.forEach(async (cls) => {
                // Determine if class is relevant for this student
                const isAssigned = !cls.assignedTo || cls.assignedTo.length === 0 || cls.assignedTo.includes(user.id);
                if (!isAssigned) return;

                // 1. Check for "10 minutes before" reminder
                if (cls.scheduledAt) {
                    const scheduledTime = new Date(cls.scheduledAt);
                    const timeDiff = scheduledTime.getTime() - now.getTime();
                    const minutesDiff = timeDiff / (1000 * 60);

                    // If between 0 and 10 minutes (exclusive of 0 to avoid notifying after start if user logs in late, but let's say 0-10)
                    // Actually, let's say 9-11 minutes to be precise, OR use a flag "hasNotified".
                    // Using localStorage is safer to avoid repeated notifications.

                    if (minutesDiff > 0 && minutesDiff <= 10) {
                        const storageKey = `notified_10min_${cls.id}_${user.id}`;
                        if (!localStorage.getItem(storageKey)) {
                            // Create Notification
                            try {
                                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), {
                                    recipientId: user.id,
                                    title: '⏰ Aula em breve!',
                                    message: `A aula "${cls.title}" começa em ${Math.ceil(minutesDiff)} minutos. Prepare-se!`,
                                    type: 'class_reminder',
                                    read: false,
                                    createdAt: serverTimestamp(),
                                    link: '/hub' // Assuming classes are in Hub
                                });
                                localStorage.setItem(storageKey, 'true');
                                console.log(`Notificação de 10min criada para aula ${cls.title}`);
                            } catch (err) {
                                console.error("Erro ao criar notificação de lembrete", err);
                            }
                        }
                    }
                }

                // 2. Check for "Ao Vivo" status
                // If status is explicitly 'live' OR (scheduledAt is passed and manualStatus is not 'finished')
                // Wait, previous logic says status is 'live' based on time. 
                // Let's rely on the `status` field if it exists, or check time.
                // Assuming `classHelpers` or manual status sets it to 'live'.
                // If the class is HAPPENING NOW (start time passed, end time not passed), or manually 'live'.

                const isLive = cls.manualStatus === 'live' || (cls.status === 'live');
                // Note: cls.status might be computed in UI. The raw data has `scheduledAt`.
                // Let's check time strictly if no status field.

                let currentlyLive = false;
                if (cls.manualStatus === 'live') currentlyLive = true;
                else if (cls.scheduledAt) {
                    const scheduledTime = new Date(cls.scheduledAt);
                    const diff = now.getTime() - scheduledTime.getTime();
                    // Live if started less than 1 hour ago (assuming 1h duration) and not manually finished
                    if (diff > 0 && diff < 60 * 60 * 1000 && cls.manualStatus !== 'finished') {
                        currentlyLive = true;
                    }
                }

                if (currentlyLive) {
                    const storageKey = `notified_live_${cls.id}_${user.id}`;
                    if (!localStorage.getItem(storageKey)) {
                        try {
                            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), {
                                recipientId: user.id,
                                title: '🔴 Aula Ao Vivo!',
                                message: `A aula "${cls.title}" já começou! Clique para entrar.`,
                                type: 'class_live',
                                read: false,
                                createdAt: serverTimestamp(),
                                link: cls.meetLink || '/hub'
                            });
                            localStorage.setItem(storageKey, 'true');
                            console.log(`Notificação de Ao Vivo criada para aula ${cls.title}`);
                        } catch (err) {
                            console.error("Erro ao criar notificação ao vivo", err);
                        }
                    }
                }
            });
        };

        // Run check immediately and then every minute
        checkReminders();
        const interval = setInterval(checkReminders, 60000);

        return () => clearInterval(interval);
    }, [user, classes]);
};
