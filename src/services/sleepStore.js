// src/services/sleepStore.js
const LS_KEY = 'sleep.store.v1';

function getStore() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || seedSleepData();
  } catch {
    return seedSleepData();
  }
}

function setStore(next) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

function seedSleepData() {
  const store = {
    sleepHistory: [
      { date: '2024-01-15', duration: '7h 45m', quality: 82, deepSleep: '1h 45m', remSleep: '1h 30m', wakeups: 2 },
      { date: '2024-01-14', duration: '6h 30m', quality: 65, deepSleep: '1h 15m', remSleep: '1h 10m', wakeups: 4 },
      { date: '2024-01-13', duration: '8h 15m', quality: 88, deepSleep: '2h 00m', remSleep: '1h 45m', wakeups: 1 },
      { date: '2024-01-12', duration: '7h 00m', quality: 72, deepSleep: '1h 30m', remSleep: '1h 20m', wakeups: 3 },
      { date: '2024-01-11', duration: '7h 30m', quality: 78, deepSleep: '1h 40m', remSleep: '1h 25m', wakeups: 2 },
    ],
    lastNight: { duration: '7h 45m', quality: 82, deepSleep: '1h 45m', remSleep: '1h 30m', wakeups: 2 },
    environment: { temperature: '68°F', noise: 32, light: 15 },
    stagesDistribution: [
      { name: 'deep', value: '1h 45m' },
      { name: 'light', value: '4h 00m' },
      { name: 'rem', value: '1h 30m' },
      { name: 'awake', value: '30m' }
    ],
    qualityTrend: [
      { date: 'Jan 10', quality: 72 },
      { date: 'Jan 11', quality: 78 },
      { date: 'Jan 12', quality: 65 },
      { date: 'Jan 13', quality: 88 },
      { date: 'Jan 14', quality: 82 }
    ],
    sleepArchitecture: [
      { time: '22:00', deep: 0, light: 0, rem: 0, awake: 1 },
      { time: '23:00', deep: 2, light: 1, rem: 0, awake: 0 },
      { time: '00:00', deep: 3, light: 1, rem: 0, awake: 0 },
      { time: '01:00', deep: 2, light: 2, rem: 1, awake: 0 },
      { time: '02:00', deep: 1, light: 3, rem: 2, awake: 0 },
      { time: '03:00', deep: 2, light: 2, rem: 1, awake: 1 },
      { time: '04:00', deep: 1, light: 3, rem: 2, awake: 0 },
      { time: '05:00', deep: 0, light: 2, rem: 3, awake: 1 },
      { time: '06:00', deep: 0, light: 1, rem: 1, awake: 2 }
    ],
    stagesRadar: [
      { subject: 'Deep', A: 80, B: 85 },
      { subject: 'Light', A: 70, B: 65 },
      { subject: 'REM', A: 75, B: 80 },
      { subject: 'Efficiency', A: 82, B: 90 },
      { subject: 'Consistency', A: 78, B: 85 }
    ],
    stageAnalysis: [
      { name: 'Deep', duration: '1h 45m', percentage: 22, analysis: 'Good deep sleep duration' },
      { name: 'Light', duration: '4h 00m', percentage: 52, analysis: 'Normal light sleep phase' },
      { name: 'REM', duration: '1h 30m', percentage: 19, analysis: 'Could improve REM duration' }
    ],
    weeklyPatterns: [
      { day: 'Mon', duration: 7.5, quality: 78 },
      { day: 'Tue', duration: 7.0, quality: 72 },
      { day: 'Wed', duration: 8.0, quality: 85 },
      { day: 'Thu', duration: 6.5, quality: 65 },
      { day: 'Fri', duration: 7.5, quality: 80 },
      { day: 'Sat', duration: 8.5, quality: 88 },
      { day: 'Sun', duration: 7.0, quality: 70 }
    ],
    notes: [
      { date: '2024-01-15', content: 'Felt well rested today. Woke up naturally before alarm.', mood: 'rested' },
      { date: '2024-01-14', content: 'Trouble falling asleep due to late coffee.', mood: 'tired' }
    ],
    averageDuration: '7h 30m',
    efficiency: 85,
    consistency: 78
  };
  setStore(store);
  return store;
}

// API
export async function getSleepData() {
  return getStore();
}

export async function saveSleepEntry(entry) {
  const store = getStore();
  const newEntry = {
    id: Date.now(),
    ...entry,
    date: entry.date || new Date().toISOString().split('T')[0]
  };
  store.sleepHistory.unshift(newEntry);
  store.lastNight = newEntry;
  setStore(store);
}

export async function addSleepNote(note) {
  const store = getStore();
  const newNote = {
    id: Date.now(),
    ...note,
    date: note.date || new Date().toISOString().split('T')[0]
  };
  store.notes.unshift(newNote);
  setStore(store);
}

export async function generateSleepInsights() {
  const data = getStore();
  return {
    quickTips: [
      'Maintain consistent sleep schedule',
      'Avoid caffeine after 2 PM',
      'Keep bedroom temperature between 65-68°F',
      'Limit screen time 1 hour before bed'
    ],
    disorderRisks: [
      { condition: 'Insomnia', symptoms: 'Difficulty falling asleep', risk: 'low' },
      { condition: 'Sleep Apnea', symptoms: 'Loud snoring, daytime fatigue', risk: 'medium' },
      { condition: 'Restless Legs', symptoms: 'Urge to move legs at night', risk: 'low' }
    ],
    improvementPlan: [
      { week: 'Week 1', action: 'Establish consistent bedtime' },
      { week: 'Week 2', action: 'Implement screen curfew' },
      { week: 'Week 3', action: 'Optimize sleep environment' },
      { week: 'Week 4', action: 'Practice relaxation techniques' }
    ]
  };
}

export async function getAISleepAdvice() {
  const data = getStore();
  const recommendations = [];

  const asNum = (s) => (typeof s === 'string' ? parseFloat(s) : s);
  const avgDurNum = asNum(data.averageDuration) || 7.5;
  if (avgDurNum < 7) {
    recommendations.push({ title: 'Increase Sleep Duration', description: 'Aim for 7-9 hours of sleep per night for optimal health', priority: 'high' });
  }
  if (data.lastNight?.quality < 70) {
    recommendations.push({ title: 'Improve Sleep Quality', description: 'Consider adjusting your sleep environment and pre-bed routine', priority: 'medium' });
  }
  if (data.consistency < 75) {
    recommendations.push({ title: 'Enhance Sleep Consistency', description: 'Try to go to bed and wake up at the same time every day', priority: 'medium' });
  }

  return {
    recommendations: recommendations.length ? recommendations : [{
      title: 'Great Sleep Habits!',
      description: 'Your sleep patterns are healthy. Continue maintaining good sleep hygiene.',
      priority: 'low'
    }]
  };
}

export async function calculateSleepScore() {
  const data = getStore();

  let score = 70; // base
  const avgDuration = parseFloat(data.averageDuration) || 7.5;
  if (avgDuration >= 7 && avgDuration <= 9) score += 15;
  else if (avgDuration >= 6 && avgDuration < 7) score += 5;

  const avgQuality = data.sleepHistory.reduce((sum, e) => sum + e.quality, 0) / data.sleepHistory.length;
  score += (avgQuality - 50) * 0.3;

  score += data.consistency * 0.2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export async function getSleepRecommendations() {
  const data = getStore();
  const score = await calculateSleepScore();
  const recommendations = [];

  if (score < 60) {
    recommendations.push('Consider consulting a sleep specialist');
    recommendations.push('Implement a relaxing bedtime routine');
    recommendations.push('Evaluate your mattress and pillow comfort');
  }
  if (data.lastNight?.wakeups > 3) {
    recommendations.push('Limit fluid intake before bedtime');
    recommendations.push('Address potential noise disturbances');
  }
  return recommendations.length ? recommendations : ['Maintain your current healthy sleep habits!'];
}

export async function exportSleepReport(format) {
  return `/api/export/sleep-report.${format}`;
}
/** 🔁 Alias to match UI import (`exportSleepData`) */
export async function exportSleepData(format) {
  return exportSleepReport(format);
}
