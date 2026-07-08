// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app'

export default defineConfig(() => {
  return {
    boot: ['axios'],
    css: ['app.css'],
    extras: ['roboto-font', 'material-icons'],
    build: {
      target: {},
      vueRouterMode: 'history',
      defineEnv: {
        API_URL: process.env.API_URL || 'http://localhost:5198/api',
        ASSET_BASE_URL: process.env.ASSET_BASE_URL || 'http://localhost:5198',
      },
      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },
    devServer: { port: 9200, open: false },
    framework: { config: {}, plugins: ['Notify'] },
    animations: [],
    ssr: { prodPort: 3000, middlewares: ['render'], pwa: false },
    pwa: { workboxMode: 'GenerateSW' },
    cordova: {},
    capacitor: { hideSplashscreen: true },
    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: { appId: 'x-chang-frontend' },
    },
    bex: { extraScripts: [] },
  }
})
