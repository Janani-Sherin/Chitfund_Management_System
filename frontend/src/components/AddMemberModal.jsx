import { useState } from "react";

function AddMemberModal({ onClose, onSave, member }) {
  const [form, setForm] = useState({ name: member?.name || "", mobile: member?.mobile || "", address: member?.address || "" });
  const [error, setError] = useState("");
  const editing = Boolean(member);
  const update = (field, value) => { setForm({ ...form, [field]: value }); setError(""); };
  const submit = (event) => { event.preventDefault(); if (!form.name.trim() || !form.mobile || !form.address.trim()) return setError("All member fields are required."); if (!/^[6-9]\d{9}$/.test(form.mobile)) return setError("Enter a valid 10-digit Indian mobile number."); onSave({ name: form.name.trim(), mobile: form.mobile, address: form.address.trim() }); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="group-modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">GROUP MEMBER</p><h2 id="member-modal-title">{editing ? "Edit Member" : "Add Member"}</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button></div><form onSubmit={submit} noValidate>{error && <p className="form-message error" role="alert">{error}</p>}<label>Name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Member name" autoFocus /></label><label>Mobile Number<input type="tel" inputMode="numeric" maxLength="10" value={form.mobile} onChange={(event) => update("mobile", event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" /></label><label>Address<textarea value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Full address" rows="3" /></label><div className="modal-actions"><button className="text-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{editing ? "Save Changes" : "Add Member"}</button></div></form></section></div>;
}
export default AddMemberModal;
