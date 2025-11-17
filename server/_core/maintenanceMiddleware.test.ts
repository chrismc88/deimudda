import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "../../shared/const";
import { maintenanceMiddleware, __resetMaintenanceCache } from "./maintenanceMiddleware";
import * as db from "../db";
import { sdk } from "./sdk";

vi.mock("../db", () => ({
  getSystemSetting: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./sdk", () => ({
  sdk: {
    verifySession: vi.fn(),
  },
}));

const mockedDb = vi.mocked(db);
const mockedSdk = vi.mocked(sdk);

function createReq(overrides: Partial<Request> = {}): Request {
  return {
    path: "/",
    headers: { accept: "text/html" },
    method: "GET",
    ...overrides,
  } as Request;
}

function createRes() {
  const res: Partial<Response> & {
    redirectedTo?: { status: number; url: string };
    statusCodeSent?: number;
    jsonPayload?: any;
  } = {};
  res.redirect = (status: number, url: string) => {
    res.redirectedTo = { status, url };
    return res as Response;
  };
  res.status = (code: number) => {
    res.statusCodeSent = code;
    return res as Response;
  };
  res.json = (payload: any) => {
    res.jsonPayload = payload;
    return res as Response;
  };
  return res as Response & typeof res;
}

describe("maintenanceMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetMaintenanceCache();
  });

  it("allows traffic when maintenance mode is disabled", async () => {
    mockedDb.getSystemSetting.mockResolvedValue("false");
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    await maintenanceMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.redirectedTo).toBeUndefined();
  });

  it("redirects HTML requests when maintenance mode is active", async () => {
    mockedDb.getSystemSetting.mockResolvedValue("true");
    mockedSdk.verifySession.mockResolvedValue(null as any);

    const req = createReq({ path: "/" });
    const res = createRes();
    const next = vi.fn();

    await maintenanceMiddleware(req, res, next);

    expect(res.redirectedTo).toEqual({ status: 307, url: "/maintenance" });
    expect(next).not.toHaveBeenCalled();
  });

  it("lets admin traffic pass through", async () => {
    mockedDb.getSystemSetting.mockResolvedValue("true");
    mockedSdk.verifySession.mockResolvedValue({
      openId: "admin",
      appId: "app",
      name: "Admin",
      roles: ["admin"],
    });
    mockedDb.getUserByOpenId.mockResolvedValue({
      id: 1,
      role: "admin",
    } as any);

    const req = createReq({
      headers: {
        cookie: `${COOKIE_NAME}=token`,
        accept: "text/html",
      },
    });
    const res = createRes();
    const next = vi.fn();

    await maintenanceMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.redirectedTo).toBeUndefined();
  });

  it("returns 503 for API calls when maintenance mode is active", async () => {
    mockedDb.getSystemSetting.mockResolvedValue("true");
    mockedSdk.verifySession.mockResolvedValue(null as any);

    const req = createReq({
      path: "/api/trpc",
      headers: { accept: "*/*" },
    });
    const res = createRes();
    const next = vi.fn();

    await maintenanceMiddleware(req, res, next);

    expect(res.statusCodeSent).toBe(503);
    expect(res.jsonPayload).toEqual({ message: "Maintenance mode active" });
    expect(next).not.toHaveBeenCalled();
  });
});
