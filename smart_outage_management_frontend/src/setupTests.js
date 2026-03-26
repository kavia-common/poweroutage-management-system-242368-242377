// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

/**
 * Reduce test flakiness/noise:
 * - Components may attempt real fetch/WS calls when env vars are set in CI.
 * - We provide safe defaults so tests never depend on network connectivity.
 */

// Provide a default fetch mock unless a test overrides it.
if (!global.fetch) {
  global.fetch = jest.fn();
}
beforeEach(() => {
  if (typeof global.fetch?.mockReset === "function") global.fetch.mockReset();

  // Default: return empty OK response to avoid unhandled promise rejections.
  if (typeof global.fetch?.mockImplementation === "function") {
    global.fetch.mockImplementation(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "",
    }));
  }
});

/**
 * NOTE: Do not override XMLHttpRequest.
 *
 * CRA's Jest jsdom environment loads the whatwg-fetch polyfill, which implements fetch()
 * on top of XMLHttpRequest and expects XHR APIs like getAllResponseHeaders().
 *
 * An incomplete XHR mock will break fetch() with:
 *   TypeError: xhr.getAllResponseHeaders is not a function
 *
 * If you need to prevent network access in tests, prefer mocking global.fetch (either
 * globally as we do above, or per-test), rather than overriding XMLHttpRequest.
 */

// Minimal WebSocket mock so ws client can construct without hitting network.
if (!global.WebSocket) {
  global.WebSocket = class WebSocketMock {
    constructor() {
      this.listeners = {};
      // In case code listens for open/error, we just stay idle unless test emits.
    }
    addEventListener(type, cb) {
      this.listeners[type] = this.listeners[type] || new Set();
      this.listeners[type].add(cb);
    }
    removeEventListener(type, cb) {
      this.listeners[type]?.delete(cb);
    }
    close() {}
  };
}
