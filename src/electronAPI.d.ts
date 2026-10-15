// The host preload's generic IPC bridge. The report's channels are handled in
// the Nimbalyst host (main process), not by this extension.
interface Window {
  electronAPI: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    /** Returns the unsubscribe function. */
    on: (channel: string, listener: (...args: any[]) => void) => () => void;
  };
}
