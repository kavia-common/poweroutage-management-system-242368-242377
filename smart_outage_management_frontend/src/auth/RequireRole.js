import React from "react";
import { Navigate } from "react-router-dom";
import { canAccess, useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export function RequireRole({ capability, children }) {
  /** Ensures current role can access a capability; otherwise redirects to dashboard. */
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canAccess(role, capability)) return <Navigate to="/dashboard" replace />;
  return children;
}
