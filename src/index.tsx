import { AIUsageReport } from './AIUsageReport';
import './styles.css';

// The report reads everything over IPC on mount; nothing to set up or tear down.
export async function activate() {}

export async function deactivate() {}

export const panels = {
  report: {
    component: AIUsageReport,
  },
};
