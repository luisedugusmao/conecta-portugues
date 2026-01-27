import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { BackgroundPaths } from './BackgroundPaths';
import { ThemeToggle } from './ThemeToggle';
import { LogoSVG } from './LogoSVG';
import { Mail, Lock, User, Chrome, ArrowRight, Loader } from 'lucide-react';

export const LoginWall = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error('Google Auth Error:', err);
            // Display technical error message for debugging
            setError(`Erro ao entrar: ${err.message} (${err.code})`);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegistering) {
                // Register
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // We will handle profile creation in App.jsx based on auth state change
                // But we can store the display name temporarily or update profile here if we wanted
                // For now, let App.jsx handle it. We might need to pass the name.
                // Actually, updateProfile is good practice here.
                // import { updateProfile } from 'firebase/auth';
                // await updateProfile(userCredential.user, { displayName: name });
            } else {
                // Login
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') setError('Email ou senha incorretos.');
            else if (err.code === 'auth/email-already-in-use') setError('Este email já está em uso.');
            else if (err.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
            else setError('Ocorreu um erro. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <BackgroundPaths>
            <ThemeToggle />
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md animate-slideUp">
                    {/* Logo Section */}
                    <div className="flex justify-center mb-8 transform hover:scale-105 transition-transform duration-700">
                        <div className="w-48">
                            <LogoSVG className="w-full h-auto drop-shadow-2xl dark:drop-shadow-white/20" />
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden border border-white/50 dark:border-slate-700/50">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
                                {isRegistering ? 'Criar Nova Conta' : 'Bem-vindo de Volta!'}
                            </h2>
                            <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
                                {isRegistering ? 'Comece sua jornada de aprendizado hoje.' : 'Entre para continuar seus estudos.'}
                            </p>

                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all mb-6 group"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <Chrome size={20} className="text-blue-500" />}
                                <span>Entrar com Google</span>
                            </button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-400">Ou continuar com email</span></div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {isRegistering && (
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a51a8f] transition-colors" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Seu Nome Completo"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#a51a8f] focus:ring-4 focus:ring-[#a51a8f]/10 transition-all dark:text-white"
                                        />
                                    </div>
                                )}

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a51a8f] transition-colors" size={20} />
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#a51a8f] focus:ring-4 focus:ring-[#a51a8f]/10 transition-all dark:text-white"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a51a8f] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Sua senha secreta"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#a51a8f] focus:ring-4 focus:ring-[#a51a8f]/10 transition-all dark:text-white"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 text-sm p-3 rounded-lg text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#a51a8f] hover:bg-[#8e167b] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#a51a8f]/30 hover:shadow-[#a51a8f]/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader className="animate-spin" /> : (isRegistering ? 'Criar Conta' : 'Entrar na Plataforma')}
                                    {!loading && <ArrowRight size={20} />}
                                </button>
                            </form>
                        </div>

                        {/* Toggle Mode */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
                            <button
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#a51a8f] dark:hover:text-[#d36ac1] font-medium transition-colors"
                            >
                                {isRegistering ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Crie agora'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </BackgroundPaths>
    );
};
