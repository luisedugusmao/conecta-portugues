import React, { useState, useRef } from 'react';
import { X, Trophy, Star, TrendingUp, Calendar, Award, Edit2, Check, User, Phone, CreditCard, Save, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
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

    // Get google photo from auth
    const googlePhoto = auth.currentUser?.photoURL;
    // Initial state: if user has a photoUrl, we assume they are using Google/Custom photo.
    const [selectedAvatar, setSelectedAvatar] = useState(user.photoUrl ? 'GOOGLE' : (user.avatar || '🧑‍🎓'));

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        parentName: user.parentName || '',
        cpf: user.cpf || '',
        phone: user.phone || ''
    });

    const handleSaveProfile = async () => {
        try {
            // Basic validation
            if (!editForm.name.trim()) return alert("Nome é obrigatório");
            if (editForm.cpf && editForm.cpf.length < 11) return alert("CPF inválido");
            if (editForm.phone && editForm.phone.length < 10) return alert("Telefone inválido");

            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id), {
                name: editForm.name,
                parentName: editForm.parentName,
                cpf: editForm.cpf.replace(/\D/g, ''),
                phone: editForm.phone.replace(/\D/g, '')
            });
            setIsEditingProfile(false);
            // Ideally we'd show a success toast here
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Erro ao atualizar perfil.");
        }
    };

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

            // Create temporary user object with collected info - SANITIZED
            const paymentUser = {
                ...user,
                cpf: currentCpf.replace(/\D/g, ''),
                phone: currentPhone.replace(/\D/g, '')
            };

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
                        <div className="flex items-center gap-1 max-w-[320px] mx-auto bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={scrollLeft}
                                type="button"
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide no-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {googlePhoto && (
                                    <button
                                        onClick={() => setSelectedAvatar('GOOGLE')}
                                        className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all relative ${selectedAvatar === 'GOOGLE' ? 'border-purple-500 scale-110 ring-2 ring-purple-500/20' : 'border-transparent hover:border-slate-200'}`}
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
                                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-xl rounded-full transition-all ${selectedAvatar === avatar ? 'bg-purple-100 dark:bg-purple-900/30 scale-110 border-2 border-purple-500 text-2xl' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={scrollRight}
                                type="button"
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Escolha seu novo avatar</p>
                    </div>
                ) : (
                    <>
                        {isEditingProfile ? (
                            <div className="mt-2">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Editando Perfil</h2>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2 justify-center">
                                    <h2 className={`text-2xl font-bold ${getColorClass(user.equipped?.color)}`}>{user.name}</h2>
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(true);
                                            setActiveTab('overview');
                                        }}
                                        className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-[#a51a8f] transition-all"
                                        title="Editar Dados"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">Estudante • {user.schoolYear || 'N/A'}</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-700 px-6 mt-4">
                <button
                    onClick={() => {
                        setActiveTab('overview');
                        setIsEditingProfile(false);
                    }}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#a51a8f] text-[#a51a8f]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => {
                        setActiveTab('subscription');
                        setIsEditingProfile(false);
                    }}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subscription' ? 'border-[#a51a8f] text-[#a51a8f]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Minha Assinatura
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {activeTab === 'overview' ? (
                    <>
                        {isEditingProfile ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User size={16} className="text-[#a51a8f]" />
                                        Nome do Aluno
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:border-[#a51a8f] dark:text-white"
                                        placeholder="Seu nome completo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Calendar size={16} className="text-[#a51a8f]" />
                                        Série / Ano
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={user.schoolYear}
                                            disabled
                                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-500 cursor-not-allowed"
                                        />
                                        <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <p className="text-[10px] text-slate-400">Entre em contato com o suporte para alterar sua série.</p>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User size={16} className="text-slate-400" />
                                        Nome do Responsável
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.parentName}
                                        onChange={e => setEditForm({ ...editForm, parentName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:border-[#a51a8f] dark:text-white"
                                        placeholder="Nome do responsável"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <CreditCard size={16} className="text-slate-400" />
                                            CPF (apenas números)
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.cpf}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                setEditForm({ ...editForm, cpf: val });
                                            }}
                                            maxLength={11}
                                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:border-[#a51a8f] dark:text-white"
                                            placeholder="000.000.000-00"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Phone size={16} className="text-slate-400" />
                                            WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                setEditForm({ ...editForm, phone: val });
                                            }}
                                            maxLength={11}
                                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:border-[#a51a8f] dark:text-white"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => setIsEditingProfile(false)}
                                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex-1 py-3 bg-[#a51a8f] text-white font-bold rounded-xl hover:bg-[#8e167b] shadow-lg shadow-purple-500/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        ) : (
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
                        )}
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
