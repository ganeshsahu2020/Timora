import { generateHabitInsights } from './insightsEngine';
let handle;

export function startDailyRefresh(cb) {
  stopDailyRefresh();
  // naive interval: every 30 min recompute & notify UI callback
  handle = setInterval(async () => cb(await generateHabitInsights()), 30*60*1000);
}
export function stopDailyRefresh(){ if (handle) clearInterval(handle); }
