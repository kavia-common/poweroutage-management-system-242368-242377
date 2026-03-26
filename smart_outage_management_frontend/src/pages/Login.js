import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PageHeader } from "../components/PageHeader";

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Demo login page for role-aware navigation. */
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@utility.example");
  const [role, setRole] = useState("admin");

  const roleOptions = useMemo(
    () => [
      { value: "admin", label: "Admin" },
      { value: "dispatcher", label: "Dispatcher" },
      { value: "technician", label: "Technician" },
    ],
    []
  );

  // Redirecting is a side-effect; do it in an effect to avoid updating the router
  // during render (which causes warnings and can lead to unexpected navigation in tests).
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    signIn({ email, role });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="page" style={{ paddingTop: 18 }}>
      <PageHeader
        title="Sign in"
        subtitle="Demo authentication (role-aware UI). Configure backend env vars later for real auth."
      />

      <div className="grid">
        <div className="card card-pad col-6">
          <h2 className="card-title">Access</h2>
          <p className="card-subtitle">
            Choose a role to see the corresponding navigation and pages.
          </p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label className="small" htmlFor="email">Email</label>
            <input
              id="email"
              className="kinput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@utility.com"
              autoComplete="email"
            />

            <label className="small" htmlFor="role">Role</label>
            <select
              id="role"
              className="kinput"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="kbtn primary" type="submit">Continue</button>
              <button
                className="kbtn"
                type="button"
                onClick={() => {
                  setEmail("tech@utility.example");
                  setRole("technician");
                }}
              >
                Quick: Technician
              </button>
            </div>
          </form>
        </div>

        <div className="card card-pad col-6">
          <h2 className="card-title">Offline-friendly</h2>
          <p className="card-subtitle">
            If the backend REST/WS endpoints are unavailable or not configured, the app will run in
            graceful degraded mode with mock data and simulated live updates.
          </p>
          <div className="notice">
            Tip: set <span className="mono">REACT_APP_API_BASE</span> and <span className="mono">REACT_APP_WS_URL</span> to connect to your backend.
          </div>
        </div>
      </div>
    </div>
  );
}
