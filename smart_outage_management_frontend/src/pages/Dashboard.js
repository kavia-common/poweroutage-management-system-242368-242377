import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { KpiTile } from "../components/KpiTile";
import { getOutages, getTechnicians } from "../api/client";

// PUBLIC_INTERFACE
export function DashboardPage({ liveEvents }) {
  /** Main dashboard: KPIs, recent outages, and live event stream. */
  const [outages, setOutages] = useState([]);
  const [techs, setTechs] = useState([]);
  const [dataSource, setDataSource] = useState({ outages: "unknown", techs: "unknown" });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const o = await getOutages({ allowMock: true });
      const t = await getTechnicians({ allowMock: true });
      if (!mounted) return;
      setOutages(o.data);
      setTechs(t.data);
      setDataSource({ outages: o.source, techs: t.source });
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const active = outages.filter((o) => String(o.status).toLowerCase() !== "resolved").length;
    const affected = outages.reduce((sum, o) => sum + Number(o.customersAffected || 0), 0);
    const available = techs.filter((t) => String(t.status).toLowerCase() === "available").length;
    return { active, affected, available, totalTechs: techs.length };
  }, [outages, techs]);

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle={`Overview of outages, response posture, and live operational signals. (Data: outages=${dataSource.outages}, technicians=${dataSource.techs})`}
      />

      <div className="grid">
        <div className="col-3 col-4" style={{ gridColumn: "span 3" }} />
      </div>

      <div className="grid">
        <div className="col-4">
          <KpiTile label="Active incidents" value={kpis.active} hint="Non-resolved outages" />
        </div>
        <div className="col-4">
          <KpiTile label="Customers affected" value={kpis.affected.toLocaleString()} hint="Estimated impact" />
        </div>
        <div className="col-4">
          <KpiTile label="Technicians available" value={`${kpis.available}/${kpis.totalTechs}`} hint="Resource posture" />
        </div>

        <div className="card card-pad col-8">
          <h2 className="card-title">Recent outages</h2>
          <p className="card-subtitle">Latest reported incidents and status.</p>

          <table className="table" aria-label="Recent outages">
            <thead>
              <tr>
                <th>ID</th>
                <th>Region</th>
                <th>Status</th>
                <th>Severity</th>
                <th style={{ textAlign: "right" }}>Affected</th>
              </tr>
            </thead>
            <tbody>
              {outages.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td>{o.region}</td>
                  <td>{o.status}</td>
                  <td>{o.severity}</td>
                  <td style={{ textAlign: "right" }}>{Number(o.customersAffected || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-pad col-4">
          <h2 className="card-title">Live feed</h2>
          <p className="card-subtitle">Real-time signals (WS or simulated).</p>

          <div style={{ display: "grid", gap: 10 }}>
            {(liveEvents || []).slice(0, 7).map((evt, idx) => (
              <div key={idx} className="surface" style={{ padding: 10, borderRadius: 14 }}>
                <div className="small">
                  <span className="mono">{evt.type}</span> • {evt.source}
                </div>
                <div className="small" style={{ marginTop: 6 }}>
                  <span className="mono">{JSON.stringify(evt.payload)}</span>
                </div>
              </div>
            ))}
            {(!liveEvents || liveEvents.length === 0) ? (
              <div className="small">No events yet. Waiting for updates…</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
