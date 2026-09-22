import DashboardLayout from "./DashboardLayout";
import { driverStats, driverJobs } from "../data/mockData";
import "./sgtgo.css";

const statusBadge = {
  Completed: "badge--green",
  "In progress": "badge--blue",
  Assigned: "badge--amber",
};

const navItems = [
  { label: "Jobs", href: "#jobs" },
  { label: "Earnings", href: "#overview" },
];

export default function DriverApp() {
  return (
    <DashboardLayout role="driver" roleLabel="Driver" navItems={navItems}>
      <div id="overview" className="dash__header">
        <h1>Hey Sipho, ready to drive?</h1>
        <p>Here's today's earnings and your current jobs.</p>
      </div>

      <div className="stat-grid">
        {driverStats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div id="jobs" className="panel" style={{ background: "transparent", border: "none" }}>
        <div className="panel__head" style={{ padding: "0 0 1rem" }}>
          <h2>Your jobs</h2>
        </div>
        <div className="job-list">
          {driverJobs.map((j) => (
            <div key={j.id} className="job-card">
              <div className="job-card__route">
                <strong>{j.pickup} → {j.dropoff}</strong>
                <div className="job-card__meta">
                  <span>{j.distance}</span>
                  <span>{j.payout}</span>
                </div>
              </div>
              <span className={`badge ${statusBadge[j.status] || "badge--blue"}`}>
                {j.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
