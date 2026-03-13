import { getGradeGroup } from './gradeContent';

const GAME_CONFIG = {
  memory: {
    Primary: { pairCount: 4, timeLimit: 150 },
    Junior: { pairCount: 5, timeLimit: 170 },
    Middle: { pairCount: 6, timeLimit: 180 },
    Senior: { pairCount: 8, timeLimit: 210 },
    Higher: { pairCount: 8, timeLimit: 240 },
  },
  waste: {
    Primary: { totalItems: 12, pointsPerCorrect: 8, pointsPerWrong: -2 },
    Junior: { totalItems: 14, pointsPerCorrect: 10, pointsPerWrong: -3 },
    Middle: { totalItems: 18, pointsPerCorrect: 12, pointsPerWrong: -4 },
    Senior: { totalItems: 20, pointsPerCorrect: 12, pointsPerWrong: -5 },
    Higher: { totalItems: 24, pointsPerCorrect: 14, pointsPerWrong: -6 },
  },
  connectDots: {
    Primary: { requiredLevels: 1, pointsPerLevel: 80 },
    Junior: { requiredLevels: 2, pointsPerLevel: 90 },
    Middle: { requiredLevels: 2, pointsPerLevel: 100 },
    Senior: { requiredLevels: 2, pointsPerLevel: 110 },
    Higher: { requiredLevels: 2, pointsPerLevel: 120 },
  },
};

export const getGameConfig = (gameKey, grade) => {
  const gradeGroup = getGradeGroup(grade);
  const game = GAME_CONFIG[gameKey] || GAME_CONFIG.memory;
  return game[gradeGroup] || game.Middle;
};
