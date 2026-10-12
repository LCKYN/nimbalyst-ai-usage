import { nimbalystPreset } from '@nimbalyst/extension-sdk/tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [nimbalystPreset],
  content: {
    // relative: true resolves the globs against this file, not the build CWD.
    relative: true,
    files: ['./src/**/*.{ts,tsx}'],
  },
};

export default config;
