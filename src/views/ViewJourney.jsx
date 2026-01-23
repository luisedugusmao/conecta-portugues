import React from 'react';
import { CheckCircle, Clock, Radio, Lock, PlayCircle, Video, FileText } from 'lucide-react';

export const ViewJourney = ({ classes }) => {
    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sua Jornada</h2><p className="text-slate-500 dark:text-slate-400">Explore as aulas e materiais</p></header>
            <div className="relative">
                <div className="absolute left-4 md:left-8 top-4 bottom-0 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="space-y-8">
                    {classes.map((cls, idx) => {
                        const isLive = cls.status === 'live'; const isSoon = cls.status === 'soon'; const isCompleted = cls.status === 'completed'; const isLocked = cls.status === 'locked';
                        return (
                            <div key={cls.id} className={`relative pl-12 md:pl-20 transition-all duration-500 ${isLive ? 'z-20' : isSoon ? 'z-10' : 'opacity-90 hover:opacity-100'}`}>
                                <div className={`absolute left-0 md:left-4 top-0 rounded-full flex items-center justify-center transition-all duration-300 ${isLive ? 'w-10 h-10 md:w-12 md:h-12 bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/40 ring-4 ring-[#fdf2fa] dark:ring-slate-800 -ml-0.5 md:-ml-1.5 animate-pulse' : isSoon ? 'w-10 h-10 md:w-12 md:h-12 bg-[#eec00a] text-[#7d126b] shadow-lg ring-4 ring-[#fff9db] dark:ring-slate-800 -ml-0.5 md:-ml-1.5' : 'w-9 h-9 md:w-9 md:h-9 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'} ${isCompleted ? '!bg-green-500 !border-green-500 !text-white' : ''}`}>
                                    {isLocked ? <Lock size={16} /> : isCompleted ? <CheckCircle size={20} /> : isSoon ? <Clock size={24} /> : <Radio size={24} />}
                                </div>
                                <div className={`rounded-2xl border transition-all duration-300 relative ${isLive ? 'bg-white dark:bg-slate-800 border-[#a51a8f] shadow-2xl shadow-[#a51a8f]/20 p-6 md:p-8 scale-105 origin-left ring-2 ring-[#a51a8f]/10' : isSoon ? 'bg-[#fff9db] dark:bg-yellow-900/10 border-[#eec00a] p-6 shadow-md scale-100' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'}`}>
                                    <div className="flex justify-between items-start mb-3"><span className={`text-xs font-bold uppercase tracking-wider ${isLive ? 'text-[#a51a8f]' : isSoon ? 'text-yellow-700 dark:text-yellow-500' : 'text-slate-400'}`}>{cls.date}</span>{isLive && <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-extrabold shadow-sm animate-pulse">AO VIVO</span>}{isSoon && <span className="bg-[#eec00a] text-[#7d126b] text-xs px-3 py-1 rounded-full font-bold">EM BREVE</span>}{isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded font-bold">Encerrada</span>}{isLocked && <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded font-bold">Bloqueada</span>}</div>
                                    <h3 className={`font-bold text-slate-800 dark:text-white mb-2 ${isLive ? 'text-2xl' : 'text-lg'}`}>{cls.title}</h3>
                                    <p className={`mb-4 ${isLive ? 'text-slate-600 dark:text-slate-300 text-base' : 'text-slate-500 dark:text-slate-400 text-sm'}`}>{cls.description}</p>
                                    {!isLocked && (
                                        <div className={`flex flex-wrap gap-3 pt-4 border-t ${isLive ? 'border-[#a51a8f]/10' : isSoon ? 'border-yellow-200 dark:border-yellow-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                                            {cls.recordingLink ? (<a href={cls.recordingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><PlayCircle className="w-4 h-4" />Assistir Gravação</a>) : (cls.meetLink && (<a href={cls.meetLink} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isLive ? 'bg-[#a51a8f] text-white hover:bg-[#7d126b] shadow-md shadow-[#a51a8f]/30' : isSoon ? 'bg-[#eec00a] text-[#7d126b] hover:bg-[#d4ab09]' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}><Video className="w-4 h-4" />{isLive ? 'Entrar na Aula' : isSoon ? 'Link da Aula' : 'Acessar'}</a>))}
                                            {cls.materials?.map((mat, i) => (<button key={i} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLive || isSoon ? 'bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-black/40' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}><FileText className="w-4 h-4" />{mat.title}</button>))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
