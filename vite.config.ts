import react from '@vitejs/plugin-react';
import { UserConfig, ConfigEnv } from 'vite';
import { join } from 'path';

const srcRoot = join(__dirname, 'src');

export default ({ command }: ConfigEnv): UserConfig => {
  // DEV
  if (command === 'serve') {
    return {
      root: srcRoot,
      base: '/',
      plugins: [react()],
      resolve: {
        alias: {
          '/@': srcRoot
        }
      },
      build: {
        outDir: join(srcRoot, 'out'),
        emptyOutDir: true,
        rollupOptions: {}
      },
      server: {
        port: process.env.PORT === undefined ? 3000 : +process.env.PORT
      },
      optimizeDeps: {
        exclude: ['path']
      }
    };
  }
  // PROD
  return {
    root: srcRoot,
    // 我寻思 Electron 不需要指定这玩应
    base: '',
    plugins: [react()],
    resolve: {
      alias: {
        '/@': srcRoot
      }
    },
    build: {
      outDir: join(srcRoot, 'out'),
      emptyOutDir: true,
      rollupOptions: {}
    },
    optimizeDeps: {
      exclude: ['path']
    }
  };
};
