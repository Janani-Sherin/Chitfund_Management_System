import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addDuePayment, getGroups } from "../services/groupsService";
import "../styles/groups.css";
import "../styles/rows.css";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const monthLabel = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

function DueDetails() {
  const navigate = useNavigate();
  const { groupId, dueId } = useParams();
  const [groups, setGroups] = useState(getGroups);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const group = groups.find((item) => item.id === groupId);
  const due = group?.dues.find((item) => item.id === dueId);
  if (!group || !due) return <Shell><section className="empty-groups"><h2>Due not found.</h2></section></Shell>;
  const savePayment = (event) => { event.preventDefault(); try { const updated = addDuePayment(group.id, due.id, paymentTarget.memberId, amount); setGroups(groups.map((item) => item.id === updated.id ? updated : item)); setPaymentTarget(null); setAmount(""); setMessage(""); } catch (error) { setMessage(error.message); } };
  const totalCollected = due.memberPayments.reduce((total, payment) => total + payment.paidAmount, 0);
  return <Shell><button className="text-button back-button" type="button" onClick={() => navigate(`/groups/${group.id}/dues`)}>Back to Dues</button><div className="page-heading"><div><p className="eyebrow">{group.name} / MONTHLY DUE</p><h1>Due {due.dueNumber}</h1><p>{monthLabel(due.month, due.year)} | {formatCurrency(due.amountPerMember)} per member</p></div></div><section className="financial-summary"><span>Total Expected: <strong>{formatCurrency(due.amountPerMember * group.totalMembers)}</strong></span><span>Total Collected: <strong>{formatCurrency(totalCollected)}</strong></span><span>Total Pending: <strong>{formatCurrency(due.amountPerMember * group.totalMembers - totalCollected)}</strong></span></section>{message && <p className="form-message error">{message}</p>}<section className="data-list due-member-list"><div className="data-row data-header"><span>Member No.</span><span>Member Name</span><span>Mobile</span><span>Due Amount</span><span>Paid</span><span>Pending</span><span>Status</span><span>Actions</span></div>{group.members.map((member, index) => { const payment = due.memberPayments.find((item) => item.memberId === member.id); const partial = payment.paidAmount > 0 && payment.pendingAmount > 0; return <article className="data-row" key={member.id}><span>Member {String(index + 1).padStart(2, "0")}</span><strong>{member.name}</strong><span>{member.mobile || "Not recorded"}</span><span>{formatCurrency(payment.dueAmount)}</span><span>{formatCurrency(payment.paidAmount)}</span><span>{formatCurrency(payment.pendingAmount)}</span><span className={payment.status === "Paid" ? "status-complete" : "status-pending"}>{partial ? "Partially Paid" : payment.status}</span><div className="row-actions"><button className="action-button" type="button" disabled={payment.status === "Paid"} onClick={() => { setPaymentTarget({ member, payment }); setAmount(""); setMessage(""); }}>{payment.status === "Paid" ? "Paid" : "+ Add Payment"}</button><button className="action-button" type="button" onClick={() => navigate(`/groups/${group.id}/members/${member.id}/payments`)}>View Payments</button></div></article>; })}</section>{paymentTarget && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPaymentTarget(null)}><section className="group-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">PAYMENT ENTRY</p><h2>Add Payment</h2></div><button className="modal-close" type="button" onClick={() => setPaymentTarget(null)} aria-label="Close">x</button></div><p>Member: <strong>{paymentTarget.member.name}</strong></p><p>Due: <strong>Due {due.dueNumber}</strong> ({monthLabel(due.month, due.year)})</p><p>Due Amount: <strong>{formatCurrency(paymentTarget.payment.dueAmount)}</strong></p><p>Already Paid: <strong>{formatCurrency(paymentTarget.payment.paidAmount)}</strong></p><p>Pending: <strong>{formatCurrency(paymentTarget.payment.pendingAmount)}</strong></p><form onSubmit={savePayment}><label>Payment Amount<input type="number" min="1" max={paymentTarget.payment.pendingAmount} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} autoFocus required /></label>{message && <p className="form-message error">{message}</p>}<div className="modal-actions"><button className="text-button" type="button" onClick={() => setPaymentTarget(null)}>Cancel</button><button className="primary-button" type="submit">Add Payment</button></div></form></section></div>}</Shell>;
}
function Shell({ children }) { return <div className="dashboard-shell"><Sidebar /><main className="dashboard-content"><Navbar title="Due Details" /><section className="dashboard-body">{children}</section></main></div>; }
export default DueDetails;
