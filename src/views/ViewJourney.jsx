import React from 'react';
import { Lock, CheckCircle, Clock, Radio, PlayCircle, Video, FileText } from 'lucide-react';

export const ViewJourney = ({ classes }) => {
    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header><h2 className="text-2xl font-bold text-slate-800">Sua Jornada</h2><p className="text-slate-500">Explore as aulas e materiais</p></header>
            <div className="relative">
                <div className="absolute left-4 md:left-8 top-4 bottom-0 w-1 bg-slate-200 rounded-full"></div>
                <div className="space-y-8">
                    {classes.map((cls, idx) => {
                        const isLive = cls.status === 'live'; const isSoon = cls.status === 'soon'; const isCompleted = cls.status === 'completed'; const isLocked = cls.status === 'locked';
                        return (
                            <div key={cls.id} className={`relative pl-12 md:pl-20 transition-all duration-500 ${isLive ? 'z-20' : isSoon ? 'z-10' : 'opacity-90 hover:opacity-100'}`}>
                                <div className={`absolute left-0 md:left-4 top-0 rounded-full flex items-center justify-center transition-all duration-300 ${isLive ? 'w-10 h-10 md:w-12 md:h-12 bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/40 ring-4 ring-[#fdf2fa] -ml-0.5 md:-ml-1.5 animate-pulse' : isSoon ? 'w-10 h-10 md:w-12 md:h-12 bg-[#eec00a] text-[#7d126b] shadow-lg ring-4 ring-[#fff9db] -ml-0.5 md:-ml-1.5' : 'w-9 h-9 md:w-9 md:h-9 bg-white border-2 border-slate-300 text-slate-400'} ${isCompleted ? '!bg-green-500 !border-green-500 !text-white' : ''}`}>
                                    {isLocked ? <Lock size={16} /> : isCompleted ? <CheckCircle size={20} /> : isSoon ? <Clock size={24} /> : <Radio size={24} />}
                                </div>
                                <div className={`rounded-2xl border transition-all duration-300 relative ${isLive ? 'bg-white border-[#a51a8f] shadow-2xl shadow-[#a51a8f]/20 p-6 md:p-8 scale-105 origin-left ring-2 ring-[#a51a8f]/10' : isSoon ? 'bg-[#fff9db] border-[#eec00a] p-6 shadow-md scale-100' : 'bg-slate-50 border-slate-200 p-5 hover:bg-white hover:shadow-md'}`}>
                                    <h3 className={`font-bold text-slate-800 mb-2 ${isLive ? 'text-2xl' : 'text-lg'}`}>{cls.title}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
