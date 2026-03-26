import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function setAuthUser(user) {
  if (user) window.localStorage.setItem("som.auth.v1", JSON.stringify(user));
  else window.localStorage.removeItem("som.auth.v1");
}

describe("App routing + auth/role guards + layout navigation", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("unauthenticated users see login page (default route)", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  test("unauthenticated deep-link to protected route redirects to login", async () => {
    window.history.pushState({}, "Outages", "/outages");
    render(<App />);
    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  test("login redirects to dashboard and renders AppLayout shell", async () => {
    render(<App />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /continue/i }));

    // Dashboard header
    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();

    // App shell / sidebar bits
    expect(screen.getByText(/smart outage management/i)).toBeInTheDocument();
    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  test("admin can navigate to Settings via sidebar and back to Profile; sign out returns to login", async () => {
    // Pre-auth as admin so we land in authed area immediately
    setAuthUser({ email: "admin@utility.example", role: "admin" });
    window.history.pushState({}, "Dashboard", "/dashboard");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(screen.getByText("Settings"));
    expect(await screen.findByRole("heading", { name: /settings/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /profile/i }));
    expect(await screen.findByRole("heading", { name: /profile/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.getItem("som.auth.v1")).toBeNull();
    });
  });

  test("technician cannot access /analytics (role guard redirects to dashboard)", async () => {
    setAuthUser({ email: "tech@utility.example", role: "technician" });
    window.history.pushState({}, "Analytics", "/analytics");

    render(<App />);

    // Should redirect to dashboard
    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    // And should not have Analytics link in nav
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  test("dispatcher can access /reports, but not /settings", async () => {
    setAuthUser({ email: "dispatch@utility.example", role: "dispatcher" });

    window.history.pushState({}, "Reports", "/reports");
    render(<App />);
    expect(await screen.findByRole("heading", { name: /reports/i })).toBeInTheDocument();

    // Navigate to settings directly; role guard should send us to dashboard.
    window.history.pushState({}, "Settings", "/settings");
    // Re-render app to pick up route change in this simple test setup.
    render(<App />);
    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });
});
