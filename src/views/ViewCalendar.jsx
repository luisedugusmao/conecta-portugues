import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, CalendarDays, Radio, Video } from 'lucide-react';

export const ViewCalendar = ({ classes }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = new Date(year, month, 1).getDay(); // 0 is Sunday

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const classesByDay = classes.reduce((acc, cls) => {
        let dateObj = null;
        if (cls.scheduledAt) {
            dateObj = new Date(cls.scheduledAt);
        } else if (cls.date && cls.date.includes('/')) {
            // Fallback for legacy dates like '25/10' (assuming current year or hardcoded 2024/2025)
            const parts = cls.date.split('/');
            if (parts.length >= 2) {
                // Assuming format DD/MM
                dateObj = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }

        if (dateObj && dateObj.getMonth() === month && dateObj.getFullYear() === year) {
            const day = dateObj.getDate();
            if (!acc[day]) acc[day] = [];
            acc[day].push(cls);
        }
        return acc;
    }, {});

    const selectedClasses = selectedDay ? classesByDay[selectedDay] : null;

    return (
        <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn relative">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Calendário de Aulas</h2>
                    <p className="text-slate-500 dark:text-slate-400">Organize-se com a programação mensal</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <span className="font-bold text-slate-700 dark:text-slate-200 min-w-[100px] text-center">
                        {monthNames[month]} <span className="text-xs text-slate-400">{year}</span>
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden p-6">
                <div className="grid grid-cols-7 mb-4 text-center">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {Array.from({ length: firstDayOffset }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const hasClass = classesByDay[day]?.length > 0;
                        const isSelected = selectedDay === day;
                        const status = hasClass ? classesByDay[day][0].status : null; // Primitive status check for coloring

                        let bgClass = 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300';

                        if (isSelected) bgClass = 'bg-[#a51a8f] text-white shadow-lg ring-4 ring-[#fdf2fa] dark:ring-slate-600';
                        else if (status === 'live') bgClass = 'bg-[#fdf2fa] dark:bg-[#a51a8f]/20 border-2 border-[#a51a8f] text-[#a51a8f] dark:text-[#d36ac1]';
                        else if (status === 'soon') bgClass = 'bg-[#fff9db] dark:bg-yellow-900/20 border-2 border-[#eec00a] text-[#7d126b] dark:text-[#eec00a]';
                        else if (hasClass) bgClass = 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300';

                        return (
                            <button key={day} onClick={() => setSelectedDay(day)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 ${bgClass}`}>
                                <span className={`text-lg md:text-xl font-bold ${isSelected ? 'scale-110' : ''}`}>{day}</span>
                                {hasClass && (<div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : status === 'live' ? 'bg-[#a51a8f] animate-pulse' : 'bg-slate-400'}`}></div>)}
                            </button>
                        );
                    })}
                </div>
            </div>
            {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedDay(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><CalendarDays className="w-5 h-5" />{selectedDay} de {monthNames[month]}</h3><button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button></div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">{selectedClasses && selectedClasses.length > 0 ? (<div className="space-y-4">{selectedClasses.map(cls => (<div key={cls.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"><div className={`p-3 rounded-lg ${cls.status === 'live' ? 'bg-[#fdf2fa] dark:bg-[#a51a8f]/20 text-[#a51a8f] dark:text-[#d36ac1]' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>{cls.status === 'live' ? <Radio className="w-6 h-6 animate-pulse" /> : <Video className="w-6 h-6" />}</div><div><h4 className="font-bold text-slate-800 dark:text-white">{cls.title}</h4><p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{cls.description}</p><div className="flex gap-2"><span className={`text-xs font-bold px-2 py-1 rounded ${cls.status === 'live' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>{cls.status === 'live' ? 'AO VIVO' : cls.status === 'completed' ? 'ENCERRADA' : 'AGENDADA'}</span></div></div></div>))}</div>) : (<div className="text-center py-8"><div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><CalendarDays size={32} /></div><p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma aula registrada para este dia.</p></div>)}</div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center"><button onClick={() => setSelectedDay(null)} className="text-[#a51a8f] dark:text-[#d36ac1] font-bold text-sm hover:underline">Fechar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
