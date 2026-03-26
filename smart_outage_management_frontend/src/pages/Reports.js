import React from "react";
import { PageHeader } from "../components/PageHeader";

// PUBLIC_INTERFACE
export function ReportsPage() {
  /** Reports export and audit page placeholder. */
  return (
    <div className="page">
      <PageHeader
        title="Reports"
        subtitle="Operational reporting and compliance exports (placeholder)."
        right={<button className="kbtn primary" type="button">Generate report</button>}
      />

      <div className="grid">
        <div className="card card-pad col-12">
          <h2 className="card-title">Report templates</h2>
          <p className="card-subtitle">
            Exports will be backed by the API later (PDF/CSV). For now, this is a stub view.
          </p>

          <table className="table" aria-label="Report templates">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Daily Outage Summary</td>
                <td className="small">Incidents, affected customers, restorations</td>
                <td className="small">Daily 07:00</td>
              </tr>
              <tr>
                <td>Reliability Indices</td>
                <td className="small">SAIDI/SAIFI and interruption counts</td>
                <td className="small">Weekly</td>
              </tr>
              <tr>
                <td>Technician Utilization</td>
                <td className="small">Workload distribution and response times</td>
                <td className="small">Monthly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
