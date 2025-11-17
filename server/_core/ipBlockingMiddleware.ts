import type { Request, Response, NextFunction } from "express";
import * as db from "../db";
import { getClientIP } from "./getClientIP";

/**
 * Middleware to block requests from blocked IP addresses
 * Must be registered BEFORE other routes
 */
export async function ipBlockingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const clientIP = getClientIP(req);

    // Skip check for health endpoint
    if (req.path === "/healthz") {
      return next();
    }

    // Check if IP is blocked
    const isBlocked = await db.isIPBlocked(clientIP);

    if (isBlocked) {
      console.warn(`[Security] Blocked request from IP: ${clientIP} to ${req.path}`);
      res.status(403).json({
        error: "Access Denied",
        message: "Your IP address has been blocked. Please contact support if you believe this is an error.",
      });
      return;
    }

    // IP not blocked, continue
    next();
  } catch (error) {
    console.error("[Security] IP blocking middleware error:", error);
    // Fail open - don't block traffic if DB is down
    next();
  }
}
