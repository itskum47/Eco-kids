const DailyHabit = require('../models/DailyHabit');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { calculateImpact } = require('../utils/impactCalculator');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const addImpactTotals = (totals, impact) => {
  totals.co2Prevented += impact.co2Prevented || 0;
  totals.waterSaved += impact.waterSaved || 0;
  totals.plasticReduced += impact.plasticReduced || 0;
  totals.energySaved += impact.energySaved || 0;
  totals.activitiesCompleted += impact.activitiesCompleted || 0;
};

const buildImpactIncrement = (impact) => ({
  'environmentalImpact.treesPlanted': impact.treesPlanted || 0,
  'environmentalImpact.co2Prevented': impact.co2Prevented || 0,
  'environmentalImpact.waterSaved': impact.waterSaved || 0,
  'environmentalImpact.plasticReduced': impact.plasticReduced || 0,
  'environmentalImpact.energySaved': impact.energySaved || 0,
  'environmentalImpact.activitiesCompleted': impact.activitiesCompleted || 0
});

const getImpactForHabit = (category) => {
  return calculateImpact(category, {});
};

exports.logHabit = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Habit category is required'
    });
  }

  if (!DailyHabit.HABIT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid habit category: ${category}`
    });
  }

  const today = startOfDay(new Date());
  let dailyHabit = await DailyHabit.findOne({ user: req.user.id, date: today });

  if (dailyHabit && dailyHabit.habits.some(habit => habit.category === category)) {
    return res.status(409).json({
      success: false,
      message: 'Habit already logged for today'
    });
  }

  const impact = getImpactForHabit(category);
  const habitEntry = {
    category,
    completed: true,
    impactGenerated: impact
  };

  if (!dailyHabit) {
    const previousDay = new Date(today.getTime() - MS_PER_DAY);
    const lastHabit = await DailyHabit.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .select('date');

    const streakContinued = lastHabit
      ? startOfDay(lastHabit.date).getTime() === startOfDay(previousDay).getTime()
      : false;

    dailyHabit = await DailyHabit.create({
      user: req.user.id,
      date: today,
      habits: [habitEntry],
      totalImpact: {
        co2Prevented: impact.co2Prevented || 0,
        waterSaved: impact.waterSaved || 0,
        plasticReduced: impact.plasticReduced || 0,
        energySaved: impact.energySaved || 0,
        activitiesCompleted: impact.activitiesCompleted || 0
      },
      streakContinued
    });
  } else {
    dailyHabit.habits.push(habitEntry);
    addImpactTotals(dailyHabit.totalImpact, impact);
    await dailyHabit.save();
  }

  await User.findByIdAndUpdate(
    req.user.id,
    {
      $inc: buildImpactIncrement(impact),
      $set: { 'environmentalImpact.lastImpactUpdate': new Date() }
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: dailyHabit
  });
});

exports.getMyHabits = asyncHandler(async (req, res) => {
  const end = startOfDay(new Date());
  const start = new Date(end.getTime() - (MS_PER_DAY * 29));

  const habits = await DailyHabit.find({
    user: req.user.id,
    date: { $gte: start, $lte: end }
  }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: habits.length,
    data: habits
  });
});

exports.getMyStreak = asyncHandler(async (req, res) => {
  const habits = await DailyHabit.find({ user: req.user.id })
    .sort({ date: 1 })
    .select('date');

  const normalizedDates = habits
    .map(habit => startOfDay(habit.date).getTime())
    .filter((value, index, array) => array.indexOf(value) === index);

  let longest = 0;
  let current = 0;

  if (normalizedDates.length > 0) {
    let streak = 1;
    for (let i = 1; i < normalizedDates.length; i += 1) {
      const diff = normalizedDates[i] - normalizedDates[i - 1];
      if (diff === MS_PER_DAY) {
        streak += 1;
      } else {
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }
    longest = Math.max(longest, streak);

    const today = startOfDay(new Date()).getTime();
    const lastDate = normalizedDates[normalizedDates.length - 1];
    const daysFromToday = Math.round((today - lastDate) / MS_PER_DAY);

    if (daysFromToday === 0 || daysFromToday === 1) {
      current = 1;
      for (let i = normalizedDates.length - 1; i > 0; i -= 1) {
        if (normalizedDates[i] - normalizedDates[i - 1] === MS_PER_DAY) {
          current += 1;
        } else {
          break;
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      current,
      longest
    }
  });
});
