import React, { useState, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { User, School, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const AVATAR_OPTIONS = [
    '🧑‍🎓', '👩‍🎓', '👨‍🚀', '👩‍🚀', '🦸', '🦸‍♀️',
    '🧙', '🧚', '🦁', '🐯', '🐼', '🐨',
    '🦊', '🐱', '🐶', '🦄', '🐲', '🦕'
];

export const StudentRegistration = ({ authUser, onComplete }) => {
    const [studentName, setStudentName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🎓');
    const [schoolYear, setSchoolYear] = useState('6º Ano');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Success
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!studentName.trim()) {
            toast.error("Por favor, preencha o nome do aluno.");
            return;
        }
        if (cpf.length < 11) {
            toast.error("Por favor, preencha o CPF corretamente (11 dígitos).");
            return;
        }
        if (phone.length < 10) {
            toast.error("Por favor, preencha um telefone válido.");
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', authUser.uid);

            const newStudent = {
                name: studentName.trim(),
                email: authUser.email,
                parentName: authUser.displayName || 'Responsável',
                avatar: selectedAvatar,
                schoolYear: schoolYear,
                cpf: cpf.replace(/\D/g, ''), // Ensure only numbers
                phone: phone.replace(/\D/g, ''), // Ensure only numbers
                xp: 0,
                coins: 0,
                level: 1,
                role: 'student',
                createdAt: serverTimestamp(),
                photoUrl: null, // No custom photo, using avatar
                onboardingComplete: true,
                subscription: {
                    planId: 'free',
                    status: 'active',
                    startedAt: new Date().toISOString(),
                    credits: {
                        privateClasses: 0,
                        essayCorrections: 0
                    }
                }
            };

            await setDoc(userRef, newStudent);
            setStep(2);

            // Artificial delay for success animation
            setTimeout(() => {
                onComplete(newStudent);
            }, 1500);

        } catch (error) {
            console.error("Error creating profile:", error);
            toast.error("Erro ao criar perfil: " + error.message);
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
                        <p className="text-white/60 text-sm">Olá, {authUser.displayName || 'Responsável'}. Preencha os dados abaixo.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* Avatar Selection */}
                        <div className="space-y-2">
                            <label className="text-white/80 text-sm font-medium ml-1">Escolha um Avatar</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={scrollLeft}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div
                                    ref={scrollContainerRef}
                                    className="flex gap-3 overflow-x-auto scroll-smooth py-4 px-2 -mx-2"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {AVATAR_OPTIONS.map((avatar) => (
                                        <button
                                            key={avatar}
                                            type="button"
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${selectedAvatar === avatar ? 'bg-purple-600 shadow-lg shadow-purple-500/40 scale-110 ring-2 ring-purple-400/50' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={scrollRight}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
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

                        <div className="space-y-2">
                            <label className="text-white/80 text-sm font-medium ml-1">Série / Ano</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['6º Ano', '7º Ano', '8º Ano', '9º Ano'].map(year => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => setSchoolYear(year)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all border ${schoolYear === year ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40' : 'bg-black/20 border-white/10 text-white/70 hover:bg-white/5'}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Parent Info - Captured for Payments */}
                        <div className="pt-4 border-t border-white/10 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Dados do Responsável</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white/80 text-sm font-medium ml-1">CPF do Responsável (Apenas Números)</label>
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        setCpf(val);
                                    }}
                                    maxLength={11}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    placeholder="000.000.000-00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-white/80 text-sm font-medium ml-1">WhatsApp do Responsável</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        setPhone(val);
                                    }}
                                    maxLength={11}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                                <p className="text-[10px] text-white/40 ml-1">Necessário para geração segura de pagamentos.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
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
            <Toaster richColors />
        </div>
    );
};
