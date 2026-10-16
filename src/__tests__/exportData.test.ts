// @vitest-environment node
import { describe, it, expect } from 'vitest';

import { overviewMarkdown, toCSV } from '../exportData';
import type { UsageOverviewData } from '../UsageOverview';

describe('toCSV', () => {
  it('quotes cells holding a comma, quote or line break, and leaves null empty', () => {
    const csv = toCSV([
      { title: 'a, b', note: 'say "hi"', body: 'line\nbreak', missing: null, n: 3 },
      { title: 'plain', note: '', body: 'x', missing: null, n: 0 },
    ]);
    expect(csv.split('\r\n')).toEqual([
      'title,note,body,missing,n',
      '"a, b","say ""hi""","line\nbreak",,3',
      'plain,,x,,0',
    ]);
  });

  it('is empty for no rows', () => {
    expect(toCSV([])).toBe('');
  });
});

describe('overviewMarkdown', () => {
  const slice = { costUSD: 12.5, totalTokens: 2_400_000, sessionCount: 3, costEstimated: false };
  const data: UsageOverviewData = {
    totals: {
      costUSD: 12.5,
      inputTokens: 100,
      cacheReadTokens: 800,
      cacheWriteTokens: 100,
      outputTokens: 50,
      totalTokens: 2_400_000,
      costEstimated: false,
      unpricedSessionCount: 0,
      sessionCount: 3,
      projectCount: 1,
      activeDays: 2,
    },
    granularity: 'day',
    trend: [],
    byModel: [{ ...slice, model: 'claude-opus-4' }],
    byProject: [{ ...slice, workspaceId: '/repo/my|app', lastActiveMs: 0 }],
  };

  it('lists the totals and a row per model and project', () => {
    const md = overviewMarkdown(data, '30 days', '↑ 12% vs previous 30 days');
    expect(md).toContain('# AI usage: 30 days');
    expect(md).toContain('- Spend: $12.50');
    expect(md).toContain('- Change: ↑ 12% vs previous 30 days');
    expect(md).toContain('- Cache hit: 80%');
    expect(md).toContain('- Sessions: 3');
    expect(md).toContain('| claude-opus-4 | $12.50 | 2.4M | 3 |');
    expect(md).toContain('| my\\|app |');
  });

  it('leaves out the change line when there is nothing to compare with', () => {
    expect(overviewMarkdown(data, 'All time', null)).not.toContain('Change');
  });
});
