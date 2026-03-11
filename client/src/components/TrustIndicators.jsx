import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Verified } from 'lucide-react';

/**
 * Trust indicator badges — shows verified status, security, and certifications.
 * Use in footers, dashboards, and submission confirmations.
 */

export const VerifiedBadge = ({ label = 'Verified', size = 'sm' }) => {
    const sizes = {
        sm: 'text-xs gap-1 px-2 py-0.5',
        md: 'text-sm gap-1.5 px-2.5 py-1',
        lg: 'text-sm gap-2 px-3 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium
                  bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                  ${sizes[size]}`}
            role="img"
            aria-label={`${label} badge`}
        >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

export const SecureBadge = ({ label = 'DPDP Compliant' }) => (
    <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
               bg-blue-500/10 text-blue-400 border border-blue-500/20"
        role="img"
        aria-label="Security badge"
    >
        <ShieldCheck className="w-3.5 h-3.5" />
        {label}
    </span>
);

export const AchievementBadge = ({ rarity = 'common', name, icon }) => {
    const colors = {
        common: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        rare: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        epic: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        legendary: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                  border ${colors[rarity] || colors.common}`}
            role="img"
            aria-label={`${name} badge (${rarity})`}
        >
            <span>{icon || '🏅'}</span>
            {name}
        </span>
    );
};

export const TrustFooter = () => (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-6" role="contentinfo">
        <SecureBadge />
        <VerifiedBadge label="NEP 2020 Aligned" />
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                     bg-[var(--s1)]/5 text-white/30 border border-white/5">
            <Award className="w-3 h-3" />
            Made in India 🇮🇳
        </span>
    </div>
);

export default { VerifiedBadge, SecureBadge, AchievementBadge, TrustFooter };
