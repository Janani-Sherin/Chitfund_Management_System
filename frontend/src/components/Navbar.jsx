import { getCurrentUser } from "../services/authService";

function Navbar({ title = "Dashboard" }) {
  const user = getCurrentUser();
  return <header className="topbar"><div><p className="eyebrow">OWNER PORTAL</p><h2>{title}</h2></div><div className="profile"><span className="profile-avatar">{user?.fullName?.charAt(0)?.toUpperCase() || "O"}</span><div><strong>{user?.fullName || "Owner"}</strong><small>Account owner</small></div></div></header>;
}

export default Navbar;
