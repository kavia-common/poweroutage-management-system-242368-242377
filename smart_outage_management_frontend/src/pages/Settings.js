import React from "react";
import { PageHeader } from "../components/PageHeader";
import { getEnv } from "../config/env";

// PUBLIC_INTERFACE
export function SettingsPage() {
  /** Settings page (admin). Shows environment config for debugging. */
  const env = getEnv();

  return (
    <div className="page">
      <PageHeader title="Settings" subtitle="Environment and feature toggles (placeholder)." />

      <div className="grid">
        <div className="card card-pad col-12">
          <h2 className="card-title">Runtime configuration</h2>
          <p className="card-subtitle">
            Values are sourced from environment variables. Do not hard-code endpoints or secrets.
          </p>

          <table className="table" aria-label="Environment config">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">REACT_APP_API_BASE / REACT_APP_BACKEND_URL</td>
                <td className="mono">{env.apiBase || "(not set)"}</td>
              </tr>
              <tr>
                <td className="mono">REACT_APP_WS_URL</td>
                <td className="mono">{env.wsUrl || "(not set)"}</td>
              </tr>
              <tr>
                <td className="mono">REACT_APP_FRONTEND_URL</td>
                <td className="mono">{env.frontendUrl || "(not set)"}</td>
              </tr>
              <tr>
                <td className="mono">REACT_APP_LOG_LEVEL</td>
                <td className="mono">{env.logLevel}</td>
              </tr>
              <tr>
                <td className="mono">REACT_APP_NODE_ENV</td>
                <td className="mono">{env.nodeEnv}</td>
              </tr>
            </tbody>
          </table>

          <div className="notice" style={{ marginTop: 14 }}>
            Next step: wire real auth and backend-driven feature flags using <span className="mono">REACT_APP_FEATURE_FLAGS</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
