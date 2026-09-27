import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Memulai Portal Warga Gang Cinta...');
console.log('📦 Menjalankan Server Backend API & Vite Dev Server...');

// Start Express Backend on PORT 3001
const server = spawn('node', ['server/server.js'], {
  cwd: rootDir,
  env: { ...process.env, PORT: '3001' },
  stdio: 'inherit',
  shell: true
});

// Start Vite on PORT 3000
const vite = spawn('npx', ['vite', '--port', '3000', '--host'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Menghentikan proses server...');
  server.kill();
  vite.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
