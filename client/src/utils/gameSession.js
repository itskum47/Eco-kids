import { activityAPI } from './api';

export const getUserGrade = (user) => user?.grade ?? user?.profile?.grade ?? user?.profile?.gradeLevel ?? null;

export const getUserEcoCoins = (user) => {
  if (typeof user?.ecoCoins === 'number') {
    return user.ecoCoins;
  }

  return user?.gamification?.ecoPoints || 0;
};

export const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export const cycleIndex = (items, index) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items[index % items.length];
};

export const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const submitGameActivity = async ({ gameId, pointsEarned, grade, timeSpent, questionsCorrect }) => {
  try {
    await activityAPI.submitActivity({
      type: 'game',
      gameId,
      pointsEarned: safeNumber(pointsEarned),
      grade,
      timeSpent: safeNumber(timeSpent),
      questionsCorrect: safeNumber(questionsCorrect),
    });

    return true;
  } catch (error) {
    console.warn(`Failed to submit activity for ${gameId}:`, error);
    return false;
  }
};
