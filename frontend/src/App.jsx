import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "./pages/Home";
import Quote from "./pages/Quote";
import Login from "./pages/Login";
import { AuthProvider } from "./lib/auth";
import RequireRole, { Continue } from "./lib/RequireRole";
import Landing from "./sgtgo/Landing";
import Signup from "./sgtgo/Signup";
import Apply from "./sgtgo/Apply";
import ApplicationStatus from "./sgtgo/ApplicationStatus";
import MerchantDashboard from "./sgtgo/MerchantDashboard";
import SupplierDashboard from "./sgtgo/SupplierDashboard";
import DriverApp from "./sgtgo/DriverApp";
import AdminDashboard from "./sgtgo/AdminDashboard";
import "./index.css";

// Old per-role sign-up links keep working and just preselect the role.
const OldRoleSignup = () => <Navigate to={`/signup?role=${useParams().role}`} replace />;

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sgt-go" element={<Landing />} />
        <Route path="/sgt-go/signup" element={<Signup />} />
        <Route path="/sgt-go/:role/signup" element={<OldRoleSignup />} />
        <Route path="/sgt-go/continue" element={<Continue />} />

        {/* After sign-up: the right application form, then a status page while the admin reviews */}
        <Route path="/sgt-go/apply" element={<RequireRole applicant><Apply /></RequireRole>} />
        <Route path="/sgt-go/status" element={<RequireRole applicant><ApplicationStatus /></RequireRole>} />
        <Route path="/sgt-go/driver/apply" element={<Navigate to="/sgt-go/apply" replace />} />
        <Route path="/sgt-go/driver/status" element={<Navigate to="/sgt-go/status" replace />} />

        {/* Dashboards open only once the admin has approved the application */}
        <Route path="/sgt-go/merchant" element={<RequireRole role="merchant"><MerchantDashboard /></RequireRole>} />
        <Route path="/sgt-go/supplier" element={<RequireRole role="supplier"><SupplierDashboard /></RequireRole>} />
        <Route path="/sgt-go/driver" element={<RequireRole role="driver"><DriverApp /></RequireRole>} />
        <Route path="/sgt-go/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  );
}
