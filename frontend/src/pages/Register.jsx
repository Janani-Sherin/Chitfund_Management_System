import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerOwner } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", mobileNumber: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const update = (field, value) => setForm({ ...form, [field]: value });
  const submit = async (event) => {
    event.preventDefault(); setMessage(""); setSuccess("");
    if (!form.fullName.trim() || !form.mobileNumber || !form.email || !form.password) return setMessage("All fields are required.");
    if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) return setMessage("Enter a valid 10-digit Indian mobile number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setMessage("Enter a valid email address.");
    if (form.password.length < 6) return setMessage("Password must contain at least 6 characters.");
    try { setLoading(true); const { data } = await registerOwner(form); setSuccess(data.message); setTimeout(() => navigate("/"), 900); }
    catch (error) { setMessage(error.response?.data?.message || "Could not reach the server. Please try again."); }
    finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-intro"><p className="eyebrow">SFS CHIT FUND</p><h1>Your fund, organised<br />from day one.</h1><p>Create your owner account to start using the secure SFS portal.</p></section><section className="auth-panel"><form className="auth-card register-card" onSubmit={submit} noValidate><div className="auth-branding"><img src="/sfs-logo.png.png" alt="SFS Chit Fund" /><div><p className="eyebrow">GET STARTED</p><h2>Create owner account</h2></div></div><p className="form-subtitle">Set up your secure account in a few moments.</p>{message && <p className="form-message error" role="alert">{message}</p>}{success && <p className="form-message success">{success}</p>}<label>Full Name<input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" /></label><label>Mobile Number<input type="tel" inputMode="numeric" maxLength="10" value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" /></label><label>Email ID<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" /></label><label>Password<span className="password-field"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Minimum 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></span></label><button className="primary-button" disabled={loading}>{loading ? "Creating account..." : "Register"}</button><p className="auth-switch">Already registered? <Link to="/">Log in</Link></p></form></section></main>;
}
export default Register;
