/**
 * Environment configuration.
 * Keep this minimal and resilient: if env vars are missing, the app should still render
 * and show an offline/graceful-degraded mode.
 */

const normalizeBase = (value) => {
  if (!value) return "";
  // Remove trailing slash for predictable URL joining.
  return value.replace(/\/+$/, "");
};

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns normalized environment configuration for the SPA. */
  const apiBase = normalizeBase(process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL);
  const wsUrl = normalizeBase(process.env.REACT_APP_WS_URL);
  const frontendUrl = normalizeBase(process.env.REACT_APP_FRONTEND_URL);

  const nodeEnv = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";
  const logLevel = process.env.REACT_APP_LOG_LEVEL || "info";

  return {
    apiBase,
    wsUrl,
    frontendUrl,
    nodeEnv,
    logLevel,
  };
}
