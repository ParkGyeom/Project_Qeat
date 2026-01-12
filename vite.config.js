import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ✅ [핵심] 모든 IP에서 접속 허용
    port: 5173,      // 포트 고정
  }
})