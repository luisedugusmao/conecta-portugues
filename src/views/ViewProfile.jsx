import React from 'react';
import { X, Trophy, Star, TrendingUp, Calendar, Award } from 'lucide-react';
import { getFrameClass, getColorClass } from '../utils/items';
import { calculateLevel } from '../utils/levelLogic';

export const ViewProfile = ({ user, onClose }) => {
    // Dynamic Level Logic
    const { level, currentLevelXP, xpNeededForNextLevel, progress, xpRemaining } = calculateLevel(user.xp || 0);

    // Mock History (since we don't have real history yet)
    const history = [
        { id: 1, action: 'Quiz Completado: Gramática', xp: 150, date: 'Hoje' },
        { id: 2, action: 'Desafio Diário', xp: 50, date: 'Ontem' },
        { id: 3, action: 'Presença na Aula', xp: 20, date: 'Ontem' },
        { id: 4, action: 'Quiz Completado: Literatura', xp: 150, date: '3 dias atrás' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp relative flex flex-col" onClick={e => e.stopPropagation()}>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white z-10 transition-colors">
                    <X size={20} />
                </button>

                {/* Profile Header */}
                <div className="relative pt-10 pb-6 px-6 text-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 group">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-3 overflow-hidden ${getFrameClass(user.equipped?.frame)}`}>
                        {user.photoUrl ? <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" /> : user.avatar}
                    </div>
                    <h2 className={`text-2xl font-bold mb-1 ${getColorClass(user.equipped?.color)}`}>{user.name}</h2>
                    <p className="text-slate-500 text-sm font-medium">Estudante • {user.schoolYear || 'N/A'}</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                    {/* Level Progress */}
                    <div className="bg-[#fdf2fa] dark:bg-slate-700/30 p-5 rounded-2xl border border-[#a51a8f]/10">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-[#a51a8f] font-bold text-lg">Nível {level}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Rumo ao nível {level + 1}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-slate-700 dark:text-white">{currentLevelXP}</span>
                                <span className="text-sm text-slate-400 font-medium"> / {xpNeededForNextLevel} XP</span>
                            </div>
                        </div>

                        <div className="h-3 bg-white dark:bg-slate-700 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-slate-600 mb-2">
                            <div className="h-full bg-gradient-to-r from-[#a51a8f] to-[#d946ef] transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-500 font-medium">
                            Faltam <span className="font-bold text-[#a51a8f]">{xpRemaining} XP</span> para alcançar o próximo nível!
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex flex-col items-center justify-center gap-1">
                            <Trophy className="text-[#a51a8f] mb-1" />
                            <span className="text-2xl font-bold text-slate-700 dark:text-white">{user.xp || 0}</span>
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">XP Total</span>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center gap-1">
                            <Star className="text-[#eec00a] mb-1 fill-[#eec00a]" />
                            <span className="text-2xl font-bold text-slate-700 dark:text-white">{user.coins}</span>
                            <span className="text-xs text-yellow-600/70 dark:text-yellow-500 uppercase font-bold tracking-wider">Estrelas</span>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                            <TrendingUp size={18} className="text-slate-400" />
                            Histórico de XP
                        </h3>
                        <div className="space-y-3">
                            {history.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.action}</p>
                                            <p className="text-[10px] text-slate-400">{item.date}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[#a51a8f] text-sm">+{item.xp} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
