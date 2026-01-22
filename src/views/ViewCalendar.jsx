import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X, Radio, Video } from 'lucide-react';

export const ViewCalendar = ({ classes }) => {
    const daysInMonth = 31; const startDayOffset = 2; const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const [selectedDay, setSelectedDay] = useState(null);
    const classesByDay = classes.reduce((acc, cls) => {
        let day = null; if (cls.date.includes('/')) day = parseInt(cls.date.split('/')[0]); else if (cls.date.includes('AGORA') || cls.date.includes('AO VIVO')) day = 20; else if (cls.date.includes('HOJE')) day = 22;
        if (day) { if (!acc[day]) acc[day] = []; acc[day].push(cls); } return acc;
    }, {});
    const selectedClasses = selectedDay ? classesByDay[selectedDay] : null;

    return (
        <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn relative">
            <header className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800">Calendário de Aulas</h2></div></header>
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden p-6">
                <div className="grid grid-cols-7 mb-4 text-center">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (<div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>))}</div>
                <div className="grid grid-cols-7 gap-2 md:gap-4">{Array.from({ length: startDayOffset }).map((_, i) => (<div key={`empty-${i}`} className="aspect-square"></div>))}{days.map(day => { const hasClass = classesByDay[day]?.length > 0; const isSelected = selectedDay === day; const status = hasClass ? classesByDay[day][0].status : null; let bgClass = 'bg-slate-50 hover:bg-slate-100 text-slate-700'; if (isSelected) bgClass = 'bg-[#a51a8f] text-white shadow-lg ring-4 ring-[#fdf2fa]'; else if (status === 'live') bgClass = 'bg-[#fdf2fa] border-2 border-[#a51a8f] text-[#a51a8f]'; return (<button key={day} onClick={() => setSelectedDay(day)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 ${bgClass}`}><span className={`text-lg md:text-xl font-bold ${isSelected ? 'scale-110' : ''}`}>{day}</span></button>); })}</div>
            </div>
            {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedDay(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><CalendarDays className="w-5 h-5" />{selectedDay} de Outubro</h3><button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button></div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">{selectedClasses && selectedClasses.length > 0 ? (<div className="space-y-4">{selectedClasses.map(cls => (<div key={cls.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"><div className={`p-3 rounded-lg ${cls.status === 'live' ? 'bg-[#fdf2fa] text-[#a51a8f]' : 'bg-slate-200 text-slate-500'}`}>{cls.status === 'live' ? <Radio className="w-6 h-6 animate-pulse" /> : <Video className="w-6 h-6" />}</div><div><h4 className="font-bold text-slate-800">{cls.title}</h4></div></div>))}</div>) : (<div className="text-center py-8"><p className="text-slate-500 font-medium">Nenhuma aula registrada para este dia.</p></div>)}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
