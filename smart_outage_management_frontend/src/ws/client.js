import { getEnv } from "../config/env";
import { createLogger } from "../utils/logger";

const log = createLogger("ws");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * Event types the frontend understands.
 * - outage.updated
 * - outage.created
 * - technician.updated
 */

// PUBLIC_INTERFACE
export function createOutageWebSocketClient({ onEvent }) {
  /**
   * Creates a WS client that:
   * - connects to REACT_APP_WS_URL if set
   * - retries with backoff
   * - falls back to simulated events if WS not configured/unavailable
   *
   * Returns { start, stop, getStatus }.
   */
  const { wsUrl } = getEnv();
  let ws = null;
  let stopped = false;
  let status = "idle"; // idle | connecting | live | offline
  let offlineTimer = null;

  const publish = (evt) => {
    try {
      onEvent?.(evt);
    } catch (e) {
      log.error("onEvent handler error", e);
    }
  };

  const startOfflineSimulation = () => {
    status = "offline";
    if (offlineTimer) window.clearInterval(offlineTimer);

    offlineTimer = window.setInterval(() => {
      const sample = Math.random();
      if (sample < 0.6) {
        publish({
          type: "outage.updated",
          payload: {
            id: "OUT-10231",
            status: "Active",
            customersAffectedDelta: Math.floor((Math.random() - 0.45) * 30),
            at: nowIso(),
          },
          source: "simulated",
        });
      } else {
        publish({
          type: "technician.updated",
          payload: {
            id: "TECH-03",
            status: Math.random() > 0.5 ? "Available" : "Assigned",
            at: nowIso(),
          },
          source: "simulated",
        });
      }
    }, 4500);
  };

  const stopOfflineSimulation = () => {
    if (offlineTimer) {
      window.clearInterval(offlineTimer);
      offlineTimer = null;
    }
  };

  const connectLoop = async () => {
    if (!wsUrl) {
      log.warn("REACT_APP_WS_URL not set - using offline simulation");
      startOfflineSimulation();
      return;
    }

    let attempt = 0;
    while (!stopped) {
      attempt += 1;
      status = "connecting";

      try {
        ws = new WebSocket(wsUrl);
      } catch (e) {
        log.warn("Failed to construct WebSocket. Falling back to offline simulation.", e);
        startOfflineSimulation();
        return;
      }

      const opened = await new Promise((resolve) => {
        const onOpen = () => resolve(true);
        const onErr = () => resolve(false);

        ws.addEventListener("open", onOpen, { once: true });
        ws.addEventListener("error", onErr, { once: true });
      });

      if (!opened) {
        try {
          ws.close();
        } catch (_) {
          // ignore
        }
        ws = null;
        const backoff = Math.min(10000, 600 + attempt * attempt * 250);
        log.warn(`WS connect failed. Retry in ${backoff}ms`);
        await sleep(backoff);
        continue;
      }

      stopOfflineSimulation();
      status = "live";
      log.info("WebSocket connected:", wsUrl);

      ws.addEventListener("message", (msg) => {
        let data = null;
        try {
          data = JSON.parse(msg.data);
        } catch (_) {
          data = { type: "message", payload: msg.data };
        }
        publish({ ...data, source: "ws" });
      });

      // Wait until close, then retry.
      await new Promise((resolve) => {
        ws.addEventListener("close", resolve, { once: true });
      });

      if (stopped) break;

      status = "connecting";
      const backoff = Math.min(12000, 800 + attempt * attempt * 260);
      log.warn(`WS disconnected. Reconnecting in ${backoff}ms`);
      await sleep(backoff);
    }
  };

  return {
    // PUBLIC_INTERFACE
    start() {
      /** Starts the WS client; idempotent. */
      if (status !== "idle") return;
      stopped = false;
      connectLoop();
    },
    // PUBLIC_INTERFACE
    stop() {
      /** Stops WS + any simulation timers. */
      stopped = true;
      status = "idle";
      stopOfflineSimulation();
      if (ws) {
        try {
          ws.close();
        } catch (_) {
          // ignore
        } finally {
          ws = null;
        }
      }
    },
    // PUBLIC_INTERFACE
    getStatus() {
      /** Returns current connection status: idle|connecting|live|offline */
      return status;
    },
  };
}
