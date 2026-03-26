import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { getOutages, getTechnicians } from "../api/client";

// PUBLIC_INTERFACE
export function DispatchPage() {
  /** Dispatch view: technician availability + suggested actions (mockable). */
  const [outages, setOutages] = useState([]);
  const [techs, setTechs] = useState([]);
  const [source, setSource] = useState({ outages: "unknown", techs: "unknown" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const o = await getOutages({ allowMock: true });
      const t = await getTechnicians({ allowMock: true });
      if (!mounted) return;
      setOutages(o.data);
      setTechs(t.data);
      setSource({ outages: o.source, techs: t.source });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const candidates = useMemo(() => {
    const open = outages.filter((o) => String(o.status).toLowerCase() !== "resolved");
    const available = techs.filter((t) => String(t.status).toLowerCase() === "available");
    return open.slice(0, 4).map((o, idx) => ({
      outage: o,
      tech: available[idx % Math.max(1, available.length)] || null,
    }));
  }, [outages, techs]);

  return (
    <div className="page">
      <PageHeader
        title="Dispatch"
        subtitle={`Coordinate field response and assignments. (outages=${source.outages}, technicians=${source.techs})`}
      />

      <div className="grid">
        <div className="card card-pad col-6">
          <h2 className="card-title">Technician roster</h2>
          <p className="card-subtitle">Availability and regional coverage.</p>
          <table className="table" aria-label="Technicians">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Region</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {techs.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.region}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-pad col-6">
          <h2 className="card-title">Suggested assignments</h2>
          <p className="card-subtitle">
            Placeholder logic for now; later powered by optimization/ML.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {candidates.map((c) => (
              <div key={c.outage.id} className="surface" style={{ padding: 12, borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div className="mono" style={{ fontWeight: 700 }}>{c.outage.id}</div>
                    <div className="small">{c.outage.region} • {c.outage.severity} • {c.outage.status}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="small">Suggested technician</div>
                    <div style={{ fontWeight: 700 }}>{c.tech ? c.tech.name : "None available"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="kbtn primary" type="button" disabled={!c.tech}>
                    Assign
                  </button>
                  <button className="kbtn" type="button">
                    View details
                  </button>
                </div>
              </div>
            ))}

            {candidates.length === 0 ? <div className="small">No open outages to dispatch.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
