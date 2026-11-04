import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createDue, getGroups } from "../services/groupsService";
import "../styles/groups.css";
import "../styles/rows.css";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const monthLabel = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

function Dues() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [groups, setGroups] = useState(getGroups);
  const [selectedId, setSelectedId] = useState(groupId || groups[0]?.id || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const group = groups.find((item) => item.id === selectedId) || groups[0];
  const submit = (event) => {
    event.preventDefault();
    try {
      const updated = createDue(group.id, { month, amountPerMember: amount });
      setGroups(groups.map((item) => item.id === updated.id ? updated : item));
      setModalOpen(false);
      setMonth("");
      setAmount("");
      setMessage("");
    } catch (error) { setMessage(error.message); }
  };
  if (!group) return <Shell><section className="empty-groups"><h2>Create a group first.</h2><p>Dues are assigned to the members of a selected group.</p></section></Shell>;
  return <Shell><div className="page-heading"><div><p className="eyebrow">MONTHLY COLLECTIONS</p><h1>Dues</h1><p>Manage each group's monthly due schedule and collections.</p></div><button className="primary-button create-group-button" type="button" disabled={group.dues.length >= group.totalMembers} onClick={() => { setMessage(""); setModalOpen(true); }}>+ Create Due</button></div><section className="financial-summary"><label>Selected Group<select value={group.id} onChange={(event) => setSelectedId(event.target.value)}>{groups.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span>Total Members: <strong>{group.totalMembers}</strong></span><span>Dues Created: <strong>{group.dues.length} / {group.totalMembers}</strong></span></section>{message && <p className="form-message error">{message}</p>}{group.dues.length === 0 ? <section className="empty-groups"><h2>No dues created for {group.name}.</h2><p>Create the first due to assign it automatically to every member.</p></section> : <section className="dues-grid">{group.dues.map((due) => { const expected = due.amountPerMember * group.totalMembers; const collected = due.memberPayments.reduce((total, payment) => total + payment.paidAmount, 0); const pending = expected - collected; return <article className="due-card" key={due.id}><div className="due-card-top"><span>Due {due.dueNumber}</span><span>{monthLabel(due.month, due.year)}</span></div><h2>{formatCurrency(due.amountPerMember)} <small>per member</small></h2><p>Total Expected: <strong>{formatCurrency(expected)}</strong></p><p>Total Collected: <strong>{formatCurrency(collected)}</strong></p><p>Total Pending: <strong>{formatCurrency(pending)}</strong></p><p className={pending === 0 ? "status-complete" : "status-pending"}>{pending === 0 ? "Paid" : "In Progress"}</p><button className="action-button" type="button" onClick={() => navigate(`/groups/${group.id}/dues/${due.id}`)}>View Due</button></article>; })}</section>}{modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setModalOpen(false)}><section className="group-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">{group.name}</p><h2>Create Due</h2></div><button className="modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close">x</button></div><form onSubmit={submit} noValidate><p className="calculation-summary"><span>Due Number: <strong>Due {group.dues.length + 1}</strong></span><span>Group: <strong>{group.name}</strong></span></p><label>Due Month<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} required /></label><label>Due Amount Per Member<input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="For example, 5000" required /></label>{message && <p className="form-message error">{message}</p>}<div className="modal-actions"><button className="text-button" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit">Create Due</button></div></form></section></div>}</Shell>;
}
function Shell({ children }) { return <div className="dashboard-shell"><Sidebar /><main className="dashboard-content"><Navbar title="Dues" /><section className="dashboard-body">{children}</section></main></div>; }
export default Dues;
