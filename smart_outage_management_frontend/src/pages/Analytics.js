import React from "react";
import { PageHeader } from "../components/PageHeader";

// PUBLIC_INTERFACE
export function AnalyticsPage() {
  /** Analytics page placeholder. */
  return (
    <div className="page">
      <PageHeader
        title="Analytics"
        subtitle="Reliability metrics, trends, and performance indicators (placeholder)."
      />

      <div className="grid">
        <div className="card card-pad col-6">
          <h2 className="card-title">SAIDI / SAIFI</h2>
          <p className="card-subtitle">
            Track reliability indices over time (hook up to backend analytics later).
          </p>
          <div className="surface" style={{ padding: 14, borderRadius: 16 }}>
            <div className="small">Coming soon: charts and cohort comparisons.</div>
          </div>
        </div>

        <div className="card card-pad col-6">
          <h2 className="card-title">Restoration performance</h2>
          <p className="card-subtitle">
            MTTR, crew utilization, and dispatch effectiveness.
          </p>
          <div className="surface" style={{ padding: 14, borderRadius: 16 }}>
            <div className="small">Coming soon: segmented KPI drilldowns.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
