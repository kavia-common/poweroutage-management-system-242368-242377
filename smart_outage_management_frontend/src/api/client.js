import { getEnv } from "../config/env";
import { createLogger } from "../utils/logger";

const log = createLogger("api");

function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  if (!b) return `/${p}`;
  return `${b}/${p}`;
}

async function safeJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /**
   * Executes an API request against REACT_APP_API_BASE (or REACT_APP_BACKEND_URL).
   * Throws on non-2xx. If apiBase is unset, throws an error that callers can use to
   * trigger graceful fallback.
   */
  const { apiBase } = getEnv();
  if (!apiBase) {
    throw new Error("API base URL is not configured (REACT_APP_API_BASE / REACT_APP_BACKEND_URL).");
  }

  const url = joinUrl(apiBase, path);
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 8000;
  const t = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const data = await safeJson(res);
    if (!res.ok) {
      const msg = typeof data === "string" ? data : (data && data.message) || res.statusText;
      throw new Error(`API error ${res.status}: ${msg}`);
    }
    return data;
  } catch (err) {
    log.warn("API request failed:", url, err);
    throw err;
  } finally {
    window.clearTimeout(t);
  }
}

/**
 * Minimal mock dataset to keep the SPA useful without the backend.
 * This is intentionally small; pages should clearly indicate offline mode.
 */
const mockDb = {
  outages: [
    {
      id: "OUT-10231",
      status: "Active",
      severity: "High",
      customersAffected: 1842,
      region: "North District",
      startedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    },
    {
      id: "OUT-10228",
      status: "Investigating",
      severity: "Medium",
      customersAffected: 320,
      region: "Riverbend",
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "OUT-10212",
      status: "Resolved",
      severity: "Low",
      customersAffected: 41,
      region: "Downtown",
      startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ],
  technicians: [
    { id: "TECH-07", name: "A. Rivera", status: "En route", region: "North District" },
    { id: "TECH-03", name: "S. Patel", status: "Available", region: "Riverbend" },
    { id: "TECH-11", name: "M. Chen", status: "On site", region: "Downtown" },
  ],
};

// PUBLIC_INTERFACE
export async function getOutages({ allowMock = true } = {}) {
  /** Fetches outages list, optionally falling back to mock data. */
  try {
    const data = await apiRequest("/outages", { method: "GET" });
    return { data: Array.isArray(data) ? data : data?.items || [], source: "api" };
  } catch (e) {
    if (!allowMock) throw e;
    return { data: mockDb.outages, source: "mock", error: e };
  }
}

// PUBLIC_INTERFACE
export async function getTechnicians({ allowMock = true } = {}) {
  /** Fetches technicians list, optionally falling back to mock data. */
  try {
    const data = await apiRequest("/technicians", { method: "GET" });
    return { data: Array.isArray(data) ? data : data?.items || [], source: "api" };
  } catch (e) {
    if (!allowMock) throw e;
    return { data: mockDb.technicians, source: "mock", error: e };
  }
}
