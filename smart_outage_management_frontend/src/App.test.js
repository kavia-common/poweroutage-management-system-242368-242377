import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App, { AppRoutes } from "./App";
import { AuthProvider } from "./auth/AuthContext";

function setAuthUser(user) {
  if (user) window.localStorage.setItem("som.auth.v1", JSON.stringify(user));
  else window.localStorage.removeItem("som.auth.v1");
}

function renderAt(pathname) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[pathname]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>
  );
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
    renderAt("/outages");
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

    renderAt("/dashboard");

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

    renderAt("/analytics");

    // Should redirect to dashboard
    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    // And should not have Analytics link in nav
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  test("dispatcher can access /reports, but not /settings", async () => {
    setAuthUser({ email: "dispatch@utility.example", role: "dispatcher" });

    renderAt("/reports");
    expect(await screen.findByRole("heading", { name: /reports/i })).toBeInTheDocument();

    // Navigate to settings using a fresh render with deterministic initial route.
    renderAt("/settings");
    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });
});
