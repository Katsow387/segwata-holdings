import DashboardLayout from "./DashboardLayout";
import { merchantStats, merchantOrders } from "../data/mockData";
import "./sgtgo.css";

const statusBadge = {
  Delivered: "badge--green",
  "In transit": "badge--blue",
  Preparing: "badge--amber",
};

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Orders", href: "#orders" },
  { label: "Deliveries", href: "#orders" },
  { label: "Invoices", href: "#orders" },
];

export default function MerchantDashboard() {
  return (
    <DashboardLayout role="merchant" roleLabel="Merchant" navItems={navItems}>
      <div id="overview" className="dash__header">
        <h1>Welcome back, Nomvula's Cash & Carry</h1>
        <p>Here's what's moving on your account today.</p>
      </div>

      <div className="stat-grid">
        {merchantStats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div id="orders" className="panel">
        <div className="panel__head">
          <h2>Recent orders</h2>
          <button className="btn btn--outline btn--small">Reorder last</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {merchantOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.supplier}</td>
                <td>{o.items}</td>
                <td>{o.total}</td>
                <td>
                  <span className={`badge ${statusBadge[o.status] || "badge--blue"}`}>
                    {o.status}
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
