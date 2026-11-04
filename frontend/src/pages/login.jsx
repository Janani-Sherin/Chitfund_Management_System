import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginOwner, saveSession } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobileNumber: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) return setMessage("Enter a valid 10-digit Indian mobile number.");
    if (!form.password) return setMessage("Password is required.");
    try {
      setLoading(true);
      const { data } = await loginOwner(form);
      saveSession(data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not reach the server. Please try again.");
    } finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-intro"><p className="eyebrow">SFS CHIT FUND</p><h1>Manage with clarity.<br />Grow with confidence.</h1><p>One secure workspace for your chit fund operations.</p></section><section className="auth-panel"><form className="auth-card" onSubmit={submit} noValidate><div className="auth-branding"><img src="/sfs-logo.png.png" alt="SFS Chit Fund" /><div><p className="eyebrow">WELCOME BACK</p><h2>Owner Login</h2></div></div><p className="form-subtitle">Sign in to access your dashboard.</p>{message && <p className="form-message error" role="alert">{message}</p>}<label>Mobile Number<input type="tel" inputMode="numeric" maxLength="10" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value.replace(/\D/g, "") })} placeholder="10-digit mobile number" /></label><label>Password<span className="password-field"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></span></label><button className="primary-button" disabled={loading}>{loading ? "Signing in..." : "Login"}</button><p className="auth-switch">New to SFS Chit Fund? <Link to="/register">Create an account</Link></p></form></section></main>;
}

export default Login;
