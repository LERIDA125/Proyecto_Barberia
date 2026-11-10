import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Politica por defecto para `next upgrade --agent` y recordatorios de advisories.
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  // En contenedores con bind mounts de Windows, Turbopack no recibe eventos
  // del filesystem del host. El compose activa polling solo para ese entorno.
  watchOptions:
    process.env.NEXT_WATCH_POLL === "true"
      ? { pollIntervalMs: 1000 }
      : undefined,
  images: {
    // Vercel Services (vercel.json con `services`) no expone el optimizador
    // /_next/image del frontend: la ruta responde 404 y los <Image> rompen.
    // Las URLs de Unsplash ya vienen optimizadas por su CDN (auto=format).
    unoptimized: true,
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
