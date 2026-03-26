import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "som.auth.v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

function readStoredUser() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  if (parsed?.email && parsed?.role) return parsed;
  return null;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides basic role-aware auth state (demo auth) for navigation and access control. */
  // Initialize from localStorage synchronously so routing guards are deterministic on first render.
  // This avoids test flakiness where a protected deep-link briefly renders unauthenticated and redirects.
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      role: user?.role || "guest",
      // PUBLIC_INTERFACE
      signIn: ({ email, role }) => {
        /** Signs in with an email + role (admin|dispatcher|technician). */
        setUser({ email, role });
      },
      // PUBLIC_INTERFACE
      signOut: () => {
        /** Signs out and clears local state. */
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function canAccess(role, capability) {
  /** Returns whether a role can access a named capability. */
  const r = role || "guest";
  const caps = {
    guest: new Set(["view.login"]),
    technician: new Set(["view.dashboard", "view.outages", "view.dispatch", "view.maps", "view.notifications"]),
    dispatcher: new Set(["view.dashboard", "view.outages", "view.dispatch", "view.maps", "view.notifications", "view.reports"]),
    admin: new Set(["view.dashboard", "view.outages", "view.dispatch", "view.maps", "view.analytics", "view.reports", "view.notifications", "view.settings"]),
  };
  return Boolean(caps[r]?.has(capability));
}
