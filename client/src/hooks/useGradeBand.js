import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const GRADE_BANDS = {
    seedling: { grades: [1, 2, 3], label: 'Seedling', emoji: '🌱', color: '#ff8f00' },
    explorer: { grades: [4, 5, 6], label: 'Explorer', emoji: '🌿', color: '#2e7d32' },
    challenger: { grades: [7, 8, 9], label: 'Challenger', emoji: '🌍', color: '#1565c0' },
    expert: { grades: [10, 11, 12], label: 'Expert', emoji: '🔬', color: '#00695c' },
};

export const useGradeBand = () => {
    // If we store grade in a different place, adjust this selector as needed
    const grade = useSelector(state => state.auth.user?.profile?.gradeLevel || state.auth.user?.grade);

    return useMemo(() => {
        // Determine numeric grade from string like "10" or "Grade 6"
        let parsedGrade = parseInt(grade, 10);
        if (isNaN(parsedGrade)) {
            // Default fallback
            return { band: 'explorer', ...GRADE_BANDS.explorer };
        }

        if (parsedGrade <= 3) return { band: 'seedling', ...GRADE_BANDS.seedling };
        if (parsedGrade <= 6) return { band: 'explorer', ...GRADE_BANDS.explorer };
        if (parsedGrade <= 9) return { band: 'challenger', ...GRADE_BANDS.challenger };
        return { band: 'expert', ...GRADE_BANDS.expert };
    }, [grade]);
};
