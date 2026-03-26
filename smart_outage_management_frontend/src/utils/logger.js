import { getEnv } from "../config/env";

const levelToNum = (lvl) => {
  switch ((lvl || "").toLowerCase()) {
    case "debug":
      return 10;
    case "info":
      return 20;
    case "warn":
      return 30;
    case "error":
      return 40;
    default:
      return 20;
  }
};

// PUBLIC_INTERFACE
export function createLogger(scope) {
  /** Creates a scoped logger respecting REACT_APP_LOG_LEVEL. */
  const { logLevel } = getEnv();
  const min = levelToNum(logLevel);

  const fmt = (lvl, args) => [`[${lvl}]${scope ? ` [${scope}]` : ""}`, ...args];

  return {
    debug: (...args) => (min <= 10 ? console.debug(...fmt("debug", args)) : undefined),
    info: (...args) => (min <= 20 ? console.info(...fmt("info", args)) : undefined),
    warn: (...args) => (min <= 30 ? console.warn(...fmt("warn", args)) : undefined),
    error: (...args) => (min <= 40 ? console.error(...fmt("error", args)) : undefined),
  };
}
