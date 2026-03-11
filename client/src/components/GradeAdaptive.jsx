import React from 'react';
import { useGradeBand } from '../hooks/useGradeBand';

/**
 * Renders different content based on the student's grade band.
 * Provide components or elements for seedling, explorer, challenger, expert.
 * Fallback is rendered if the specific band prop is missing.
 */
const GradeAdaptive = ({ seedling, explorer, challenger, expert, fallback }) => {
    const { band } = useGradeBand();

    const map = { seedling, explorer, challenger, expert };

    return map[band] || fallback || map.explorer || null;
};

export default GradeAdaptive;
