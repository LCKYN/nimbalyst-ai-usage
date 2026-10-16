/**
 * Getting the report's data out: CSV and JSON files for the tables, a Markdown
 * summary of the Overview for pasting into notes or a chat.
 */
import type { UsageOverviewData } from './UsageOverview';
import { cacheHitRate, formatCompactNumber, formatUSD } from './usageFormat';

type Cell = string | number | boolean | null;

/** RFC 4180: a cell holding `,`, `"` or a line break is quoted, with inner quotes doubled. */
export function toCSV(rows: ReadonlyArray<Record<string, Cell>>): string {
  if (rows.length === 0) return '';
  const cell = (value: Cell) => {
    const text = value === null ? '' : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const columns = Object.keys(rows[0]);
  return [columns, ...rows.map((row) => columns.map((column) => row[column]))]
    .map((line) => line.map(cell).join(','))
    .join('\r\n');
}

/** The host has no `will-download` handler, so Electron shows its native save dialog. */
export function saveFile(name: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** `ai-usage-sessions-2026-10-16.csv`, dated in local time. */
function fileName(tab: string, ext: string): string {
  return `ai-usage-${tab}-${new Date().toLocaleDateString('en-CA')}.${ext}`;
}

export function saveCSV(tab: string, rows: ReadonlyArray<Record<string, Cell>>): void {
  saveFile(fileName(tab, 'csv'), toCSV(rows), 'text/csv');
}

export function saveJSON(tab: string, data: unknown): void {
  saveFile(fileName(tab, 'json'), JSON.stringify(data, null, 2), 'application/json');
}

const mdCell = (text: string) => text.replace(/\|/g, '\\|');

/** `change` is the Spend card's comparison line, e.g. `↑ 12% vs previous 30 days`. */
export function overviewMarkdown(data: UsageOverviewData, rangeLabel: string, change: string | null): string {
  const { totals } = data;
  const spend = (s: { costUSD: number; costEstimated: boolean }) => `${s.costEstimated ? '~' : ''}${formatUSD(s.costUSD)}`;
  const hit = cacheHitRate({
    inputTokens: totals.inputTokens,
    cacheReadInputTokens: totals.cacheReadTokens,
    cacheCreationInputTokens: totals.cacheWriteTokens,
  });
  const table = (heading: string, rows: Array<{ name: string; costUSD: number; costEstimated: boolean; totalTokens: number; sessionCount: number }>) => [
    `## By ${heading.toLowerCase()}`,
    '',
    `| ${heading} | Spend | Tokens | Sessions |`,
    '| --- | ---: | ---: | ---: |',
    ...rows.map((r) => `| ${mdCell(r.name)} | ${spend(r)} | ${formatCompactNumber(r.totalTokens)} | ${r.sessionCount} |`),
    '',
  ];

  return [
    `# AI usage: ${rangeLabel}`,
    '',
    `- Spend: ${spend(totals)}`,
    ...(change ? [`- Change: ${change}`] : []),
    `- Tokens: ${formatCompactNumber(totals.totalTokens)} (${formatCompactNumber(totals.cacheReadTokens)} cached, ${formatCompactNumber(totals.inputTokens + totals.cacheWriteTokens)} new input, ${formatCompactNumber(totals.outputTokens)} output)`,
    ...(hit === null ? [] : [`- Cache hit: ${Math.round(hit * 100)}%`]),
    `- Sessions: ${totals.sessionCount} across ${totals.projectCount} projects`,
    '',
    ...table('Model', data.byModel.map((m) => ({ ...m, name: m.model }))),
    ...table('Project', data.byProject.map((p) => ({ ...p, name: p.workspaceId.split('/').pop() || p.workspaceId || 'No project' }))),
  ].join('\n');
}
