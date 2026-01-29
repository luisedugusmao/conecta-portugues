import React, { useState } from 'react';
import { X, Trophy, Star, TrendingUp, Calendar, Award, Edit2, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId, auth } from '../firebase';
import { getFrameClass, getColorClass } from '../utils/items';
import { calculateLevel } from '../utils/levelLogic';
import { Modal } from '../components/Modal';

const AVATAR_OPTIONS = [
    '🧑‍🎓', '👩‍🎓', '👨‍🚀', '👩‍🚀', '🦸', '🦸‍♀️',
    '🧙', '🧚', '🦁', '🐯', '🐼', '🐨',
    '🦊', '🐱', '🐶', '🦄', '🐲', '🦕'
];

import { SUBSCRIPTION_PLANS, getPlanDetails } from '../utils/subscriptionConstants';

import { createCheckoutSession } from '../services/abacatePay';

export const ViewProfile = ({ user, onClose }) => {
    // Dynamic Level Logic
    const { level, currentLevelXP, xpNeededForNextLevel, progress, xpRemaining } = calculateLevel(user.xp || 0);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Get google photo from auth
    const googlePhoto = auth.currentUser?.photoURL;
    // Initial state: if user has a photoUrl, we assume they are using Google/Custom photo.
    const [selectedAvatar, setSelectedAvatar] = useState(user.photoUrl ? 'GOOGLE' : (user.avatar || '🧑‍🎓'));

    // ... (Avatar logic stays same) ...

    const handleSaveAvatar = async () => {
        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id);

            if (selectedAvatar === 'GOOGLE' && googlePhoto) {
                await updateDoc(userRef, {
                    photoUrl: googlePhoto,
                    avatar: '👤' // Fallback
                });
            } else {
                await updateDoc(userRef, {
                    avatar: selectedAvatar,
                    photoUrl: null // Clear photo if they choose an avatar
                });
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating avatar:", error);
            alert("Erro ao salvar avatar.");
        }
    };

    const handleUpdatePlan = async (planId) => {
        setIsLoadingPayment(true);
        try {
            // Validate/Collect User Info for Payment
            let currentCpf = user.cpf;
            let currentPhone = user.phone;

            if (!currentCpf) {
                currentCpf = prompt("Para gerar o pagamento, precisamos do seu CPF (apenas números):");
                if (!currentCpf) {
                    setIsLoadingPayment(false);
                    return;
                }
            }

            if (!currentPhone) {
                currentPhone = prompt("Precisamos também do seu celular com DDD (apenas números):");
                if (!currentPhone) {
                    setIsLoadingPayment(false);
                    return;
                }
            }

            // Create temporary user object with collected info
            const paymentUser = { ...user, cpf: currentCpf, phone: currentPhone };

            const url = await createCheckoutSession(planId, paymentUser);
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("URL de pagamento inválida");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Erro ao iniciar pagamento: " + error.message);
            setIsLoadingPayment(false);
        }
    };

    // Use real history or empty array
    const history = user.xpHistory || [];

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-lg flex flex-col">

            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white z-10 transition-colors">
                <X size={20} />
            </button>

            {/* Profile Header */}
            <div className="relative pt-10 pb-6 px-6 text-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 group">
                <div className="relative inline-block">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-3 overflow-hidden ${getFrameClass(user.equipped?.frame)}`}>
                        {
                            isEditing
                                ? (selectedAvatar === 'GOOGLE' ? <img src={googlePhoto} alt="Google" className="w-full h-full object-cover" /> : selectedAvatar)
                                : (user.photoUrl ? <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" /> : user.avatar)
                        }
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-2 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg border border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-[#a51a8f] transition-colors"
                        >
                            <Edit2 size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSaveAvatar}
                            className="absolute bottom-2 right-0 p-2 bg-green-500 rounded-full shadow-lg text-white hover:bg-green-600 transition-colors"
                        >
                            <Check size={14} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-6 gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm max-w-[280px] mx-auto">

                            {googlePhoto && (
                                <button
                                    onClick={() => setSelectedAvatar('GOOGLE')}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${selectedAvatar === 'GOOGLE' ? 'border-purple-500 scale-110 z-10' : 'border-transparent hover:border-slate-200'}`}
                                    title="Usar foto do Google"
                                >
                                    <img src={googlePhoto} alt="Google" className="w-full h-full object-cover" />
                                    {selectedAvatar === 'GOOGLE' && <div className="absolute inset-0 bg-purple-500/20" />}
                                </button>
                            )}

                            {AVATAR_OPTIONS.map((avatar) => (
                                <button
                                    key={avatar}
                                    onClick={() => setSelectedAvatar(avatar)}
                                    className={`aspect-square flex items-center justify-center text-xl rounded-lg transition-all ${selectedAvatar === avatar ? 'bg-purple-100 dark:bg-purple-900/30 scale-110 border border-purple-200 dark:border-purple-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Escolha seu novo avatar</p>
                    </div>
                ) : (
                    <>
                        <h2 className={`text-2xl font-bold mb-1 ${getColorClass(user.equipped?.color)}`}>{user.name}</h2>
                        <p className="text-slate-500 text-sm font-medium">Estudante • {user.schoolYear || 'N/A'}</p>
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-700 px-6 mt-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#a51a8f] text-[#a51a8f]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('subscription')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subscription' ? 'border-[#a51a8f] text-[#a51a8f]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Minha Assinatura
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">

                {activeTab === 'overview' ? (
                    <>
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

                            {history.length > 0 ? (
                                <div className="space-y-3">
                                    {history.slice().reverse().map((item, index) => ( // Show newest first
                                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                                                    <Award size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.action}</p>
                                                    <p className="text-[10px] text-slate-400">{item.date?.toDate ? item.date.toDate().toLocaleDateString() : 'Hoje'}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-[#a51a8f] text-sm">+{item.xp} XP</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-slate-50 dark:bg-slate-700/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <Trophy className="mx-auto w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum histórico ainda.</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Participe de simulados e aulas para ganhar XP!</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* Subscription Tab Content */}
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Plano Atual</h3>
                            <div className="text-2xl font-black text-[#a51a8f] mt-1">{SUBSCRIPTION_PLANS.find(p => p.id === (user.subscription?.planId || 'free'))?.name}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                {(user.subscription?.planId === 'free') ? 'Modo Visitante' : 'Assinatura Ativa'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">Planos Disponíveis</h3>
                            <div className="space-y-4">
                                {SUBSCRIPTION_PLANS.filter(p => p.id !== 'free').map(plan => {
                                    const isCurrent = user.subscription?.planId === plan.id;
                                    return (
                                        <div key={plan.id} className={`p-5 rounded-2xl border-2 transition-all ${isCurrent ? 'border-[#eec00a] bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">{plan.name}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-[#a51a8f]">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
                                                    <p className="text-[10px] text-slate-400">/mês</p>
                                                </div>
                                            </div>

                                            <ul className="space-y-2 mb-4">
                                                <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <Check size={14} className="text-green-500" />
                                                    <span>{plan.features.groupClasses ? 'Aulas em Grupo Ilimitadas' : 'Sem Aulas em Grupo'}</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <Check size={14} className="text-green-500" />
                                                    <span>{plan.features.privateClasses > 0 ? `${plan.features.privateClasses} Aulas Individuais/mês` : 'Sem Aulas Individuais'}</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <Check size={14} className="text-green-500" />
                                                    <span>{plan.features.essayCorrections > 0 ? `${plan.features.essayCorrections} Correções de Redação` : 'Sem Redação'}</span>
                                                </li>
                                            </ul>

                                            <button
                                                onClick={() => handleUpdatePlan(plan.id)}
                                                disabled={isCurrent}
                                                className={`w-full py-3 rounded-xl font-bold transition-all ${isCurrent ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#a51a8f] text-white hover:bg-[#8e167b] shadow-lg shadow-purple-500/20'}`}
                                            >
                                                {isCurrent ? 'Plano Atual' : isLoadingPayment ? 'Aguarde...' : `Assinar ${plan.name}`}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
