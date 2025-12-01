import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@modules': resolve(__dirname, './src/modules'),
      '@utils': resolve(__dirname, './src/utils'),
      '@shared': resolve(__dirname, './src/shared'),
      '@infra': resolve(__dirname, './src/infrastructure'),
    },
  },
});
