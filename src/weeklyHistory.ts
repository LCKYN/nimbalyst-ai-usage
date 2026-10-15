/**
 * "Claude weekly left" over time. The host only knows the current reading, so
 * the extension keeps the last one of each local day itself.
 */

const STORAGE_KEY = 'com.nimbalyst.ai-usage:claude-weekly-left';

/** [reading time, percent of the weekly limit left] */
export type WeeklyReading = [atMs: number, leftPct: number];

/** Percent left from a `ClaudeUsageData` (shared/claudeUsage.ts), or null when there is none. */
export function weeklyLeft(usage: any): number | null {
  if (!usage || usage.error || !usage.sevenDay) return null;
  return Math.max(0, Math.round(100 - usage.sevenDay.utilization));
}

/** Appends a reading, replacing the previous one if it is from the same local day. */
export function addReading(history: WeeklyReading[], reading: WeeklyReading): WeeklyReading[] {
  const last = history[history.length - 1];
  const sameDay = last && new Date(last[0]).toDateString() === new Date(reading[0]).toDateString();
  // ponytail: never pruned; one small entry per day, prune if it ever matters.
  return [...(sameDay ? history.slice(0, -1) : history), reading];
}

/** The last reading inside each bucket; a bucket runs from its start to the next one's. */
export function leftPerBucket(history: WeeklyReading[], bucketStarts: number[]): Array<number | null> {
  return bucketStarts.map((start, i) => {
    const end = bucketStarts[i + 1] ?? Infinity;
    let left: number | null = null;
    for (const [atMs, pct] of history) if (atMs >= start && atMs < end) left = pct;
    return left;
  });
}

export function loadWeeklyHistory(): WeeklyReading[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordWeeklyUsage(usage: any): void {
  const left = weeklyLeft(usage);
  if (left === null) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addReading(loadWeeklyHistory(), [Date.now(), left])));
}
