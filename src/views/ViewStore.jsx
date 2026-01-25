import React, { useState } from 'react';
import { X, ShoppingBag, Star, Check, Shield, Palette } from 'lucide-react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db, appId } from '../firebase';

import { ITEMS } from '../utils/items';

export const ViewStore = ({ user, onClose }) => {
    const [activeTab, setActiveTab] = useState('frames');
    const [loading, setLoading] = useState(false);


    const myInventory = user.inventory || { frames: ['frame-default'], colors: ['color-default'] };
    const myEquipped = user.equipped || { frame: 'frame-default', color: 'color-default' };

    const handleBuy = async (item, type) => {
        if (user.coins < item.cost) {
            alert("Você não tem estrelas suficientes!");
            return;
        }
        if (loading) return;
        setLoading(true);

        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id);
            const updateField = type === 'frames' ? 'inventory.frames' : 'inventory.colors';

            await updateDoc(userRef, {
                coins: increment(-item.cost),
                [updateField]: arrayUnion(item.id)
            });
            // Auto equip on buy? Maybe not.
            alert(`Você comprou ${item.name}!`);
        } catch (error) {
            console.error("Erro ao comprar:", error);
            alert("Erro ao processar compra.");
        } finally {
            setLoading(false);
        }
    };

    const handleEquip = async (item, type) => {
        if (loading) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id);
            const field = type === 'frames' ? 'equipped.frame' : 'equipped.color';
            await updateDoc(userRef, {
                [field]: item.id
            });
        } catch (error) {
            console.error("Erro ao equipar:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = (item, type) => {
        const typeKey = type === 'frames' ? 'frames' : 'colors';
        const isOwned = myInventory[typeKey]?.includes(item.id) || item.cost === 0;
        const isEquipped = (type === 'frames' ? myEquipped.frame : myEquipped.color) === item.id;

        return (
            <div key={item.id} className={`bg-white dark:bg-slate-700/50 rounded-2xl p-4 border transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${isEquipped ? 'border-[#a51a8f] ring-1 ring-[#a51a8f]' : 'border-slate-200 dark:border-slate-600 hover:border-[#a51a8f]/50'}`}>
                {isEquipped && <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#a51a8f] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm"><Check size={10} /> Equipado</div>}

                <div className="flex-1 flex items-center justify-center p-2 w-full">
                    {type === 'frames' ? (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 ${item.cssClass}`}>
                            {user.avatar || '👤'}
                        </div>
                    ) : (
                        <span className={`text-xl ${item.cssClass}`}>{user.name || 'Seu Nome'}</span>
                    )}
                </div>

                <div className="w-full text-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{item.description}</p>

                    {isOwned ? (
                        <button
                            onClick={() => handleEquip(item, type)}
                            disabled={isEquipped || loading}
                            className={`w-full py-2 rounded-xl text-sm font-bold transition-colors ${isEquipped ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900'}`}
                        >
                            {isEquipped ? 'Equipado' : 'Equipar'}
                        </button>
                    ) : (
                        <button
                            onClick={() => handleBuy(item, type)}
                            disabled={user.coins < item.cost || loading}
                            className="w-full py-2 rounded-xl text-sm font-bold bg-[#eec00a] text-yellow-900 hover:bg-[#d4ab09] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                            Comprar <span className="text-xs opacity-70">({item.cost} <Star size={10} className="inline mb-0.5" />)</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp relative flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#a51a8f]/10 flex items-center justify-center text-[#a51a8f]">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Loja de Itens</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Personalize seu perfil usando suas estrelas!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#fff9db] dark:bg-yellow-900/20 px-4 py-2 rounded-full border border-[#eec00a] shadow-sm">
                            <Star className="w-5 h-5 text-[#eec00a] fill-[#eec00a]" />
                            <span className="font-bold text-[#b89508] dark:text-[#eec00a] text-lg">{user.coins}</span>
                        </div>
                        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-4 gap-2 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                    <button
                        onClick={() => setActiveTab('frames')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'frames' ? 'bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/30' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Shield size={18} /> Molduras
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'colors' ? 'bg-[#a51a8f] text-white shadow-lg shadow-[#a51a8f]/30' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Palette size={18} /> Cores de Nome
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {activeTab === 'frames' && ITEMS.frames.map(item => renderItem(item, 'frames'))}
                        {activeTab === 'colors' && ITEMS.colors.map(item => renderItem(item, 'colors'))}
                    </div>
                </div>
            </div>
        </div>
    );
};
