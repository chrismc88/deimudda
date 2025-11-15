import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";
import { sdk } from "./sdk";
import "../testAdmin"; // Create test admin user

const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID ?? "admin-local";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Basic health endpoint for connectivity checks
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true, pid: process.pid });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Dev-only login helper: set a session cookie without external OAuth
  // Gated by DEV_LOGIN_ENABLED flag (default: enabled in development)
  const devLoginEnabled = !["0", "false", "no"].includes(
    String(process.env.DEV_LOGIN_ENABLED || "true").toLowerCase()
  );
  
  if (process.env.NODE_ENV === "development" && devLoginEnabled) {
    console.log("⚠️  Dev login endpoints ACTIVE (/api/dev-login, /api/dev/admin-login)");
    console.log("    To disable: Set DEV_LOGIN_ENABLED=false");
    
    app.get("/api/dev-login", async (req, res) => {
      const openId =
        typeof req.query.openId === "string" ? req.query.openId : "dev-user";
      const name =
        typeof req.query.name === "string" ? req.query.name : "Dev User";

      // Optional: ?admin=1 in der URL erzwingt Admin (nur in DEV)
      const adminParam = String(req.query.admin ?? "");
      const byParam =
        adminParam === "1" || adminParam.toLowerCase() === "true";

      const isAdmin = byParam || openId === OWNER_OPEN_ID;

      // DB: User upserten + Rolle schreiben (falls du 'role' im Schema hast)
      await db.upsertUser({
        openId,
        name,
        lastSignedIn: new Date(),
        role: isAdmin ? "admin" : "user",
      });

      // Session-Token mit Rollen-Claim ausstellen
      const token = await sdk.createSessionToken(openId, {
        name,
        roles: isAdmin ? ["admin"] : ["user"],
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, "/");
    });

    // Admin login endpoint for DevAdminLogin component
    app.post("/api/dev/admin-login", async (req, res) => {
      try {
        const { email } = req.body;
        const openId = email || "admin@test.com";

        // Get user from DB to check if they exist and their role
        const user = await db.getUserByEmail(openId);
        
        if (!user || !["admin", "super_admin"].includes(user.role)) {
          return res.status(403).json({ error: "User is not an admin" });
        }

        // Create session token with admin role
        const token = await sdk.createSessionToken(user.openId, {
          name: user.name,
          roles: [user.role],
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        res.json({ success: true, user: { name: user.name, role: user.role } });
      } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    });
  } else if (process.env.NODE_ENV === "development" && !devLoginEnabled) {
    console.log("✅ Dev login endpoints DISABLED (set DEV_LOGIN_ENABLED=true to enable)");
  }

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  // Inside Docker, bind exactly to PORT to match published ports
  const runningInDocker = fs.existsSync("/.dockerenv");
  const port = runningInDocker
    ? preferredPort
    : await findAvailablePort(preferredPort);

  if (!runningInDocker && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
