/**
 * StreakBadge — Fix #10
 * Displays the user's current eco-activity streak prominently.
 * Shows 🔥 flame emoji, streak count, and a motivational label.
 *
 * Usage (Dashboard.jsx or StudentDashboard.jsx):
 *   import StreakBadge from '../components/StreakBadge';
 *   <StreakBadge streak={user?.gamification?.streak?.current} />
 */
const StreakBadge = ({ streak = 0, className = '' }) => {
    if (!streak || streak < 1) {
        return (
            <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f8e9] border border-[#c8e6c9] text-[#4a7a4a] text-sm font-semibold ${className}`}
                title="Start a streak by completing an activity today!"
            >
                <span>🌱</span>
                <span>No streak yet — start today!</span>
            </div>
        );
    }

    // Visual intensity based on streak length
    const intensity =
        streak >= 30 ? 'legendary' :
            streak >= 14 ? 'epic' :
                streak >= 7 ? 'hot' :
                    'warm';

    const config = {
        legendary: {
            bg: '#fff8e1',
            border: '#ffe082',
            text: '#e65100',
            emoji: '🔥🔥🔥',
            label: 'Legendary streak!',
        },
        epic: {
            bg: '#fce4ec',
            border: '#f48fb1',
            text: '#880e4f',
            emoji: '🔥🔥',
            label: 'Epic streak!',
        },
        hot: {
            bg: '#fff3e0',
            border: '#ffcc80',
            text: '#bf360c',
            emoji: '🔥',
            label: 'Streak on fire!',
        },
        warm: {
            bg: '#e8f5e9',
            border: '#a5d6a7',
            text: '#1b5e20',
            emoji: '🌿',
            label: 'Keep it going!',
        },
    };

    const c = config[intensity];

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-sm ${className}`}
            style={{
                backgroundColor: c.bg,
                borderColor: c.border,
                color: c.text,
            }}
            title={`${streak}-day streak — ${c.label}`}
            aria-label={`${streak} day${streak === 1 ? '' : 's'} streak`}
        >
            <span aria-hidden="true">{c.emoji}</span>
            <span>
                {streak} day{streak === 1 ? '' : 's'}
            </span>
            <span className="opacity-70 font-normal text-xs hidden sm:inline">
                · {c.label}
            </span>
        </div>
    );
};

export default StreakBadge;
