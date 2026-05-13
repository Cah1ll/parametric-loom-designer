import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/** GitHub project pages live at /<repo>/; user/org pages use repo *.github.io at site root. */
function githubPagesBase(): string {
  if (process.env.GITHUB_ACTIONS !== 'true') return '/'
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repo) return '/'
  if (repo.toLowerCase().endsWith('.github.io')) return '/'
  return `/${repo}/`
}

export default defineConfig({
  base: githubPagesBase(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
