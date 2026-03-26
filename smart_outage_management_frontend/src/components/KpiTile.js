import React from "react";

// PUBLIC_INTERFACE
export function KpiTile({ label, value, hint }) {
  /** Dashboard KPI tile. */
  return (
    <div className="card card-pad">
      <div className="small">{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{value}</div>
      {hint ? <div className="small" style={{ marginTop: 6 }}>{hint}</div> : null}
    </div>
  );
}
