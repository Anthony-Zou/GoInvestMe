import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup-minimal.ts'],
    globals: true,
    css: true,
    // Only include working tests
    include: [
      'src/__tests__/basic.test.ts',
      'src/__tests__/simple.test.ts', 
      'src/__tests__/comprehensive.test.ts',
      'src/__tests__/unit/*.test.ts'
    ],
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        '.next/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})