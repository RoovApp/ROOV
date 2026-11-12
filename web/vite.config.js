import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * O app vive em `/admin/` (fase de teste fechado): a raiz do domínio serve só
 * uma página "em breve" (`site/index.html`, copiada pra `dist/` no build) e
 * `/admin` exige usuário e senha (`middleware.js`, roda no Vercel). Para o app
 * voltar pra raiz, trocar `BASE` por '/' e `outDir` por 'dist'.
 */
const BASE = '/admin/';

export default defineConfig({
  base: BASE,
  build: { outDir: 'dist/admin', emptyOutDir: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon-32.png'],
      // `/admin` fica atrás de Basic Auth: sem isso o navegador busca o
      // manifest sem credenciais e recebe 401.
      useCredentials: true,
      manifest: {
        name: 'ROOV',
        short_name: 'ROOV',
        description: 'ROOV conecta pessoas às experiências certas, no momento certo, através dos lugares mais compatíveis.',
        lang: 'pt-BR',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#050505',
        icons: [
          { src: `${BASE}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${BASE}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${BASE}icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: `${BASE}index.html`,
        // Nunca cachear chamadas à API: o app precisa de dado real, não de uma
        // resposta velha servida offline sem o usuário saber.
        navigateFallbackDenylist: [/^\/v1\//],
        runtimeCaching: [
          {
            urlPattern: /\/v1\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), './src') },
  },
  server: { port: 5173 },
});
