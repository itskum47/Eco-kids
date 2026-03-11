import React, { useEffect } from 'react';

const PhotoPreviewModal = ({ isOpen, photoUrl, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-label="Photo Preview"
            onClick={onClose}
        >
            <div className="relative bg-[var(--s1)] rounded-xl  max-w-3xl w-full p-2" onClick={(e) => e.stopPropagation()} role="presentation">
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-[var(--t1)] hover:text-[var(--t1)] transition-colors bg-transparent border-0 text-3xl font-bold cursor-pointer"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                <div className="w-full h-[60vh] md:h-[80vh] bg-[var(--s2)] rounded-lg overflow-hidden flex items-center justify-center">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Student Proof of Action"
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <span className="text-[var(--t2)]">No Photo Available</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoPreviewModal;
