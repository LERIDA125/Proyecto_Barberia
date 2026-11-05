import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // En contenedores con bind mounts de Windows, Turbopack no recibe eventos
  // del filesystem del host. El compose activa polling solo para ese entorno.
  watchOptions:
    process.env.NEXT_WATCH_POLL === "true"
      ? { pollIntervalMs: 1000 }
      : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
