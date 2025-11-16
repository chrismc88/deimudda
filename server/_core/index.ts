import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";
import { sdk } from "./sdk";
import { ipBlockingMiddleware } from "./ipBlockingMiddleware";
import { getClientIP } from "./getClientIP";
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

  // Configure body parser (reduced from 50mb to 2mb for security)
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));

  // ===== SECURITY MIDDLEWARE =====
  
  // Helmet: Security headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires inline styles
        scriptSrc: ["'self'", "'unsafe-inline'", "blob:"], // React dev mode + Vite workers
        workerSrc: ["'self'", "blob:"], // Vite HMR workers
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: process.env.NODE_ENV === "development"
          ? ["'self'", "ws:", "blob:"]
          : ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS: Configure allowed origins
  app.use(cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://deimudda.de"] // Production domain
      : ["http://localhost:3001", "http://localhost:3000"], // Dev
    credentials: true, // Allow cookies
  }));

  // IP Blocking: Check blocked IPs before processing requests
  app.use(ipBlockingMiddleware);

  // Global Rate Limiting: 100 requests per 15 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for Vite dev assets
    skip: (req) => {
      const path = req.path;
      return path.startsWith("/src/") || 
             path.startsWith("/@fs/") || 
             path.startsWith("/@vite/") ||
             path.startsWith("/@id/") ||
             path.startsWith("/node_modules/");
    },
  });
  app.use(globalLimiter);

  // ===== END SECURITY MIDDLEWARE =====

  // Basic health endpoint for connectivity checks
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true, pid: process.pid });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Dev-only login helper: set a session cookie without external OAuth
  // Gated by DEV_LOGIN_ENABLED flag (default: DISABLED, must be explicitly enabled)
  const devLoginEnabled = process.env.NODE_ENV === "development" 
    && ["1", "true", "yes"].includes(
      String(process.env.DEV_LOGIN_ENABLED || "false").toLowerCase()
    );
  
  // SECURITY: Prevent dev login in production
  if (process.env.NODE_ENV === "production" && devLoginEnabled) {
    throw new Error(
      "FATAL SECURITY ERROR: Dev login endpoints cannot be enabled in production! " +
      "Set DEV_LOGIN_ENABLED=false or remove the environment variable."
    );
  }
  
  // Login Rate Limiting: 5 attempts per 15 minutes
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later.",
    skipSuccessfulRequests: true,
  });
  
  if (devLoginEnabled) {
    console.log("⚠️  Dev login endpoints ACTIVE (/api/dev-login, /api/dev/admin-login)");
    console.log("    To disable: Set DEV_LOGIN_ENABLED=false");
    
    app.get("/api/dev-login", loginLimiter, async (req, res) => {
      const openId =
        typeof req.query.openId === "string" ? req.query.openId : "dev-user";
      const name =
        typeof req.query.name === "string" ? req.query.name : "Dev User";

      // Optional: ?admin=1 in der URL erzwingt Admin (nur in DEV)
      const adminParam = String(req.query.admin ?? "");
      const byParam =
        adminParam === "1" || adminParam.toLowerCase() === "true";

      const isAdmin = byParam || openId === OWNER_OPEN_ID;

      // Check if user already exists and preserve their role
      const existingUser = await db.getUserByOpenId(openId);
      const shouldPreserveRole = existingUser && ['admin', 'super_admin'].includes(existingUser.role);

      // DB: User upserten + Rolle schreiben (falls du 'role' im Schema hast)
      await db.upsertUser({
        openId,
        name,
        lastSignedIn: new Date(),
        // Preserve existing admin/super_admin role, otherwise use isAdmin logic
        role: shouldPreserveRole ? existingUser.role : (isAdmin ? "admin" : "user"),
      });

      // Session-Token mit Rollen-Claim ausstellen
      const finalUser = await db.getUserByOpenId(openId);
      const userRole = finalUser?.role || (isAdmin ? "admin" : "user");
      
      const token = await sdk.createSessionToken(openId, {
        name,
        roles: [userRole],
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      
      // Track successful login attempt
      const clientIP = getClientIP(req);
      await db.trackLoginAttempt(
        clientIP,
        finalUser?.id || null,
        req.headers["user-agent"],
        true // success
      );
      
      res.redirect(302, "/");
    });

    // Admin login endpoint for DevAdminLogin component
    app.post("/api/dev/admin-login", loginLimiter, async (req, res) => {
      const clientIP = getClientIP(req);
      
      try {
        const { email } = req.body;
        const openId = email || "admin@test.com";

        // Get user from DB to check if they exist and their role
        const user = await db.getUserByEmail(openId);
        
        if (!user || !["admin", "super_admin"].includes(user.role)) {
          // Track failed login
          await db.trackLoginAttempt(
            clientIP,
            user?.id || null,
            req.headers["user-agent"],
            false // failed
          );
          
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
        
        // Track successful login
        await db.trackLoginAttempt(
          clientIP,
          user.id,
          req.headers["user-agent"],
          true // success
        );

        res.json({ success: true, user: { name: user.name, role: user.role } });
      } catch (error) {
        console.error("Admin login error:", error);
        
        // Track failed login (system error)
        await db.trackLoginAttempt(
          clientIP,
          null,
          req.headers["user-agent"],
          false
        );
        
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
