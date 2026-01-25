import { Clock } from 'lucide-react';
import { calculateLevel } from '../utils/levelLogic';
import { getFrameClass, getColorClass } from '../utils/items';

export const ViewRank = ({ students, currentStudentId }) => {
    // Sort by monthly XP, fallback to total XP
    const sortedStudents = [...students].filter(s => s.role === 'student').sort((a, b) => (b.monthlyXP || 0) - (a.monthlyXP || 0));

    // Calculate days remaining
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((lastDay - today) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ranking Mensal</h2>
                    <p className="text-slate-500 dark:text-slate-400">Quem será o Destaque do Mês?</p>
                </div>
                <div className="bg-[#a51a8f]/10 dark:bg-[#a51a8f]/20 px-4 py-2 rounded-xl flex items-center gap-2 text-[#a51a8f] font-bold text-sm border border-[#a51a8f]/20">
                    <Clock size={18} />
                    <span>Reinicia em {daysRemaining} dias</span>
                </div>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"><div className="bg-[#a51a8f] dark:bg-[#7d126b] p-4 text-white font-bold grid grid-cols-6 gap-2 text-sm md:text-base"><div className="col-span-1 text-center">#</div><div className="col-span-3">Aluno</div><div className="col-span-2 text-right">XP Mensal</div></div><div className="divide-y divide-slate-100 dark:divide-slate-700">{sortedStudents.map((st, idx) => { const isMe = st.id === currentStudentId; let rankIcon = null; if (idx === 0) rankIcon = '🥇'; if (idx === 1) rankIcon = '🥈'; if (idx === 2) rankIcon = '🥉'; return (<div key={st.id} className={`grid grid-cols-6 gap-2 p-4 items-center ${isMe ? 'bg-[#fff9db] dark:bg-yellow-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}><div className="col-span-1 text-center font-bold text-slate-600 dark:text-slate-400 flex justify-center items-center">{rankIcon ? <span className="text-2xl">{rankIcon}</span> : `#${idx + 1}`}</div><div className="col-span-3 flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl overflow-hidden ${getFrameClass(st.equipped?.frame)}`}>{st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.avatar}</div><div className="flex flex-col"><span className={`font-bold ${isMe ? 'text-[#a51a8f] dark:text-[#eec00a]' : getColorClass(st.equipped?.color)}`}>{st.name} {isMe && '(Você)'}</span><span className="text-xs text-slate-400">Nível {calculateLevel(st.xp || 0).level}</span></div></div><div className="col-span-2 text-right font-mono font-bold text-[#a51a8f] dark:text-[#d36ac1]">{st.monthlyXP?.toLocaleString() || 0} XP</div></div>); })}</div></div>
        </div>
    );
};
