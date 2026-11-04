import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../services/authService";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = () => { clearSession(); navigate("/", { replace: true }); };
  const membersActive = location.pathname === "/members" || /\/groups\/[^/]+\/members/.test(location.pathname);
  const duesActive = location.pathname === "/dues" || /\/groups\/[^/]+\/dues/.test(location.pathname);
  return <aside className="sidebar"><NavLink className="brand" to="/dashboard"><img className="brand-logo" src="/sfs-logo.png.png" alt="SFS Chit Fund" /><span>SFS<br /><small>CHIT FUND</small></span></NavLink><nav className="sidebar-nav" aria-label="Main navigation"><NavLink to="/dashboard" end className="nav-item"><span>D</span> Dashboard</NavLink><NavLink to="/groups" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}><span>G</span> Groups</NavLink><NavLink to="/members" className={`nav-item${membersActive ? " active" : ""}`}><span>M</span> Members</NavLink><NavLink to="/dues" className={`nav-item${duesActive ? " active" : ""}`}><span>₹</span> Dues</NavLink></nav><button className="logout-button" type="button" onClick={logout}><span>L</span> Logout</button></aside>;
}
export default Sidebar;
