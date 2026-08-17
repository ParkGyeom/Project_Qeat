import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // ✅ [핵심] 모든 IP에서 접속 허용
      port: 5173,      // 포트 고정
      proxy: {
        '/api': {
          // 백엔드 주소는 .env의 VITE_API_BASE_URL로 설정 (.env.example 참고)
          target: env.VITE_API_BASE_URL || 'http://localhost:9090',
          changeOrigin: true,
        }
      }
    }
  }
})
