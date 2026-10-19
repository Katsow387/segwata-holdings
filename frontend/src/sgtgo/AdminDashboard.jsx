import DashboardLayout from "./DashboardLayout";
import { adminStats, adminDeliveries, adminDisputes } from "../data/mockData";
import "./sgtgo.css";

const deliveryBadge = {
  Completed: "badge--green",
  "In progress": "badge--blue",
};

const disputeBadge = {
  Investigating: "badge--amber",
  "Awaiting merchant response": "badge--red",
};

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Deliveries", href: "#deliveries" },
  { label: "Disputes", href: "#disputes" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" roleLabel="Admin" navItems={navItems}>
      <div id="overview" className="dash__header">
        <h1>SGT GO control centre</h1>
        <p>A snapshot of what's moving across the platform right now.</p>
      </div>

      <div className="stat-grid">
        {adminStats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div id="deliveries" className="panel">
        <div className="panel__head">
          <h2>Live deliveries</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Delivery</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminDeliveries.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.driver}</td>
                <td>{d.route}</td>
                <td>
                  <span className={`badge ${deliveryBadge[d.status] || "badge--blue"}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="disputes" className="panel">
        <div className="panel__head">
          <h2>Open disputes</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Dispute</th>
              <th>Parties</th>
              <th>Issue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminDisputes.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.parties}</td>
                <td>{d.issue}</td>
                <td>
                  <span className={`badge ${disputeBadge[d.status] || "badge--blue"}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
