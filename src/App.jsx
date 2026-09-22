import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./sgtgo/Landing";
import Signup from "./sgtgo/Signup";
import MerchantDashboard from "./sgtgo/MerchantDashboard";
import SupplierDashboard from "./sgtgo/SupplierDashboard";
import DriverApp from "./sgtgo/DriverApp";
import AdminDashboard from "./sgtgo/AdminDashboard";
import "./index.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sgt-go" element={<Landing />} />
      <Route path="/sgt-go/:role/signup" element={<Signup />} />
      <Route path="/sgt-go/merchant" element={<MerchantDashboard />} />
      <Route path="/sgt-go/supplier" element={<SupplierDashboard />} />
      <Route path="/sgt-go/driver" element={<DriverApp />} />
      <Route path="/sgt-go/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
