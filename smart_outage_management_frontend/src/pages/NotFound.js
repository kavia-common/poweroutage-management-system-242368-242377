import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";

// PUBLIC_INTERFACE
export function NotFoundPage() {
  /** Fallback page for unknown routes. */
  return (
    <div className="page">
      <PageHeader title="Page not found" subtitle="The requested route does not exist." />
      <div className="grid">
        <div className="card card-pad col-12">
          <p className="card-subtitle">
            Go back to <Link className="klink" to="/dashboard">Dashboard</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
