import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { getOutages } from "../api/client";

// PUBLIC_INTERFACE
export function OutagesPage() {
  /** Outage list + status page. */
  const [outages, setOutages] = useState([]);
  const [source, setSource] = useState("unknown");
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getOutages({ allowMock: true });
      if (!mounted) return;
      setOutages(res.data);
      setSource(res.source);
      setError(res.error || null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      <PageHeader
        title="Outages"
        subtitle={`Manage incidents and status transitions. (Source: ${source})`}
        right={
          <button className="kbtn primary" type="button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        }
      />

      {error ? (
        <div className="notice" style={{ marginTop: 14 }}>
          Backend unavailable; showing mock data. Error: <span className="mono">{String(error.message || error)}</span>
        </div>
      ) : null}

      <div className="grid">
        <div className="card card-pad col-12">
          <h2 className="card-title">All outages</h2>
          <p className="card-subtitle">This view will later support filtering, assignment, and SLA tracking.</p>

          <table className="table" aria-label="Outage table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Region</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Started</th>
                <th style={{ textAlign: "right" }}>Affected</th>
              </tr>
            </thead>
            <tbody>
              {outages.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td>{o.region}</td>
                  <td>{o.status}</td>
                  <td>{o.severity}</td>
                  <td className="mono">{String(o.startedAt || "").replace("T", " ").slice(0, 16)}</td>
                  <td style={{ textAlign: "right" }}>{Number(o.customersAffected || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {outages.length === 0 ? <div className="small" style={{ marginTop: 10 }}>No outages available.</div> : null}
        </div>
      </div>
    </div>
  );
}
