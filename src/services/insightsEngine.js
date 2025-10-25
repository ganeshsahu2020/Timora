// src/services/insightsEngine.js
// Tiny heuristic + data-driven insights (no backend yet)

import { getEntries, getUserHabits } from './dataStore';

/**
 * Data-driven weekly summary using recent entries and a small context object.
 * @param {{focusBlocks?: {start:string,end:string,kind?:string}[], dips?: string[], sleepAvg?: number, wake?: string}} ctx
 * @returns {string[]}
 */
export function summarizeWeek(ctx = {}) {
  const out = [];

  // 1) Context-derived sentences
  if (ctx.focusBlocks?.length) {
    const block = ctx.focusBlocks[0];
    out.push(`Your top focus window appears around ${block.start}–${block.end}.`);
  }
  if (ctx.dips?.length) out.push(`Energy tends to dip around ${ctx.dips.join(', ')}.`);
  if (ctx.sleepAvg) out.push(`Average sleep: ${ctx.sleepAvg} hrs; wake around ${ctx.wake || '–'}.`);

  // 2) Local calculations from recent activity (total minutes)
  const last14 = getEntries({ days: 14 });
  const last7 = getEntries({ days: 7 });
  const t14 = last14.reduce((a, b) => a + b.total, 0);
  const t7 = last7.reduce((a, b) => a + b.total, 0);
  out.push(`Focus minutes last 7 days: ${t7} (vs ${t14} in 14 days).`);

  return out;
}

/**
 * Ranks habits by recent average and returns simple insights.
 * @returns {Promise<{peakHours:string,bestHabits:string[],recommendations:string[]}>}
 */
export async function generateHabitInsights() {
  const habits = await getUserHabits();

  const blocks = habits.map((h) => {
    const recent = getEntries({ habitId: h.id, days: 14 });
    const total = recent.reduce((a, b) => a + b.total, 0);
    return { id: h.id, name: h.name, streak: h.streak, total14: total, avg: Math.round(total / 14) };
  });

  const best = [...blocks].sort((a, b) => b.avg - a.avg)[0];
  const peakHours = '10:00–12:00'; // simple placeholder until we compute from data

  return {
    peakHours,
    bestHabits: best ? [best.name] : [],
    recommendations: [
      `Schedule deep work in ${peakHours}.`,
      'Bundle email into two windows to reduce context switching.',
      'Take a 10-minute reset walk at ~15:00.',
    ],
  };
}

/**
 * Lightweight heuristic summary (matches the “tiny engine” example).
 * Useful as a fallback when no data is loaded yet.
 * @param {{focusBlocks?: {start:string,end:string,kind?:string}[], dips?: string[], sleepAvg?: number, wake?: string}} metrics
 * @returns {string[]}
 */
export function simpleSummary(metrics = {}) {
  const peaks = ['08:30–11:00', '19:00–21:00'];
  const dips = metrics?.dips?.length ? metrics.dips.join(', ') : '14:00–16:00';

  return [
    `You tend to peak between ${peaks[0]} and ${peaks[1]}.`,
    `Avoid meetings from ${dips} — your energy dips there.`,
    `Sleep avg ${metrics.sleepAvg ?? 6.7}h, wake ~${metrics.wake || '07:30'}.`,
    `Try a 15-min walk around 15:00 to reset.`,
  ];
}
