import type { Request } from "express";

/**
 * Extract client IP address from request
 * Handles X-Forwarded-For header for reverse proxies (Nginx, Cloudflare, etc.)
 */
export function getClientIP(req: Request): string {
  // Check X-Forwarded-For header (from reverse proxy)
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    // Take first IP from comma-separated list
    return forwarded.split(",")[0].trim();
  }

  // Fallback to direct connection IP
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  
  // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }
  
  return ip;
}
