import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../services/authService";

function Dashboard() {
  const user = getCurrentUser();
  return <div className="dashboard-shell"><Sidebar /><main className="dashboard-content"><Navbar /><section className="dashboard-body"><div className="welcome-card"><p className="eyebrow">OVERVIEW</p><h1>Welcome to SFS Chit Fund{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1><p>Your owner portal is ready. The dashboard will grow here as new modules are added.</p></div><section className="overview-grid"><article><span className="overview-icon">✓</span><h3>Account active</h3><p>Your secure owner account is set up and ready to use.</p></article><article><span className="overview-icon">◫</span><h3>Groups</h3><p>Group management will be available here soon.</p></article><article><span className="overview-icon">⌁</span><h3>More to come</h3><p>Future chit fund modules will appear in this workspace.</p></article></section></section></main></div>;
}
export default Dashboard;
