import React from 'react';
import { Trophy, Star, Radio, Clock, Video, Lock, PlayCircle, FileText, BookOpen, ShoppingBag } from 'lucide-react';
import { getFrameClass } from '../utils/items';
import { calculateLevel } from '../utils/levelLogic';
import { NotificationBell } from '../components/NotificationBell';
import { PremiumLock } from '../components/PremiumLock';

export const ViewHome = ({ student, classes, onOpenRank, onOpenStore, onOpenProfile, onNavigate }) => {
    const myClasses = classes.filter(c => !c.assignedTo || c.assignedTo.length === 0 || c.assignedTo.includes(student.id));
    const activeClass = myClasses.find(c => c.status === 'live') || myClasses.find(c => c.status === 'soon') || myClasses.find(c => c.status === 'locked');
    const { level, progress } = calculateLevel(student.xp || 0);

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Free Mode Banner */}
            {student.subscription?.planId === 'free' && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-lg mb-6 flex items-center justify-between flex-wrap gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Modo Visitante</h3>
                            <p className="text-white/80 text-sm">Acesse seu perfil para escolher um plano e desbloquear todo o conteúdo.</p>
                        </div>
                    </div>
                    <button
                        onClick={onOpenProfile}
                        className="bg-white text-purple-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm"
                    >
                        Ver Planos
                    </button>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Minha Sala de Aula</h2><p className="text-slate-500 dark:text-slate-400">Bem-vindo de volta!</p></div>
                <div className="flex items-center gap-3 flex-wrap">

                    <button
                        onClick={onOpenRank}
                        className="flex items-center gap-2 bg-[#a51a8f] hover:bg-[#8e167b] text-white px-4 py-2 rounded-full border border-[#a51a8f] shadow-sm h-12 transition-all active:scale-95"
                    >
                        <Trophy size={18} className="text-[#eec00a]" />
                        <span className="font-bold text-sm">Ranking</span>
                    </button>

                    <button onClick={onOpenStore} className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#a51a8f] hover:scale-105 transition-transform" title="Loja de Itens">
                        <ShoppingBag size={20} />
                    </button>
                    <button onClick={onOpenProfile} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1 pr-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-12 text-left">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl overflow-hidden ${getFrameClass(student.equipped?.frame)}`}>{student.photoUrl ? <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" /> : student.avatar}</div>
                        <div className="flex flex-col justify-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight">Nível {level}</span><div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden"><div className="bg-[#a51a8f] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div></div>
                    </button>
                </div>
            </header>
            <section>
                <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">{activeClass?.status === 'live' ? <Radio className="w-5 h-5 text-red-500 animate-pulse" /> : activeClass?.status === 'soon' ? <Clock className="w-5 h-5 text-[#eec00a]" /> : <Video className="w-5 h-5 text-[#a51a8f]" />}{activeClass?.status === 'live' ? 'Acontecendo Agora' : 'Próxima Aula'}</h3>
                {activeClass ? (
                    <div className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group transition-all duration-500 ${activeClass.status === 'live' ? 'bg-gradient-to-r from-[#a51a8f] to-[#7d126b] ring-4 ring-[#a51a8f]/20' : activeClass.status === 'soon' ? 'bg-gradient-to-r from-[#eec00a] to-[#d4ab09] text-yellow-900' : 'bg-gradient-to-r from-slate-700 to-slate-800'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3"><span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">{activeClass.date}</span>{activeClass.status === 'live' && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">AO VIVO</span>}{activeClass.status === 'soon' && <span className="bg-white/30 text-yellow-900 text-xs px-2 py-1 rounded font-bold">EM BREVE</span>}</div>
                            <h4 className={`text-2xl font-bold mb-2 ${activeClass.status === 'soon' ? 'text-yellow-900' : 'text-white'}`}>{activeClass.title}</h4>
                            <p className={`mb-6 max-w-md ${activeClass.status === 'soon' ? 'text-yellow-800' : 'text-[#fdf2fa]'}`}>{activeClass.description}</p>
                            {activeClass.status !== 'locked' ? (
                                <PremiumLock user={student} feature="groupClasses">
                                    <a href={activeClass.meetLink} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg ${activeClass.status === 'soon' ? 'bg-white text-yellow-900 hover:bg-yellow-50' : 'bg-[#eec00a] text-[#7d126b] hover:bg-[#d4ab09]'}`}><Video className="w-5 h-5" />{activeClass.status === 'live' ? 'Entrar Agora' : 'Link do Meet'}</a>
                                </PremiumLock>
                            ) : (<button disabled className="inline-flex items-center gap-2 bg-white/10 text-slate-300 px-6 py-3 rounded-xl font-bold cursor-not-allowed"><Lock className="w-5 h-5" />Bloqueada</button>)}
                        </div>
                    </div>
                ) : (<div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">Nenhuma aula agendada por enquanto.</div>)}
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Star className="w-5 h-5 text-[#eec00a]" />Destaque da Semana</h4><p className="text-sm text-slate-600">Parabéns ao aluno <strong>Lucas</strong> por completar todos os simulados de gramática!</p></div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" />Lembrete</h4><p className="text-sm text-slate-600">Não esqueçam de baixar o PDF da aula sobre "Verbos" na aba Jornada.</p></div>
            </section>
        </div>
    );
};
