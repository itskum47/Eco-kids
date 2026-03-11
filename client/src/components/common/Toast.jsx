import React from 'react';
import toast from 'react-hot-toast';

const InfoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const SuccessIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ErrorIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--amber)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

export const showToast = (message, type = 'info') => {
    const getStyles = () => {
        switch (type) {
            case 'success': return { color: 'var(--g1)', icon: <SuccessIcon /> };
            case 'error': return { color: 'var(--red)', icon: <ErrorIcon /> };
            case 'xp': return { color: 'var(--amber)', glow: '0 0 15px rgba(255,215,0,0.3)', icon: <StarIcon /> };
            default: return { color: 'var(--c1)', icon: <InfoIcon /> };
        }
    };

    const { color, glow, icon } = getStyles();

    toast.custom((t) => (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-[var(--s2)] border border-[var(--b2)] shadow-lg rounded-xl pointer-events-auto flex relative overflow-hidden`}
            style={{ boxShadow: glow || 'var(--shadow-card)' }}
        >
            <div className="w-1 absolute left-0 top-0 bottom-0" style={{ background: color }} />
            <div className="flex-1 w-0 p-4 pl-5 flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5" style={{ color: color }}>
                    {icon}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <p className="font-ui text-sm font-bold text-[var(--t1)]">
                        {message}
                    </p>
                    {type === 'xp' && (
                        <p className="font-body text-xs text-[var(--t2)] mt-0.5">
                            XP balance updated.
                        </p>
                    )}
                </div>
            </div>
            <div className="flex border-l border-[var(--b1)]">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center font-ui text-xs font-bold text-[var(--t3)] hover:text-[var(--t2)] transition-colors hover:bg-[var(--s1)] focus:outline-none"
                >
                    Close
                </button>
            </div>
        </div>
    ), {
        duration: type === 'error' ? 5000 : 3000,
    });
};
