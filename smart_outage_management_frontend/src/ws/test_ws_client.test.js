import { createOutageWebSocketClient } from "./client";

describe("ws/client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.useFakeTimers();
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_WS_URL;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("starts offline simulation when REACT_APP_WS_URL is not set", () => {
    const onEvent = jest.fn();
    const client = createOutageWebSocketClient({ onEvent });

    client.start();

    // It will mark offline and schedule interval; it shouldn't throw.
    expect(client.getStatus()).toBe("offline");

    // One tick should publish a simulated event.
    jest.advanceTimersByTime(4600);
    expect(onEvent).toHaveBeenCalled();
    const evt = onEvent.mock.calls[0][0];
    expect(evt.source).toBe("simulated");
    expect(["outage.updated", "technician.updated"]).toContain(evt.type);

    client.stop();
    expect(client.getStatus()).toBe("idle");

    // After stop, no further events should be emitted.
    const calls = onEvent.mock.calls.length;
    jest.advanceTimersByTime(4600);
    expect(onEvent.mock.calls.length).toBe(calls);
  });

  test("live mode publishes parsed JSON messages with source=ws", async () => {
    process.env.REACT_APP_WS_URL = "wss://example.test/ws";

    // Minimal WebSocket mock to satisfy the client contract.
    class MockWebSocket {
      static instances = [];
      constructor(url) {
        this.url = url;
        this.listeners = {};
        MockWebSocket.instances.push(this);
      }
      addEventListener(type, cb, opts) {
        // Support { once: true } used by the implementation.
        if (opts?.once) {
          const wrapper = (...args) => {
            cb(...args);
            this.removeEventListener(type, wrapper);
          };
          this._add(type, wrapper);
          return;
        }
        this._add(type, cb);
      }
      _add(type, cb) {
        this.listeners[type] = this.listeners[type] || new Set();
        this.listeners[type].add(cb);
      }
      removeEventListener(type, cb) {
        this.listeners[type]?.delete(cb);
      }
      emit(type, eventObj) {
        for (const cb of this.listeners[type] || []) cb(eventObj);
      }
      close() {
        // no-op
      }
    }

    global.WebSocket = MockWebSocket;

    const onEvent = jest.fn();
    const client = createOutageWebSocketClient({ onEvent });

    client.start();

    // The connect loop awaits "open"/"error" events; simulate open.
    const ws = MockWebSocket.instances[0];
    ws.emit("open", {});

    // After open, status becomes live.
    // connectLoop is async; let microtasks flush.
    await Promise.resolve();
    expect(client.getStatus()).toBe("live");

    ws.emit("message", { data: JSON.stringify({ type: "outage.updated", payload: { id: "OUT-1" } }) });
    expect(onEvent).toHaveBeenCalledWith({ type: "outage.updated", payload: { id: "OUT-1" }, source: "ws" });

    client.stop();
    expect(client.getStatus()).toBe("idle");
  });

  test("live mode wraps non-JSON messages as type=message", async () => {
    process.env.REACT_APP_WS_URL = "wss://example.test/ws";

    class MockWebSocket {
      static instances = [];
      constructor() {
        this.listeners = {};
        MockWebSocket.instances.push(this);
      }
      addEventListener(type, cb, opts) {
        if (opts?.once) {
          const wrapper = (...args) => {
            cb(...args);
            this.removeEventListener(type, wrapper);
          };
          this._add(type, wrapper);
          return;
        }
        this._add(type, cb);
      }
      _add(type, cb) {
        this.listeners[type] = this.listeners[type] || new Set();
        this.listeners[type].add(cb);
      }
      removeEventListener(type, cb) {
        this.listeners[type]?.delete(cb);
      }
      emit(type, eventObj) {
        for (const cb of this.listeners[type] || []) cb(eventObj);
      }
      close() {}
    }

    global.WebSocket = MockWebSocket;

    const onEvent = jest.fn();
    const client = createOutageWebSocketClient({ onEvent });

    client.start();
    const ws = MockWebSocket.instances[0];
    ws.emit("open", {});

    await Promise.resolve();
    expect(client.getStatus()).toBe("live");

    ws.emit("message", { data: "raw-text" });

    expect(onEvent).toHaveBeenCalledWith({ type: "message", payload: "raw-text", source: "ws" });

    client.stop();
  });
});
