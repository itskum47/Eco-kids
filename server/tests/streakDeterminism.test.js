const User = require('../models/User');
const Habit = require('../models/Habit');

describe('Deterministic streak logic', () => {
  describe('User.updateStreak', () => {
    const buildUser = () => {
      const user = new User({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'secret123',
        gamification: {
          streak: {
            current: 0,
            longest: 0,
            lastActivity: null,
          },
        },
      });

      user.save = jest.fn().mockResolvedValue(user);
      return user;
    };

    test('starts streak on first activity', async () => {
      const user = buildUser();

      await user.updateStreak(new Date('2026-04-10T18:00:00Z'));

      expect(user.gamification.streak.current).toBe(1);
      expect(user.gamification.streak.longest).toBe(1);
      expect(user.gamification.streak.lastActivity.toISOString()).toBe('2026-04-10T00:00:00.000Z');
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    test('does not increment twice on same UTC day', async () => {
      const user = buildUser();

      await user.updateStreak(new Date('2026-04-10T00:30:00Z'));
      await user.updateStreak(new Date('2026-04-10T22:59:59Z'));

      expect(user.gamification.streak.current).toBe(1);
      expect(user.gamification.streak.longest).toBe(1);
      expect(user.save).toHaveBeenCalledTimes(2);
    });

    test('increments on consecutive day', async () => {
      const user = buildUser();

      await user.updateStreak(new Date('2026-04-10T18:00:00Z'));
      await user.updateStreak(new Date('2026-04-11T01:00:00Z'));

      expect(user.gamification.streak.current).toBe(2);
      expect(user.gamification.streak.longest).toBe(2);
      expect(user.gamification.streak.lastActivity.toISOString()).toBe('2026-04-11T00:00:00.000Z');
    });

    test('resets current streak after a gap day but keeps longest', async () => {
      const user = buildUser();

      await user.updateStreak(new Date('2026-04-10T18:00:00Z'));
      await user.updateStreak(new Date('2026-04-11T18:00:00Z'));
      await user.updateStreak(new Date('2026-04-13T09:00:00Z'));

      expect(user.gamification.streak.current).toBe(1);
      expect(user.gamification.streak.longest).toBe(2);
      expect(user.gamification.streak.lastActivity.toISOString()).toBe('2026-04-13T00:00:00.000Z');
    });

    test('ignores out-of-order backdated update', async () => {
      const user = buildUser();

      await user.updateStreak(new Date('2026-04-12T10:00:00Z'));
      const before = user.gamification.streak.lastActivity.toISOString();

      await user.updateStreak(new Date('2026-04-11T10:00:00Z'));

      expect(user.gamification.streak.current).toBe(1);
      expect(user.gamification.streak.longest).toBe(1);
      expect(user.gamification.streak.lastActivity.toISOString()).toBe(before);
    });
  });

  describe('Habit.logCompletion', () => {
    const buildHabit = () => new Habit({
      userId: '507f1f77bcf86cd799439011',
      name: 'Carry bottle',
      category: 'waste_reduction',
      targetType: 'daily',
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
      totalCompletion: 0,
    });

    test('creates first completion and streak', () => {
      const habit = buildHabit();

      const result = habit.logCompletion(new Date('2026-04-10T18:00:00Z'));

      expect(result.status).toBe(true);
      expect(result.streak).toBe(1);
      expect(habit.currentStreak).toBe(1);
      expect(habit.longestStreak).toBe(1);
      expect(habit.totalCompletion).toBe(1);
      expect(habit.completedDates).toHaveLength(1);
    });

    test('blocks duplicate completion on same UTC day', () => {
      const habit = buildHabit();

      habit.logCompletion(new Date('2026-04-10T01:00:00Z'));
      const duplicate = habit.logCompletion(new Date('2026-04-10T23:59:59Z'));

      expect(duplicate.status).toBe(false);
      expect(duplicate.message).toBe('Already completed today');
      expect(habit.totalCompletion).toBe(1);
    });

    test('increments streak for consecutive days', () => {
      const habit = buildHabit();

      habit.logCompletion(new Date('2026-04-10T10:00:00Z'));
      const day2 = habit.logCompletion(new Date('2026-04-11T10:00:00Z'));
      const day3 = habit.logCompletion(new Date('2026-04-12T10:00:00Z'));

      expect(day2.streak).toBe(2);
      expect(day3.streak).toBe(3);
      expect(habit.currentStreak).toBe(3);
      expect(habit.longestStreak).toBe(3);
    });

    test('resets streak after gap', () => {
      const habit = buildHabit();

      habit.logCompletion(new Date('2026-04-10T10:00:00Z'));
      habit.logCompletion(new Date('2026-04-11T10:00:00Z'));
      const gapResult = habit.logCompletion(new Date('2026-04-13T10:00:00Z'));

      expect(gapResult.streak).toBe(1);
      expect(habit.currentStreak).toBe(1);
      expect(habit.longestStreak).toBe(2);
    });

    test('rejects out-of-order backdated completion', () => {
      const habit = buildHabit();

      habit.logCompletion(new Date('2026-04-12T10:00:00Z'));
      const pastAttempt = habit.logCompletion(new Date('2026-04-11T10:00:00Z'));

      expect(pastAttempt.status).toBe(false);
      expect(pastAttempt.message).toBe('Cannot log completion for a past day');
      expect(habit.totalCompletion).toBe(1);
      expect(habit.currentStreak).toBe(1);
    });

    test('tracks weekly completion over 7-day window deterministically', () => {
      const habit = buildHabit();

      habit.logCompletion(new Date('2026-04-01T10:00:00Z'));
      habit.logCompletion(new Date('2026-04-06T10:00:00Z'));
      habit.logCompletion(new Date('2026-04-10T10:00:00Z'));
      habit.logCompletion(new Date('2026-04-12T10:00:00Z'));

      expect(habit.stats.weeklyCompletion).toBe(3);
    });
  });
});
