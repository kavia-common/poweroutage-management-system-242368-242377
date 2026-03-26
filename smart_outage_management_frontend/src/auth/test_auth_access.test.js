import { canAccess } from "./AuthContext";

describe("auth/canAccess", () => {
  test("guest can only view login", () => {
    expect(canAccess("guest", "view.login")).toBe(true);
    expect(canAccess("guest", "view.dashboard")).toBe(false);
  });

  test("technician access matrix", () => {
    expect(canAccess("technician", "view.dashboard")).toBe(true);
    expect(canAccess("technician", "view.reports")).toBe(false);
    expect(canAccess("technician", "view.settings")).toBe(false);
  });

  test("dispatcher access matrix", () => {
    expect(canAccess("dispatcher", "view.reports")).toBe(true);
    expect(canAccess("dispatcher", "view.analytics")).toBe(false);
  });

  test("admin access matrix", () => {
    expect(canAccess("admin", "view.analytics")).toBe(true);
    expect(canAccess("admin", "view.settings")).toBe(true);
  });

  test("unknown role is denied by default", () => {
    expect(canAccess("unknown", "view.dashboard")).toBe(false);
  });
});
