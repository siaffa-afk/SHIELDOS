// Builds a single self-contained HTML file (dist-demo/index.html) that can be
// opened by double-click, for stakeholder preview without installing Node.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-demo' },
});
