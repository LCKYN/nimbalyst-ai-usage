import { AIUsageReport } from './AIUsageReport';
import './styles.css';

import { recordWeeklyUsage } from './weeklyHistory';

let stopRecording: (() => void) | undefined;

// Records the Claude weekly limit whenever the host polls it, panel open or not,
// so the spend chart has a history to draw. Everything else is read on mount.
export async function activate() {
  stopRecording = window.electronAPI.on('claude-usage:update', recordWeeklyUsage);
  window.electronAPI.invoke('claude-usage:get').then(recordWeeklyUsage).catch(() => {});
}

export async function deactivate() {
  stopRecording?.();
}

export const panels = {
  report: {
    component: AIUsageReport,
  },
};
