import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { checkFeatureAccess } from '../utils/subscriptionConstants';
import { ViewProfile } from '../views/ViewProfile'; // We might need to open profile to upgrade
import { Modal } from './Modal';

export const PremiumLock = ({ user, feature, children, className = '' }) => {
    const isAllowed = checkFeatureAccess(user, feature);
    const [showModal, setShowModal] = useState(false);

    if (isAllowed) {
        return children;
    }

    const handleLockClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    };

    return (
        <>
            <div className={`relative group ${className}`} onClick={handleLockClick}>
                <div className="pointer-events-none filter grayscale opacity-70">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl group-hover:bg-black/10 transition-colors cursor-pointer z-10">
                    <div className="bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm">
                        <Lock className="w-5 h-5 text-slate-600" />
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="max-w-sm p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Recurso Exclusivo</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Este recurso está disponível apenas para assinantes. Faça um upgrade para acessar!
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => setShowModal(false)}
                        className="w-full py-3 bg-[#a51a8f] text-white rounded-xl font-bold hover:bg-[#8e167b] transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </Modal>
        </>
    );
};
