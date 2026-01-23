import React, { useState, useEffect } from 'react';
import { signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';
import { BackgroundPaths } from './BackgroundPaths';
import { ThemeToggle } from './ThemeToggle';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Search, ChevronRight, ChevronLeft, Users } from 'lucide-react';
import { LogoSVG } from './LogoSVG';
import { StudentCard } from './UIHelpers';
import { seedDatabase } from '../utils/seeder';
import { addRandomStudents } from '../utils/randomStudents';

export const LoginWall = ({ onLogin }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authReady, setAuthReady] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        const setup = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
            else await signInAnonymously(auth);
            setAuthReady(true);
        };
        setup();
    }, []);

    useEffect(() => {
        if (!authReady) return;
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => a.name.localeCompare(b.name));
            setStudents(data);
        }, (err) => console.error(err));
        return () => unsubscribe();
    }, [authReady]);

    const handleLogin = () => {
        if (password === selectedStudent.password) onLogin(selectedStudent);
        else { setError('Senha incorreta!'); setPassword(''); }
    };

    const getDisplayData = () => {
        let baseList = showAdminLogin ? students.filter(s => s.role !== 'student') : students.filter(s => s.role === 'student');

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return {
                mode: 'search',
                data: baseList.filter(s => s.name.toLowerCase().includes(lower))
            };
        }

        if (showAdminLogin) return { mode: 'flat', data: baseList };

        if (selectedClass) {
            const classStudents = baseList.filter(s => (s.schoolYear || 'Outros') === selectedClass);
            return { mode: 'class', data: classStudents, title: selectedClass };
        }

        const grouped = baseList.reduce((acc, student) => {
            const year = student.schoolYear || 'Outros';
            if (!acc[year]) acc[year] = [];
            acc[year].push(student);
            return acc;
        }, {});

        const sortOrder = ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Ano', '2º Ano', '3º Ano', 'Outros'];
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            const idxA = sortOrder.indexOf(a);
            const idxB = sortOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        return {
            mode: 'root',
            data: sortedKeys.map(k => ({ title: k, students: grouped[k] }))
        };
    };

    const displayInfo = getDisplayData();

    return (
        <BackgroundPaths>
            <SpeedInsights />
            <ThemeToggle />
            {!selectedStudent && (<button onClick={() => { setShowAdminLogin(!showAdminLogin); setSelectedStudent(null); setSelectedClass(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-[#a51a8f] text-[10px] font-bold uppercase tracking-[0.2em] transition-colors z-20">{showAdminLogin ? 'ALUNOS' : 'ADMIN'}</button>)}

            <div className="z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 pt-16 md:pt-0">
                <div className="w-full max-w-sm mb-8 transform hover:scale-105 transition-transform duration-700">
                    <LogoSVG className="w-full h-auto drop-shadow-[0_10px_20px_rgba(255,255,255,0.8)] dark:drop-shadow-xl" />
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg font-medium tracking-wide animate-fadeIn">
                    {showAdminLogin ? 'Área Restrita - Selecione o Usuário' : 'Selecione seu perfil para entrar'}
                </p>

                {!selectedStudent ? (
                    <div className="w-full max-w-5xl animate-slideUp flex flex-col items-center">
                        {/* Search Bar */}
                        <div className="w-full max-w-sm relative mb-10">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar seu nome..."
                                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a51a8f] shadow-lg transition-all dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-full">
                            {(displayInfo.mode === 'search' || displayInfo.mode === 'flat') && (
                                <div className="space-y-4 animate-fadeIn">
                                    {displayInfo.mode === 'search' && <h3 className="text-center text-slate-500 mb-4">Resultados da busca</h3>}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center justify-items-center">
                                        {displayInfo.data.map(student => (
                                            <StudentCard key={student.id} student={student} onClick={() => setSelectedStudent(student)} />
                                        ))}
                                    </div>
                                    {displayInfo.data.length === 0 && <p className="text-center text-slate-400">Nenhum aluno encontrado.</p>}
                                </div>
                            )}

                            {displayInfo.mode === 'root' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mx-auto animate-slideUp">
                                    {displayInfo.data.map(group => (
                                        <button
                                            key={group.title}
                                            onClick={() => setSelectedClass(group.title)}
                                            className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-105 hover:shadow-xl flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#a51a8f]/10 dark:bg-[#a51a8f]/20 rounded-2xl flex items-center justify-center text-[#a51a8f] dark:text-[#d36ac1]">
                                                    <Users size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{group.title}</h3>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{group.students.length} Alunos</p>
                                                </div>
                                            </div>

                                            <div className="flex -space-x-3 items-center ml-auto mr-4">
                                                {group.students.slice(0, 5).map((student, idx) => (
                                                    <div key={student.id + idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative z-0">
                                                        {student.photoUrl ? (
                                                            <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs">{student.avatar}</span>
                                                        )}
                                                    </div>
                                                ))}
                                                {group.students.length > 5 && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 z-10">
                                                        +{group.students.length - 5}
                                                    </div>
                                                )}
                                            </div>

                                            <ChevronRight size={24} className="text-slate-400 group-hover:text-[#a51a8f] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                    {displayInfo.data.length === 0 && <p className="text-center text-slate-400 col-span-full">Nenhuma turma encontrada.</p>}
                                </div>
                            )}

                            {displayInfo.mode === 'class' && (
                                <div className="animate-slideUp">
                                    <div className="flex items-center gap-4 mb-8">
                                        <button
                                            onClick={() => setSelectedClass(null)}
                                            className="flex items-center gap-2 text-slate-500 hover:text-[#a51a8f] transition-colors font-bold"
                                        >
                                            <ChevronLeft size={20} /> Voltar
                                        </button>
                                        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                                            <span className="bg-[#a51a8f]/10 px-3 py-1 rounded-xl text-[#a51a8f]">{displayInfo.title}</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center justify-items-center">
                                        {displayInfo.data.map(student => (
                                            <StudentCard key={student.id} student={student} onClick={() => setSelectedStudent(student)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!showAdminLogin && !searchTerm && !selectedClass && (
                            <div className="mt-16 text-center">
                                <button
                                    onClick={() => seedDatabase(auth.currentUser?.uid)}
                                    className="text-xs text-slate-400 hover:text-[#a51a8f] transition-colors"
                                >
                                    Resetar Demo
                                </button>
                                <button
                                    onClick={() => addRandomStudents(5)}
                                    className="block mt-4 text-xs text-slate-400 hover:text-[#a51a8f] transition-colors mx-auto"
                                >
                                    + 5 Alunos Teste
                                </button>

                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 w-full max-w-sm mx-auto animate-fadeIn border border-white/50 dark:border-slate-700/50">
                        <div className="mb-8 flex flex-col items-center">
                            <div className={`
                w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 
                ring-4 shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300
                ${selectedStudent.role !== 'student'
                                    ? 'bg-[#2d1b36] ring-[#eec00a]'
                                    : 'bg-[#fdf2fa] ring-white dark:ring-slate-700'
                                }
              `}>
                                {selectedStudent.photoUrl ? (
                                    <img src={selectedStudent.photoUrl} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedStudent.avatar
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Olá, {selectedStudent.name}!</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Digite sua senha para continuar</p>
                        </div>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder={selectedStudent.role !== 'student' ? "Senha de Acesso" : "Sua senha (1234)"}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-800 dark:text-white text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:border-[#a51a8f] focus:ring-4 focus:ring-[#a51a8f]/10 mb-6 transition-all placeholder:tracking-normal placeholder:font-normal"
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 text-sm mb-6 font-bold py-3 px-4 rounded-xl text-center animate-shake border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setSelectedStudent(null); setPassword(''); setError(''); }}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleLogin}
                                className="flex-1 py-4 rounded-2xl bg-[#a51a8f] text-white hover:bg-[#8e167b] font-bold shadow-lg shadow-[#a51a8f]/30 hover:shadow-[#a51a8f]/50 hover:-translate-y-1 transition-all"
                            >
                                Entrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BackgroundPaths >
    );
};
