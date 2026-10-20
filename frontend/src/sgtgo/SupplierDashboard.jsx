import DashboardLayout from "./DashboardLayout";
import { supplierStats, supplierOrders } from "../data/mockData";
import { useAuth } from "../lib/auth";
import "./sgtgo.css";

const statusBadge = {
  Fulfilled: "badge--green",
  Accepted: "badge--blue",
  "Awaiting acceptance": "badge--amber",
};

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Orders", href: "#orders" },
  { label: "Inventory", href: "#orders" },
  { label: "Pricing", href: "#orders" },
];

export default function SupplierDashboard() {
  const { application } = useAuth();
  const name = application?.data?.company_name || "Tiger Brands";
  return (
    <DashboardLayout role="supplier" roleLabel="Supplier" navItems={navItems}>
      <div id="overview" className="dash__header">
        <h1>Welcome back, {name}</h1>
        <p>New orders are waiting on your response.</p>
      </div>

      <div className="stat-grid">
        {supplierStats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div id="orders" className="panel">
        <div className="panel__head">
          <h2>Incoming orders</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Merchant</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {supplierOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.merchant}</td>
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
