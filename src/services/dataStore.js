// src/services/dataStore.js
// Lightweight client-side store (localStorage) with a schema
// You can later replace getStore/setStore with Supabase calls.

const LS_KEY = 'ats.store.v1';

// small id fallback in case crypto.randomUUID isn't available
const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2));

function getStore() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || seedIfEmpty();
  } catch {
    return seedIfEmpty();
  }
}

function setStore(next) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

// ---- Schema ---------------------------------------------------------------
// store = {
//   habits: [{id, name, category, type, unit, goal, description, createdAt, streak, optimalTime, reminder}],
//   entries: [{id, habitId, date:'YYYY-MM-DD', value:Number, timestamp}],
//   tokens: { google?: string, ms?: string },
//   achievements: [{id, title, description, unlockedAt, type}],
//   challenges: [{id, name, description, startDate, endDate, participants:[]}],
//   social: {friends: [], rankings: []},
//   settings: {notifications: {}, privacy: {}},
//   wealth: { transactions: [], assets: 0, liabilities: 0, ... }
// }

function seedIfEmpty() {
  const now = new Date();
  const d = (off = 0) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - off)
      .toISOString()
      .slice(0, 10);

  const habits = [
    {
      id: 'h1',
      name: 'Morning Meditation',
      category: 'mindfulness',
      type: 'numeric',
      unit: 'min',
      goal: '15',
      description: 'Breathe + reset',
      createdAt: Date.now(),
      streak: 5,
      optimalTime: 'morning',
      reminder: true
    },
    {
      id: 'h2',
      name: 'Deep Work',
      category: 'productivity',
      type: 'numeric',
      unit: 'min',
      goal: '90',
      description: 'Uninterrupted focus',
      createdAt: Date.now(),
      streak: 3,
      optimalTime: 'morning',
      reminder: true
    },
    {
      id: 'h3',
      name: 'Evening Reading',
      category: 'learning',
      type: 'numeric',
      unit: 'min',
      goal: '30',
      description: 'Fiction/non-fiction',
      createdAt: Date.now(),
      streak: 6,
      optimalTime: 'evening',
      reminder: false
    },
    {
      id: 'h4',
      name: 'Exercise',
      category: 'health',
      type: 'numeric',
      unit: 'min',
      goal: '45',
      description: 'Cardio or strength training',
      createdAt: Date.now(),
      streak: 4,
      optimalTime: 'afternoon',
      reminder: true
    }
  ];

  // demo entries (last 14 days)
  const entries = [];
  for (let i = 0; i < 14; i++) {
    entries.push({
      id: uid(),
      habitId: 'h1',
      date: d(i),
      value: 10 + Math.round(Math.random() * 10),
      timestamp: Date.now() - i * 86400000
    });
    entries.push({
      id: uid(),
      habitId: 'h2',
      date: d(i),
      value: 45 + Math.round(Math.random() * 60),
      timestamp: Date.now() - i * 86400000
    });
    if (i % 2 === 0)
      entries.push({
        id: uid(),
        habitId: 'h3',
        date: d(i),
        value: 20 + Math.round(Math.random() * 20),
        timestamp: Date.now() - i * 86400000
      });
    if (i % 3 === 0)
      entries.push({
        id: uid(),
        habitId: 'h4',
        date: d(i),
        value: 30 + Math.round(Math.random() * 30),
        timestamp: Date.now() - i * 86400000
      });
  }

  const achievements = [
    {
      id: 'a1',
      title: '7-Day Streak',
      description: 'Maintained a habit for 7 consecutive days',
      unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      type: 'streak'
    },
    {
      id: 'a2',
      title: 'Early Riser',
      description: 'Completed morning habits before 8 AM for 5 days',
      unlockedAt: new Date(Date.now() - 86400000).toISOString(),
      type: 'consistency'
    },
    {
      id: 'a3',
      title: 'Habit Explorer',
      description: 'Created 3 different habits',
      unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      type: 'variety'
    }
  ];

  const challenges = [
    {
      id: 'c1',
      name: '7-Day Fitness Challenge',
      description: 'Complete 5 workouts this week',
      startDate: d(7),
      endDate: d(0),
      participants: ['user1', 'user2', 'user3'],
      target: 5,
      unit: 'workouts'
    },
    {
      id: 'c2',
      name: 'Mindfulness Marathon',
      description: 'Meditate daily for 14 days',
      startDate: d(14),
      endDate: d(0),
      participants: ['user1', 'user4'],
      target: 14,
      unit: 'days'
    }
  ];

  const social = {
    friends: [
      { id: 'user2', name: 'Alex Chen', avatar: '', joinedAt: d(30) },
      { id: 'user3', name: 'Sam Rivera', avatar: '', joinedAt: d(45) }
    ],
    rankings: [
      { userId: 'user1', name: 'You', totalStreak: 12, rank: 1 },
      { userId: 'user2', name: 'Alex Chen', totalStreak: 18, rank: 2 },
      { userId: 'user3', name: 'Sam Rivera', totalStreak: 15, rank: 3 }
    ]
  };

  const settings = {
    notifications: {
      reminders: true,
      achievements: true,
      challenges: true,
      social: false
    },
    privacy: {
      shareProgress: false,
      showInRankings: true
    }
  };

  const wealth = {
    transactions: [
      { id: 1, type: 'income', amount: 5000, description: 'Monthly Salary', category: 'Salary', date: d(0) },
      { id: 2, type: 'expense', amount: 1500, description: 'Rent Payment', category: 'Housing', date: d(0) },
      { id: 3, type: 'expense', amount: 400, description: 'Groceries', category: 'Food', date: d(1) },
      { id: 4, type: 'investment', amount: 1000, description: 'Stock Purchase', category: 'Stocks', date: d(2) }
    ],
    assets: 75000,
    liabilities: 25000,
    monthlyIncome: 5000,
    monthlyExpenses: 3200,
    investmentTotal: 25000,
    totalDebt: 15000
  };

  const store = {
    habits,
    entries,
    tokens: {},
    achievements,
    challenges,
    social,
    settings,
    wealth
  };
  setStore(store);
  return store;
}

// ---- Core API ------------------------------------------------------------------
export async function getUserHabits() {
  const { habits, entries } = getStore();
  // recompute simple streaks
  const byId = new Map(habits.map((h) => [h.id, h]));
  const today = new Date().toISOString().slice(0, 10);
  for (const h of habits) {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const has = entries.some((e) => e.habitId === h.id && e.date === date && e.value > 0);
      if (!has) break;
      streak++;
      if (date === today) break;
    }
    byId.get(h.id).streak = streak;
  }

  // attach minimal history arrays
  const histByHabit = {};
  for (const e of entries) {
    histByHabit[e.habitId] ||= [];
    histByHabit[e.habitId].push({ date: e.date, value: Number(e.value || 0) });
  }
  return habits.map((h) => ({
    ...byId.get(h.id),
    history: (histByHabit[h.id] || []).sort((a, b) => a.date.localeCompare(b.date))
  }));
}

export async function createHabit(habit) {
  const store = getStore();
  const id = uid();
  store.habits.push({
    id,
    name: habit.name,
    category: habit.category || 'productivity',
    type: habit.type || 'numeric',
    unit: habit.unit || 'min',
    goal: habit.goal || '',
    description: habit.description || '',
    createdAt: Date.now(),
    streak: 0,
    optimalTime: habit.optimalTime || '',
    reminder: !!habit.reminder
  });
  setStore(store);
  return id;
}

export async function updateHabit(id, patch) {
  const store = getStore();
  const idx = store.habits.findIndex((h) => h.id === id);
  if (idx === -1) throw new Error('Habit not found');
  store.habits[idx] = { ...store.habits[idx], ...patch };
  setStore(store);
  return store.habits[idx];
}

export async function deleteHabit(id) {
  const store = getStore();
  // remove habit
  store.habits = store.habits.filter((h) => h.id !== id);
  // remove its entries
  store.entries = store.entries.filter((e) => e.habitId !== id);
  setStore(store);
  return { success: true };
}

export async function saveHabitEntry(habitId, value, dateStr) {
  const store = getStore();
  const date = dateStr || new Date().toISOString().slice(0, 10);
  // upsert for that day
  const existing = store.entries.find((e) => e.habitId === habitId && e.date === date);
  if (existing) {
    existing.value = Number(value || 0);
    existing.timestamp = Date.now();
  } else {
    store.entries.push({
      id: uid(),
      habitId,
      date,
      value: Number(value || 0),
      timestamp: Date.now()
    });
  }
  setStore(store);

  // Check for achievements after saving entry
  await checkAndUnlockAchievements(habitId);

  return { success: true };
}

export function getEntries({ habitId, days = 14 } = {}) {
  const { entries } = getStore();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const list = entries.filter((e) => (!habitId || e.habitId === habitId) && e.date === d);
    out.push({ date: d, total: list.reduce((a, b) => a + (b.value || 0), 0) });
  }
  return out;
}

// For charts on Habits page: one block per habit
export function getHabitSeries(days = 14) {
  const { habits, entries } = getStore();
  const blocks = habits.map((h) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const val = entries.find((e) => e.habitId === h.id && e.date === d)?.value ?? 0;
      data.push({ d: d.slice(5), min: val });
    }
    return { title: h.name, meta: `Goal ${h.goal || ''} ${h.unit || ''}`.trim(), data, habit: h };
  });
  return blocks;
}

// ---- Enhanced AI Features -------------------------------------------------

export const getPredictiveSchedule = async () => {
  const { habits, entries } = getStore();
  const schedule = [];

  habits.forEach((habit) => {
    const habitEntries = entries.filter((e) => e.habitId === habit.id && e.value > 0);

    if (habitEntries.length > 0) {
      const morningEntries = habitEntries.filter((e) => {
        const hour = new Date(e.timestamp).getHours();
        return hour >= 6 && hour < 12;
      });

      const afternoonEntries = habitEntries.filter((e) => {
        const hour = new Date(e.timestamp).getHours();
        return hour >= 12 && hour < 18;
      });

      const eveningEntries = habitEntries.filter((e) => {
        const hour = new Date(e.timestamp).getHours();
        return hour >= 18 || hour < 6;
      });

      const bestTime = [
        { period: 'morning', count: morningEntries.length, confidence: (morningEntries.length / habitEntries.length) * 100 },
        { period: 'afternoon', count: afternoonEntries.length, confidence: (afternoonEntries.length / habitEntries.length) * 100 },
        { period: 'evening', count: eveningEntries.length, confidence: (eveningEntries.length / habitEntries.length) * 100 }
      ].sort((a, b) => b.confidence - a.confidence)[0];

      let timeWindow, confidence;
      switch (bestTime.period) {
        case 'morning':
          timeWindow = '07:00-09:00';
          confidence = Math.min(95, Math.max(60, bestTime.confidence));
          break;
        case 'afternoon':
          timeWindow = '14:00-16:00';
          confidence = Math.min(85, Math.max(50, bestTime.confidence));
          break;
        case 'evening':
          timeWindow = '19:00-21:00';
          confidence = Math.min(80, Math.max(45, bestTime.confidence));
          break;
        default:
          timeWindow = '09:00-11:00';
          confidence = 65;
      }

      schedule.push({
        habit: habit.name,
        time: timeWindow,
        confidence: Math.round(confidence),
        habitId: habit.id
      });
    } else {
      const defaultTimes = {
        mindfulness: { time: '07:00-07:30', confidence: 75 },
        productivity: { time: '09:00-11:00', confidence: 80 },
        health: { time: '18:00-19:00', confidence: 70 },
        learning: { time: '20:00-21:00', confidence: 65 },
        wealth: { time: '08:00-09:00', confidence: 60 }
      };

      const defaultTime = defaultTimes[habit.category] || { time: '09:00-10:00', confidence: 60 };
      schedule.push({
        habit: habit.name,
        time: defaultTime.time,
        confidence: defaultTime.confidence,
        habitId: habit.id
      });
    }
  });

  return schedule.sort((a, b) => b.confidence - a.confidence);
};

export const getHabitCorrelations = async () => {
  const { habits, entries } = getStore();
  const correlations = [];

  if (habits.length < 2) return correlations;

  for (let i = 0; i < habits.length; i++) {
    for (let j = i + 1; j < habits.length; j++) {
      const habitA = habits[i];
      const habitB = habits[j];

      const datesA = new Set(entries.filter((e) => e.habitId === habitA.id && e.value > 0).map((e) => e.date));
      const datesB = new Set(entries.filter((e) => e.habitId === habitB.id && e.value > 0).map((e) => e.date));

      const bothCompleted = [...datesA].filter((date) => datesB.has(date)).length;
      const totalDays = new Set([...datesA, ...datesB]).size;

      if (totalDays > 0) {
        const correlationStrength = bothCompleted / totalDays;

        if (correlationStrength > 0.3) {
          correlations.push({
            relationship: `${habitA.name} → ${habitB.name}`,
            strength: Math.round(correlationStrength * 100) / 100,
            habits: [habitA.id, habitB.id]
          });
        }
      }
    }
  }

  correlations.push(
    { relationship: 'Exercise → Sleep Quality', strength: 0.82, habits: [] },
    { relationship: 'Meditation → Focus Hours', strength: 0.67, habits: [] },
    { relationship: 'Screen Time → Sleep Quality', strength: -0.45, habits: [] }
  );

  return correlations.sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength));
};

export const getProgressForecast = async () => {
  const { habits, entries } = getStore();

  if (habits.length === 0) {
    return {
      successProbability: 0,
      riskFactors: ['No habits tracked yet'],
      recommendations: ['Start by creating your first habit']
    };
  }

  let totalProbability = 0;
  let habitCount = 0;
  const riskFactors = [];

  habits.forEach((habit) => {
    const recentEntries = entries
      .filter((e) => e.habitId === habit.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    if (recentEntries.length > 0) {
      const successRate = recentEntries.filter((e) => e.value > 0).length / recentEntries.length;
      totalProbability += successRate * 100;
      habitCount++;

      if (successRate < 0.5) {
        riskFactors.push(`Low consistency with ${habit.name}`);
      }
    }
  });

  const avgProbability = habitCount > 0 ? totalProbability / habitCount : 0;

  const today = new Date();
  if (today.getDay() === 0 || today.getDay() === 6) {
    riskFactors.push('Weekend schedule changes');
  }

  const upcomingEvents = await detectUpcomingEvents();
  riskFactors.push(...upcomingEvents);

  return {
    successProbability: Math.round(avgProbability),
    riskFactors: riskFactors.slice(0, 3),
    recommendations: ['Try scheduling habits at consistent times', 'Set smaller, achievable goals', 'Use reminders for important habits']
  };
};

// ---- Gamification Features ------------------------------------------------

export const getAchievements = async () => {
  const store = getStore();
  return store.achievements || [];
};

export const getMotivationTriggers = async () => {
  const { habits, entries } = getStore();
  const triggers = [];

  habits.forEach((habit) => {
    const recentEntries = entries
      .filter((e) => e.habitId === habit.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    const missedDays = recentEntries.filter((e) => e.value === 0).length;

    if (missedDays >= 2) {
      triggers.push({
        title: `Get back to ${habit.name}`,
        condition: `Missed ${missedDays} recent days`,
        habitId: habit.id,
        priority: 'high'
      });
    }

    if (habit.streak >= 5) {
      triggers.push({
        title: `Keep your ${habit.streak}-day streak!`,
        condition: `Maintain ${habit.name} streak`,
        habitId: habit.id,
        priority: 'medium'
      });
    }
  });

  return triggers;
};

export async function joinWeeklyChallenge(challengeId) {
  const store = getStore();
  const challenge = store.challenges.find((c) => c.id === challengeId);
  if (challenge && !challenge.participants.includes('user1')) {
    challenge.participants.push('user1');
    setStore(store);
  }
  return { success: true, challengeId };
}

export const getWeeklyChallenges = async () => {
  const store = getStore();
  return store.challenges || [];
};

// ---- Social Features ------------------------------------------------------

export const getSocialRankings = async () => {
  const store = getStore();
  return store.social?.rankings || [];
};

export const shareHabitProgress = async (habitId, platform = 'general') => {
  const { habits, entries } = getStore();
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) return { success: false, error: 'Habit not found' };

  const recentProgress = entries
    .filter((e) => e.habitId === habitId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7)
    .filter((e) => e.value > 0).length;

  return {
    success: true,
    message: `Shared ${habit.name} progress: ${recentProgress}/7 days completed!`,
    platform,
    shareUrl: `/share/habit/${habitId}`
  };
};

// ---- Export & Reporting ---------------------------------------------------

export const exportHabitData = async (format = 'pdf') => {
  const timestamp = new Date().toISOString().slice(0, 10);

  switch (format) {
    case 'pdf':
      return `/api/export/habits-report-${timestamp}.pdf`;
    case 'csv':
      return `/api/export/habits-data-${timestamp}.csv`;
    case 'json':
      return `/api/export/habits-${timestamp}.json`;
    default:
      return `/api/export/habits-${timestamp}.${format}`;
  }
};

export const generateHabitInsights = async () => {
  const [schedule, correlations, forecast, triggers] = await Promise.all([
    getPredictiveSchedule(),
    getHabitCorrelations(),
    getProgressForecast(),
    getMotivationTriggers()
  ]);

  return {
    predictiveSchedule: schedule,
    correlations: correlations.slice(0, 5),
    forecast,
    motivationTriggers: triggers,
    peakHours: '10:00 AM - 12:00 PM',
    bestHabits: ['Morning Meditation', 'Evening Reading'],
    recommendations: [
      'Try scheduling creative work between 10-12 AM',
      'Your energy dips after lunch - consider a short walk',
      'Evening reading correlates with better sleep quality'
    ]
  };
};

// ---- Utility Functions ----------------------------------------------------

async function checkAndUnlockAchievements(habitId) {
  const store = getStore();
  const { habits, entries, achievements } = store;
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) return;

  const unlocked = [];

  if (habit.streak === 7 && !achievements.find((a) => a.title === '7-Day Streak')) {
    unlocked.push({
      id: uid(),
      title: '7-Day Streak',
      description: 'Maintained a habit for 7 consecutive days',
      unlockedAt: new Date().toISOString(),
      type: 'streak'
    });
  }

  if (habit.streak === 30 && !achievements.find((a) => a.title === '30-Day Master')) {
    unlocked.push({
      id: uid(),
      title: '30-Day Master',
      description: 'Maintained a habit for 30 consecutive days',
      unlockedAt: new Date().toISOString(),
      type: 'streak'
    });
  }

  const uniqueHabits = new Set(entries.map((e) => e.habitId));
  if (uniqueHabits.size >= 3 && !achievements.find((a) => a.title === 'Habit Explorer')) {
    unlocked.push({
      id: uid(),
      title: 'Habit Explorer',
      description: 'Created 3 different habits',
      unlockedAt: new Date().toISOString(),
      type: 'variety'
    });
  }

  if (unlocked.length > 0) {
    store.achievements = [...achievements, ...unlocked];
    setStore(store);
    // notify if you want
  }
}

async function detectUpcomingEvents() {
  const today = new Date();
  const riskFactors = [];

  if (today.getDay() === 4) riskFactors.push('Weekend approaching');

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (today.getDate() > daysInMonth - 3) riskFactors.push('End of month busy period');

  const holidays = [
    { month: 0, day: 1, name: 'New Year' },
    { month: 11, day: 25, name: 'Christmas' }
  ];

  holidays.forEach((holiday) => {
    if (today.getMonth() === holiday.month && Math.abs(today.getDate() - holiday.day) <= 3) {
      riskFactors.push(`${holiday.name} holiday period`);
    }
  });

  return riskFactors;
}

// Maintenance helpers you might expose elsewhere
export function clearAllData() {
  localStorage.removeItem(LS_KEY);
  seedIfEmpty();
  return { success: true };
}

export function getStoreStats() {
  const store = getStore();
  return {
    totalHabits: store.habits.length,
    totalEntries: store.entries.length,
    totalAchievements: store.achievements.length,
    lastUpdated: new Date().toISOString()
  };
}
