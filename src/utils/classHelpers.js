
export const getClassStatus = (cls) => {
    // 1. Manual Override logic
    if (cls.manualStatus === 'live') return 'live';
    if (cls.manualStatus === 'completed') return 'completed';
    if (cls.manualStatus === 'soon') return 'soon'; // Optional force soon

    // 2. Data fallback (if no scheduledAt, fallback to existing status or 'locked')
    if (!cls.scheduledAt) {
        return cls.status || 'locked';
    }

    // 3. Time-based logic
    const now = new Date();
    const start = new Date(cls.scheduledAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    if (now >= end) {
        return 'completed';
    } else if (now >= start && now < end) {
        return 'live';
    } else {
        // Check if it's "soon" (e.g., within 24 hours) or just regular upcoming
        // The user requested "Em breve" (soon). 
        // We can say anything in the future is 'soon' if it's not locked content?
        // For now, let's treat anything future as 'soon' unless explicitly locked.
        // Or maybe we want a 'locked' state for very far future? 
        // The prompt implied: soon -> live -> finished.
        return 'soon';
    }
};

export const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const isClassToday = (isoString) => {
    if (!isoString) return false;
    const date = new Date(isoString);
    const now = new Date();
    return date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
};
