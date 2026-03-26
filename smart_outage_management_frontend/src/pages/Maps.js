import React from "react";
import { PageHeader } from "../components/PageHeader";

// PUBLIC_INTERFACE
export function MapsPage() {
  /** Maps page placeholder. Google Maps integration can be added later using env var-based API keys. */
  return (
    <div className="page">
      <PageHeader
        title="Maps"
        subtitle="Outage visualization and asset/crew geospatial view (placeholder)."
      />

      <div className="grid">
        <div className="card card-pad col-12">
          <h2 className="card-title">Map canvas</h2>
          <p className="card-subtitle">
            Integrate Google Maps (or another map provider) here. Keep keys in environment variables
            (never hard-code).
          </p>
          <div
            className="surface"
            style={{
              height: 420,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(180deg, rgba(37, 99, 235, 0.10), rgba(245, 158, 11, 0.06))",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Map placeholder</div>
              <div className="small" style={{ marginTop: 6 }}>
                Layers: Outages • Crews • Assets • Weather (future)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
