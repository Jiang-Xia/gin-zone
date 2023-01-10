import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig({
  plugins: [
    uni(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "zone",
        short_name: "zone",
        icons: [
          {
            src: "./static/logo/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "./static/logo/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "./static/logo/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone"
      },
    }),
  ],
});
