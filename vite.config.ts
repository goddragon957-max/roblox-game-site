import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/roblox-game-site/',
  plugins: [react()],
  test: { environment: 'jsdom' }
});
