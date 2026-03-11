import React from 'react';

const Skeleton = ({ className = '', variant = 'text', width, height }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'circular':
                return 'rounded-full';
            case 'rectangular':
                return 'rounded-[var(--r-md)]';
            case 'card':
                return 'rounded-[var(--r-lg)]';
            default:
                // text
                return 'rounded-md';
        }
    };

    return (
        <div
            className={`relative overflow-hidden bg-gray-200 ${getVariantStyles()} ${className}`}
            style={{
                width: width || (variant === 'text' ? '100%' : 'auto'),
                height: height || (variant === 'text' ? '1.2em' : 'auto')
            }}
        >
            <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                }}
            />
        </div>
    );
};

export default Skeleton;

/* Add this to index.css or tailwind config for the animation:
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
*/
