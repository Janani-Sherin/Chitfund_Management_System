import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import Groups from "./pages/Groups";
import Login from "./pages/login";
import Members from "./pages/Members";
import Register from "./pages/Register";
import Dues from "./pages/Dues";
import DueDetails from "./pages/DueDetails";
import PaymentHistory from "./pages/PaymentHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:groupId/members" element={<Members />} />
        <Route path="/dues" element={<Dues />} />
        <Route path="/groups/:groupId/dues" element={<Dues />} />
        <Route path="/groups/:groupId/dues/:dueId" element={<DueDetails />} />
        <Route path="/groups/:groupId/members/:memberId/payments" element={<PaymentHistory />} />
        <Route path="/members" element={<Members />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
