import React from "react";

// PUBLIC_INTERFACE
export function PageHeader({ title, subtitle, right }) {
  /** Consistent page header (topbar) with optional right-aligned actions. */
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="topbar-actions">{right}</div>
    </div>
  );
}
