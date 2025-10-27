// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-10-19",
  devtools: { enabled: true },
  css: ["~/assets/css/global.css"],
  app: {
    baseURL: "/pure-web-bottom-sheet/vue-nuxt/",
  },
});
