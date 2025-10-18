import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mile Buy Club",
    short_name: "MBC",
    description: "Track, compare, and act on the best mileage deals through Mile Buy Club.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "en",
    icons: [
      {
        src: "/api/pwa-icon/192",
        sizes: "192x192",
        type: "image/png",
            purpose: "maskable"
      },
      {
        src: "/api/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
            purpose: "maskable"
      },
      {
        src: "/api/pwa-icon/apple",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
