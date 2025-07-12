export default defineNuxtConfig({
  modules: [
    '@nuxt/ui'
  ],
  runtimeConfig: {
    public: {
      commitHash: process.env.NUXT_ENV_CURRENT_GIT_SHA || 'unknown',
      appVersion: process.env.npm_package_version || 'unknown'
    }
  }
})
