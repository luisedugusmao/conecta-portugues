import React, { useState, useEffect } from 'react';
import { signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';
import { LogoSVG, AnimatedGridBackground } from './Shared';
import { seedDatabase } from '../utils/seeder';

export const LoginWall = ({ onLogin }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authReady, setAuthReady] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    useEffect(() => { const setup = async () => { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); setAuthReady(true); }; setup(); }, []);
    useEffect(() => { if (!authReady) return; const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students')); const unsubscribe = onSnapshot(q, (snapshot) => { const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); data.sort((a, b) => a.name.localeCompare(b.name)); setStudents(data); }, (err) => console.error(err)); return () => unsubscribe(); }, [authReady]);

    const handleLogin = () => { if (password === selectedStudent.password) onLogin(selectedStudent); else { setError('Senha incorreta!'); setPassword(''); } };
    const displayedUsers = showAdminLogin ? students.filter(s => s.role !== 'student') : students.filter(s => s.role === 'student');

    return (
        <AnimatedGridBackground>
            {!selectedStudent && (<button onClick={() => { setShowAdminLogin(!showAdminLogin); setSelectedStudent(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-[#a51a8f] text-[10px] font-bold uppercase tracking-[0.2em] transition-colors z-20">{showAdminLogin ? 'ALUNOS' : 'ADMIN'}</button>)}
            <div className="z-10 w-full max-w-4xl text-center flex flex-col items-center">
                <div className="w-full max-w-lg mb-8"><LogoSVG className="w-full h-auto" /></div>
                {!selectedStudent ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center">
                        {displayedUsers.map(student => (
                            <button key={student.id} onClick={() => setSelectedStudent(student)} className="group flex flex-col items-center transition-all duration-300 transform hover:scale-105">
                                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl border-2 flex items-center justify-center text-5xl shadow-xl shadow-slate-200 group-hover:shadow-2xl relative overflow-hidden transition-all ${student.role !== 'student' ? 'bg-[#2d1b36] border-[#eec00a] text-white' : 'bg-white border-slate-100 group-hover:border-[#eec00a]'}`}>
                                    {student.photoUrl ? <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover z-20" /> : <span className="z-10">{student.avatar}</span>}
                                </div>
                                <span className={`mt-4 text-lg font-bold group-hover:text-[#a51a8f]`}>{student.name}</span>
                            </button>
                        ))}
                        <button onClick={() => seedDatabase(auth.currentUser?.uid)} className="flex flex-col items-center group opacity-70 hover:opacity-100"><div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-slate-400 group-hover:text-slate-500 bg-slate-50"><span className="text-sm px-2 text-center font-medium">Resetar / Atualizar Demo</span></div></button>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-slate-200/50 max-w-sm mx-auto animate-fadeIn border border-white">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Olá, {selectedStudent.name}!</h2>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Senha" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4" />
                        <div className="flex gap-2"><button onClick={() => { setSelectedStudent(null); setPassword(''); }} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Voltar</button><button onClick={handleLogin} className="flex-1 py-3 rounded-xl bg-[#a51a8f] text-white font-bold">Entrar</button></div>
                    </div>
                )}
            </div>
        </AnimatedGridBackground>
    );
};
