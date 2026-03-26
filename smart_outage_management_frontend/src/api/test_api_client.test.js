import { apiRequest, getOutages, getTechnicians } from "./client";

describe("api/client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_API_BASE;
    delete process.env.REACT_APP_BACKEND_URL;

    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("apiRequest throws when api base is not configured", async () => {
    await expect(apiRequest("/outages", { method: "GET" })).rejects.toThrow(/API base URL is not configured/i);
  });

  test("apiRequest joins urls and returns JSON on 2xx", async () => {
    process.env.REACT_APP_API_BASE = "https://api.example.test/";

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify([{ id: "OUT-1" }]),
    });

    await expect(apiRequest("/outages", { method: "GET" })).resolves.toEqual([{ id: "OUT-1" }]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe("https://api.example.test/outages");
  });

  test("apiRequest returns null when response body is empty", async () => {
    process.env.REACT_APP_API_BASE = "https://api.example.test";

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => "",
    });

    await expect(apiRequest("/health", { method: "GET" })).resolves.toBeNull();
  });

  test("apiRequest throws readable error on non-2xx, using JSON message if present", async () => {
    process.env.REACT_APP_API_BASE = "https://api.example.test";

    global.fetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      text: async () => JSON.stringify({ message: "backend down" }),
    });

    await expect(apiRequest("/outages", { method: "GET" })).rejects.toThrow(/API error 503: backend down/i);
  });

  test("getOutages falls back to mock data when API fails and allowMock=true", async () => {
    process.env.REACT_APP_API_BASE = "https://api.example.test";

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal",
      text: async () => "boom",
    });

    const res = await getOutages({ allowMock: true });
    expect(res.source).toBe("mock");
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.error).toBeTruthy();
  });

  test("getTechnicians throws when API fails and allowMock=false", async () => {
    process.env.REACT_APP_API_BASE = "https://api.example.test";

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal",
      text: async () => "boom",
    });

    await expect(getTechnicians({ allowMock: false })).rejects.toThrow(/API error 500/i);
  });
});
