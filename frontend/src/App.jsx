import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quote from "./pages/Quote";
import Login from "./pages/Login";
import DriverApply from "./sgtgo/DriverApply";
import DriverStatus from "./sgtgo/DriverStatus";
import { AuthProvider } from "./lib/auth";
import RequireRole from "./lib/RequireRole";
import Landing from "./sgtgo/Landing";
import Signup from "./sgtgo/Signup";
import MerchantDashboard from "./sgtgo/MerchantDashboard";
import SupplierDashboard from "./sgtgo/SupplierDashboard";
import DriverApp from "./sgtgo/DriverApp";
import AdminDashboard from "./sgtgo/AdminDashboard";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quote" element={<Quote />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sgt-go" element={<Landing />} />
      <Route path="/sgt-go/:role/signup" element={<Signup />} />
      <Route path="/sgt-go/merchant" element={<RequireRole role="merchant"><MerchantDashboard /></RequireRole>} />
      <Route path="/sgt-go/supplier" element={<RequireRole role="supplier"><SupplierDashboard /></RequireRole>} />
      <Route path="/sgt-go/driver" element={<RequireRole role="driver" needsApproval><DriverApp /></RequireRole>} />
      <Route path="/sgt-go/driver/apply" element={<RequireRole role="driver"><DriverApply /></RequireRole>} />
      <Route path="/sgt-go/driver/status" element={<RequireRole role="driver"><DriverStatus /></RequireRole>} />
      <Route path="/sgt-go/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
      <Route path="*" element={<Home />} />
    </Routes>
    </AuthProvider>
  );
}
