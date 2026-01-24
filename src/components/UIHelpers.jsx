import React from 'react';

export const NavButton = ({ active, onClick, icon, label, dark = false }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
            ? dark ? 'bg-[#eec00a] text-[#2d1b36] shadow-lg' : 'bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/30'
            : dark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
    >
        {React.cloneElement(icon, { size: 20 })}
        {label}
    </button>
);

export const MobileNavButton = ({ active, onClick, icon, label, compact = false }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full rounded-xl transition-all ${active ? 'text-[#a51a8f] bg-[#fdf2fa]' : 'text-slate-400'} ${compact ? 'py-1 gap-0.5' : 'p-2 gap-1'}`}
    >
        {icon}
        <span className={`font-bold text-center leading-none ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{label}</span>
    </button>
);

export const StudentCard = ({ student, onClick }) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-center transition-all duration-300"
    >
        <div className={`
      w-28 h-28 md:w-36 md:h-36 rounded-[2rem] flex items-center justify-center text-5xl 
      shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-all duration-500
      group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-[#a51a8f]/20
      backdrop-blur-md border border-white/50 dark:border-white/10
      ${student.role !== 'student'
                ? 'bg-[#2d1b36]/90 text-white ring-2 ring-[#eec00a]/50'
                : 'bg-white/80 dark:bg-slate-800/80 group-hover:bg-white dark:group-hover:bg-slate-700'
            }
    `}>
            {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover z-20" />
            ) : (
                <span className="z-10 transform group-hover:scale-110 transition-transform duration-300">{student.avatar}</span>
            )}
            {student.role === 'student' && !student.photoUrl && (
                <div className="absolute inset-0 bg-gradient-to-tr from-[#a51a8f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
        </div>

        <div className="mt-5 flex flex-col items-center gap-1">
            <span className={`
        text-lg font-bold transition-colors duration-300
        ${student.role !== 'student'
                    ? 'text-[#2d1b36] dark:text-white group-hover:text-[#a51a8f] dark:group-hover:text-[#d36ac1]'
                    : 'text-slate-600 dark:text-slate-300 group-hover:text-[#a51a8f] dark:group-hover:text-white'
                }
      `}>
                {student.name}
            </span>

            {student.role !== 'student' && (
                <span className="text-[10px] uppercase font-bold text-[#a51a8f] dark:text-[#eec00a] tracking-widest bg-[#a51a8f]/5 dark:bg-[#eec00a]/10 px-2 py-1 rounded-full">
                    {student.role === 'admin' ? 'Diretoria' : 'Professor'}
                </span>
            )}
        </div>
    </button>
);
