import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";

import { AppLayout } from "./layout/AppLayout";
import { createOutageWebSocketClient } from "./ws/client";

import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { OutagesPage } from "./pages/Outages";
import { DispatchPage } from "./pages/Dispatch";
import { MapsPage } from "./pages/Maps";
import { AnalyticsPage } from "./pages/Analytics";
import { ReportsPage } from "./pages/Reports";
import { NotificationsPage } from "./pages/Notifications";
import { SettingsPage } from "./pages/Settings";
import { ProfilePage } from "./pages/Profile";
import { NotFoundPage } from "./pages/NotFound";

function AuthedApp() {
  const { isAuthenticated } = useAuth();
  const [wsStatus, setWsStatus] = useState("idle");
  const [apiStatus, setApiStatus] = useState("mock");
  const [liveEvents, setLiveEvents] = useState([]);

  const wsClient = useMemo(() => {
    return createOutageWebSocketClient({
      onEvent: (evt) => {
        setLiveEvents((prev) => [evt, ...prev].slice(0, 50));
      },
    });
  }, []);

  useEffect(() => {
    // Start WS only when authenticated (typical pattern).
    if (!isAuthenticated) return;

    wsClient.start();
    const timer = window.setInterval(() => setWsStatus(wsClient.getStatus()), 500);

    return () => {
      window.clearInterval(timer);
      wsClient.stop();
      setWsStatus("idle");
    };
  }, [isAuthenticated, wsClient]);

  // Derive an "API status" hint from the most recent events:
  // if any event is from mock/simulated, label as mock; if ws live, still might have api.
  useEffect(() => {
    if (liveEvents.some((e) => e.source === "simulated")) setApiStatus("mock");
  }, [liveEvents]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout wsStatus={wsStatus} apiStatus={apiStatus} />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage liveEvents={liveEvents} />} />
        <Route path="/outages" element={<OutagesPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/maps" element={<MapsPage />} />

        <Route
          path="/analytics"
          element={
            <RequireRole capability="view.analytics">
              <AnalyticsPage />
            </RequireRole>
          }
        />

        <Route
          path="/reports"
          element={
            <RequireRole capability="view.reports">
              <ReportsPage />
            </RequireRole>
          }
        />

        <Route path="/notifications" element={<NotificationsPage />} />

        <Route
          path="/settings"
          element={
            <RequireRole capability="view.settings">
              <SettingsPage />
            </RequireRole>
          }
        />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Application entry UI: providers + router. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthedApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
