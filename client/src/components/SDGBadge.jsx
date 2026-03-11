import React from 'react';
import PropTypes from 'prop-types';

const SDG_COLORS = {
    1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
    6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
    11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
    16: '#00689D', 17: '#19486A'
};

const SDGBadge = ({ goalNumber, size = 'md' }) => {
    const color = SDG_COLORS[goalNumber] || '#999999';
    const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-10 h-10 text-sm';

    return (
        <div
            className={`inline-flex items-center justify-center rounded-full text-white font-bold ${sizeClasses} shadow-sm border border-white/20`}
            style={{ backgroundColor: color }}
            title={`Sustainable Development Goal ${goalNumber}`}
        >
            {goalNumber}
        </div>
    );
};

SDGBadge.propTypes = {
    goalNumber: PropTypes.number.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default SDGBadge;
