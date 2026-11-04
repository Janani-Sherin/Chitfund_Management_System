import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addDuePayment, getGroups } from "../services/groupsService";
import "../styles/groups.css";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const monthLabel = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const dateLabel = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

function PaymentHistory() {
  const navigate = useNavigate();
  const { groupId, memberId } = useParams();
  const [groups, setGroups] = useState(getGroups);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const group = groups.find((item) => item.id === groupId);
  const member = group?.members.find((item) => item.id === memberId);
  if (!group || !member) return <Shell><section className="empty-groups"><h2>Member not found.</h2></section></Shell>;
  const savePayment = (event) => { event.preventDefault(); try { const updated = addDuePayment(group.id, paymentTarget.due.id, member.id, amount); setGroups(groups.map((item) => item.id === updated.id ? updated : item)); setPaymentTarget(null); setAmount(""); setMessage(""); } catch (error) { setMessage(error.message); } };
  return <Shell><button className="text-button back-button" type="button" onClick={() => navigate(`/groups/${group.id}/members`)}>Back to Members</button><div className="page-heading"><div><p className="eyebrow">PAYMENT HISTORY</p><h1>{member.name}</h1><p>Member {String(group.members.findIndex((item) => item.id === member.id) + 1).padStart(2, "0")} | {group.name} | {member.mobile || "Mobile not recorded"}</p></div></div>{message && <p className="form-message error">{message}</p>}{group.dues.length === 0 ? <section className="empty-groups"><h2>No dues created yet.</h2><p>Payment history will appear here after a monthly due is created.</p></section> : <section className="history-list">{group.dues.map((due) => { const payment = due.memberPayments.find((item) => item.memberId === member.id); return <article className="history-card" key={due.id}><div className="due-card-top"><strong>Due {due.dueNumber}</strong><span>{monthLabel(due.month, due.year)}</span></div><div className="history-summary"><span>Due Amount <strong>{formatCurrency(payment.dueAmount)}</strong></span><span>Paid <strong>{formatCurrency(payment.paidAmount)}</strong></span><span>Pending <strong>{formatCurrency(payment.pendingAmount)}</strong></span><span className={payment.status === "Paid" ? "status-complete" : "status-pending"}>{payment.paidAmount > 0 && payment.pendingAmount > 0 ? "Partially Paid" : payment.status}</span></div>{payment.status !== "Paid" && <button className="action-button" type="button" onClick={() => { setPaymentTarget({ due, payment }); setAmount(""); setMessage(""); }}>+ Add Payment</button>}<h3>Payment History</h3>{payment.payments.length === 0 ? <p>No payments recorded.</p> : <ul>{payment.payments.map((transaction, index) => <li key={transaction.id}><strong>Payment {index + 1}: {formatCurrency(transaction.amount)}</strong><span>{dateLabel(transaction.paymentDate)}</span></li>)}</ul>}</article>; })}</section>}{paymentTarget && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPaymentTarget(null)}><section className="group-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">PAYMENT ENTRY</p><h2>Add Payment</h2></div><button className="modal-close" type="button" onClick={() => setPaymentTarget(null)} aria-label="Close">x</button></div><p>Member: <strong>{member.name}</strong></p><p>Due: <strong>Due {paymentTarget.due.dueNumber}</strong></p><p>Due Amount: <strong>{formatCurrency(paymentTarget.payment.dueAmount)}</strong></p><p>Already Paid: <strong>{formatCurrency(paymentTarget.payment.paidAmount)}</strong></p><p>Pending: <strong>{formatCurrency(paymentTarget.payment.pendingAmount)}</strong></p><form onSubmit={savePayment}><label>Payment Amount<input type="number" min="1" max={paymentTarget.payment.pendingAmount} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} autoFocus required /></label>{message && <p className="form-message error">{message}</p>}<div className="modal-actions"><button className="text-button" type="button" onClick={() => setPaymentTarget(null)}>Cancel</button><button className="primary-button" type="submit">Add Payment</button></div></form></section></div>}</Shell>;
}
function Shell({ children }) { return <div className="dashboard-shell"><Sidebar /><main className="dashboard-content"><Navbar title="Payment History" /><section className="dashboard-body">{children}</section></main></div>; }
export default PaymentHistory;
