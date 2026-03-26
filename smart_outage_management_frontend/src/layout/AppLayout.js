import React, { useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { canAccess, useAuth } from "../auth/AuthContext";
import { getEnv } from "../config/env";

// PUBLIC_INTERFACE
export function AppLayout({ wsStatus, apiStatus }) {
  /** Main application shell: sidebar navigation + content outlet. */
  const { user, role, signOut } = useAuth();
  const env = getEnv();

  const navItems = useMemo(() => {
    const items = [
      { to: "/dashboard", label: "Dashboard", cap: "view.dashboard" },
      { to: "/outages", label: "Outages", cap: "view.outages" },
      { to: "/dispatch", label: "Dispatch", cap: "view.dispatch" },
      { to: "/maps", label: "Maps", cap: "view.maps" },
      { to: "/analytics", label: "Analytics", cap: "view.analytics" },
      { to: "/reports", label: "Reports", cap: "view.reports" },
      { to: "/notifications", label: "Notifications", cap: "view.notifications" },
      { to: "/settings", label: "Settings", cap: "view.settings" },
    ];
    return items.filter((it) => canAccess(role, it.cap));
  }, [role]);

  const wsBadge = wsStatus === "live" ? { cls: "ok", text: "WS live" } : { cls: "bad", text: wsStatus || "WS" };
  const apiBadge = apiStatus === "api" ? { cls: "ok", text: "API" } : { cls: "bad", text: apiStatus || "Mock" };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-title">Smart Outage Management</div>
            <div className="brand-subtitle">Ocean Professional</div>
          </div>
          <span className="role-pill">{role}</span>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="badge" title={env.wsUrl ? env.wsUrl : "REACT_APP_WS_URL not set"}>
            <span className={`badge-dot ${wsBadge.cls}`} />
            {wsBadge.text}
          </span>
          <span className="badge" title={env.apiBase ? env.apiBase : "REACT_APP_API_BASE not set"}>
            <span className={`badge-dot ${apiBadge.cls}`} />
            {apiBadge.text}
          </span>
        </div>

        <nav className="nav" aria-label="Primary">
          {navItems.map((it) => (
            <NavLink key={it.to} to={it.to}>
              {({ isActive }) => (
                <div className={`nav-item ${isActive ? "active" : ""}`}>
                  <div>{it.label}</div>
                  <div className="nav-meta">›</div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <hr className="hr" />

        <div className="small">
          Signed in as <span className="mono">{user?.email}</span>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <NavLink className="kbtn" to="/profile" style={{ textDecoration: "none" }}>
            Profile
          </NavLink>
          <button className="kbtn danger" onClick={signOut} type="button">
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
