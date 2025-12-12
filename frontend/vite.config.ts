import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT ?? '5001');
  const target = env.VITE_API_TARGET ?? 'http://localhost:5000';
  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  });
};