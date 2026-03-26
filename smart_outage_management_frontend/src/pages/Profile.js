import React from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/AuthContext";

// PUBLIC_INTERFACE
export function ProfilePage() {
  /** User profile page placeholder. */
  const { user, role } = useAuth();

  return (
    <div className="page">
      <PageHeader title="Profile" subtitle="Account details and preferences (placeholder)." />
      <div className="grid">
        <div className="card card-pad col-12">
          <h2 className="card-title">Signed-in user</h2>
          <p className="card-subtitle">This is demo auth. Replace with real auth in later steps.</p>

          <table className="table" aria-label="Profile info">
            <tbody>
              <tr>
                <th style={{ width: 240 }}>Email</th>
                <td className="mono">{user?.email}</td>
              </tr>
              <tr>
                <th>Role</th>
                <td>{role}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
