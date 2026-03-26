import React from "react";
import { PageHeader } from "../components/PageHeader";

// PUBLIC_INTERFACE
export function NotificationsPage() {
  /** Notifications center placeholder. */
  return (
    <div className="page">
      <PageHeader
        title="Notifications"
        subtitle="System alerts and operational updates (placeholder)."
      />

      <div className="grid">
        <div className="card card-pad col-12">
          <h2 className="card-title">Inbox</h2>
          <p className="card-subtitle">
            In the next steps, this will be backed by API + real-time delivery.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <div className="surface" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 700 }}>High severity outage detected</div>
              <div className="small">OUT-10231 • North District • 1,842 affected</div>
            </div>
            <div className="surface" style={{ padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 700 }}>Technician status updated</div>
              <div className="small">TECH-07 • En route</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
