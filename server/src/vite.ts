import type { Express } from "express";
import type { Server } from "http";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);
}

export function log(message: string) {
  console.log(message);
}
