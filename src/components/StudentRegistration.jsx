import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { User, School, Check, ArrowRight } from 'lucide-react';

const AVATAR_OPTIONS = [
    '🧑‍🎓', '👩‍🎓', '👨‍🚀', '👩‍🚀', '🦸', '🦸‍♀️',
    '🧙', '🧚', '🦁', '🐯', '🐼', '🐨',
    '🦊', '🐱', '🐶', '🦄', '🐲', '🦕'
];

export const StudentRegistration = ({ authUser, onComplete }) => {
    const [studentName, setStudentName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🎓');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Success

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentName.trim()) return;

        setLoading(true);
        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', authUser.uid);

            const newStudent = {
                name: studentName.trim(),
                email: authUser.email,
                parentName: authUser.displayName || 'Responsável',
                avatar: selectedAvatar,
                xp: 0,
                coins: 0,
                level: 1,
                role: 'student',
                createdAt: serverTimestamp(),
                photoUrl: null, // No custom photo, using avatar
                onboardingComplete: true
            };

            await setDoc(userRef, newStudent);
            setStep(2);

            // Artificial delay for success animation
            setTimeout(() => {
                onComplete(newStudent);
            }, 1500);

        } catch (error) {
            console.error("Error creating profile:", error);
            alert("Erro ao criar perfil: " + error.message);
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Perfil Criado!</h2>
                    <p className="text-white/70">Bem-vindo(a), {studentName}.</p>
                    <p className="text-white/50 text-sm mt-4">Redirecionando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>

            <div className="relative w-full max-w-md p-4 animate-in slide-in-from-bottom-5 duration-500">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

                    <div className="p-8 text-center border-b border-white/5">
                        <h1 className="text-2xl font-bold text-white mb-1">Dados do Aluno</h1>
                        <p className="text-white/60 text-sm">Olá, {authUser.displayName || 'Responsável'}. Escolha um avatar e o nome.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* Avatar Selection */}
                        <div className="space-y-2">
                            <label className="text-white/80 text-sm font-medium ml-1">Escolha um Avatar</label>
                            <div className="grid grid-cols-6 gap-2">
                                {AVATAR_OPTIONS.map((avatar) => (
                                    <button
                                        key={avatar}
                                        type="button"
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`aspect-square flex items-center justify-center text-2xl rounded-xl transition-all ${selectedAvatar === avatar ? 'bg-purple-600 shadow-lg shadow-purple-500/40 scale-110' : 'bg-white/5 hover:bg-white/10'}`}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/80 text-sm font-medium ml-1">Nome do Aluno</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                                    placeholder="Ex: João Silva"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !studentName.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Criar Perfil do Aluno
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
};
