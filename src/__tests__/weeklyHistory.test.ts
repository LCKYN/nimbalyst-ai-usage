import { describe, expect, it } from 'vitest';
import { addReading, leftPerBucket, weeklyLeft, type WeeklyReading } from '../weeklyHistory';

const day = (d: number, h = 12) => new Date(2026, 9, d, h).getTime();

describe('weeklyHistory', () => {
  it('keeps only the last reading of each day', () => {
    let history: WeeklyReading[] = [];
    history = addReading(history, [day(1, 9), 90]);
    history = addReading(history, [day(1, 18), 80]);
    history = addReading(history, [day(2, 9), 70]);
    expect(history).toEqual([[day(1, 18), 80], [day(2, 9), 70]]);
  });

  it('puts each bucket at its last reading, null when it has none', () => {
    const history: WeeklyReading[] = [[day(1), 90], [day(3), 60], [day(4), 50]];
    const starts = [day(1, 0), day(2, 0), day(3, 0)];
    expect(leftPerBucket(history, starts)).toEqual([90, null, 50]);
  });

  it('reads percent left and skips errors', () => {
    expect(weeklyLeft({ sevenDay: { utilization: 15.4 } })).toBe(85);
    expect(weeklyLeft({ sevenDay: { utilization: 120 } })).toBe(0);
    expect(weeklyLeft({ error: 'no auth', sevenDay: { utilization: 0 } })).toBeNull();
    expect(weeklyLeft(null)).toBeNull();
  });
});
