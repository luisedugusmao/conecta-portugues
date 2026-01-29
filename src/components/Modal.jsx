import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp relative flex flex-col ${className}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header (Optional, if title or close button needed generically, but specialized views might implement their own header inside children. 
                    However, for consistency, let's provide a basic close button if not strictly controlled elsewhere, 
                    BUT looking at existing modals, they often need custom headers.
                    Let's provide a simple absolute close button as a default, and allow children to overlay if needed, 
                    OR just a container. 
                    The plan said props: title. Let's implement a header if title is present.
                */}

                {title && (
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* If no title, we might still want a close button? 
                    The existing Rank modal has an absolute close button. 
                    Let's make sure we don't double up. 
                    We'll blindly render children for maximum flexibility if no title is provided, 
                    but the container styles (bg, rounded, shadow) correspond to the common look.
                */}

                {!title && children}
                {title && <div className="flex-1 overflow-y-auto">{children}</div>}
            </div>
        </div>
    );
};
