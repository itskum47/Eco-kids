import React from 'react';

/**
 * Accessibility wrapper utilities for EcoKids.
 * Provides skip navigation, focus ring management, and screen reader helpers.
 */

/**
 * Skip to main content link — appears on Tab focus for keyboard users.
 */
export const SkipToContent = () => (
    <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000]
               focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-500 focus:text-white
               focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
    >
        Skip to main content
    </a>
);

/**
 * Screen reader only announcement — for live updates.
 */
export const LiveAnnounce = ({ message, priority = 'polite' }) => (
    <div
        role="status"
        aria-live={priority}
        aria-atomic="true"
        className="sr-only"
    >
        {message}
    </div>
);

/**
 * Focus trap for modals — wraps children and traps Tab navigation.
 */
export const FocusTrap = ({ children, active = true }) => {
    const trapRef = React.useRef(null);

    React.useEffect(() => {
        if (!active || !trapRef.current) return;

        const focusable = trapRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        // Focus first element
        first?.focus();

        trapRef.current.addEventListener('keydown', handleKeyDown);
        const ref = trapRef.current;
        return () => ref?.removeEventListener('keydown', handleKeyDown);
    }, [active]);

    return <div ref={trapRef}>{children}</div>;
};

/**
 * Visually hidden text — only visible to screen readers.
 */
export const VisuallyHidden = ({ children, as: Tag = 'span' }) => (
    <Tag className="sr-only">{children}</Tag>
);

/**
 * Keyboard-navigable card wrapper.
 * Makes cards clickable via Enter/Space.
 */
export const InteractiveCard = ({ children, onClick, label, className = '' }) => (
    <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={onClick}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
            }
        }}
        className={`cursor-pointer outline-none
                focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
                focus-visible:ring-offset-gray-950 rounded-xl ${className}`}
    >
        {children}
    </div>
);

export default { SkipToContent, LiveAnnounce, FocusTrap, VisuallyHidden, InteractiveCard };
