import { COOKIE_NAME } from "../../shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { NextFunction, Request, Response } from "express";
import * as db from "../db";
import { sdk } from "./sdk";

const CACHE_TTL_MS = 5_000;
const ALLOWED_PATHS = [
  "/maintenance",
  "/healthz",
  "/api/oauth",
  "/api/dev-login",
  "/api/dev/admin-login",
];

let maintenanceCache = {
  expiresAt: 0,
  value: false,
};

async function fetchMaintenanceState(forceRefresh = false) {
  if (!forceRefresh && Date.now() < maintenanceCache.expiresAt) {
    return maintenanceCache.value;
  }

  const raw = await db.getSystemSetting("maintenance_mode");
  const enabled = raw === "true";
  maintenanceCache = {
    value: enabled,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  return enabled;
}

async function resolveIsAdmin(req: Request) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return false;
  const cookies = parseCookieHeader(cookieHeader);
  const sessionCookie = cookies[COOKIE_NAME];
  if (!sessionCookie) return false;
  const session = await sdk.verifySession(sessionCookie);
  if (!session?.openId) return false;
  const user = await db.getUserByOpenId(session.openId);
  if (!user) return false;
  return user.role === "admin" || user.role === "super_admin";
}

function isAlwaysAllowed(path: string) {
  return ALLOWED_PATHS.some((allowed) => path.startsWith(allowed));
}

export async function maintenanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (isAlwaysAllowed(req.path)) {
      return next();
    }

    const maintenanceEnabled = await fetchMaintenanceState();
    if (!maintenanceEnabled) {
      return next();
    }

    const isAdmin = await resolveIsAdmin(req);
    if (isAdmin) {
      return next();
    }

    const acceptsHtml =
      typeof req.headers.accept === "string" &&
      req.headers.accept.includes("text/html");

    if (acceptsHtml && req.path !== "/maintenance") {
      return res.redirect(307, "/maintenance");
    }

    if (req.path.startsWith("/api")) {
      return res.status(503).json({ message: "Maintenance mode active" });
    }

    return next();
  } catch (error) {
    console.error("[MaintenanceMiddleware] Failed:", error);
    return next();
  }
}

export function __resetMaintenanceCache() {
  maintenanceCache = { value: false, expiresAt: 0 };
}
