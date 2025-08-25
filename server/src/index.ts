import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") dotenv.config();

import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes.js";
import { setupVite, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Request logging middleware for /api only
app.use((req, res, next) => {
  const start = Date.now();
  const p = req.path;
  let capturedJson: unknown;

  const origJson = res.json.bind(res) as typeof res.json;
  (res as any).json = (body: any) => {
    capturedJson = body;
    return origJson(body);
  };

  res.on("finish", () => {
    if (p.startsWith("/api")) {
      const dur = Date.now() - start;
      let line = `${req.method} ${p} ${res.statusCode} in ${dur}ms`;
      if (capturedJson !== undefined) line += ` :: ${JSON.stringify(capturedJson)}`;
      if (line.length > 200) line = line.slice(0, 199) + "…";
      log(line);
    }
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // ✅ Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    log(`❌ Error: ${err?.message || "Internal Server Error"}`);
    return res.status(status).json({ message: err?.message || "Internal Server Error" });
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // ✅ Production: serve built client
    const clientDist = path.join(process.cwd(), "dist", "client");
    app.use(express.static(clientDist));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) return res.status(404).json({ message: "Not found" });
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  const port = parseInt(process.env.PORT || "3000", 10);
  // Ensure backend never uses port 5000 (reserved for frontend)
  const actualPort = port === 5000 ? 3000 : port;

  server.listen(actualPort, "0.0.0.0", () =>  // ✅ Works on Render
 
    log(`🚀 Server running on http://127.0.0.1:${actualPort} (env:${process.env.NODE_ENV})`)
  );
})();
