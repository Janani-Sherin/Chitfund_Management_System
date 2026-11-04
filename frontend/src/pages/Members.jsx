import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddMemberModal from "../components/AddMemberModal";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addMember, deleteMember, getGroups, updateMember } from "../services/groupsService";
import "../styles/groups.css";
import "../styles/rows.css";
import "../styles/all-members.css";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function MemberRows({ entries, onEdit, onDelete, onHistory, showGroup = false }) {
  return <section className="data-list member-list-row"><div className="data-row data-header"><span>Member No.</span><span>Name</span><span>Mobile</span><span>Address</span>{showGroup && <span>Group</span>}<span>Actions</span></div>{entries.map(({ member, group, index }) => { const due = group.dues[group.dues.length - 1]; const payment = due?.memberPayments.find((item) => item.memberId === member.id); const partial = payment && payment.paidAmount > 0 && payment.pendingAmount > 0; return <article className={`data-row ${showGroup ? "all-members-row" : ""}`} key={member.id}><span>Member {String(index + 1).padStart(2, "0")}</span><strong>{member.name}</strong><span>{member.mobile || "Not recorded"}</span><span className="address-cell">{member.address || "Not recorded"}</span>{showGroup && <span className="group-label">{group.name}</span>}<div className="member-actions"><div className="current-due">{payment ? <><span>Current Due: {formatCurrency(payment.dueAmount)}</span><span>Paid: {formatCurrency(payment.paidAmount)} | Pending: {formatCurrency(payment.pendingAmount)}</span><em className={payment.status === "Paid" ? "status-complete" : "status-pending"}>{partial ? "Partially Paid" : payment.status}</em></> : <span>No dues created</span>}</div><div className="row-actions"><button className="action-button" type="button" onClick={() => onHistory(group, member)}>View Payment History</button><button className="action-button" type="button" onClick={() => onEdit(group, member)}>Edit</button><button className="action-button danger" type="button" onClick={() => onDelete(group, member)}>Delete</button></div></div></article>; })}</section>;
}

function Members() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState(getGroups);
  const [modalState, setModalState] = useState(undefined);
  const [message, setMessage] = useState("");
  const group = groupId ? groups.find((item) => item.id === groupId || item.name === decodeURIComponent(groupId)) : null;
  const visibleEntries = group ? group.members.map((member, index) => ({ member, group, index })) : groups.flatMap((item) => item.members.map((member, index) => ({ member, group: item, index })));
  const atLimit = group && group.members.length >= group.totalMembers;
  const saveMember = (values) => { try { const next = modalState.member?.id ? updateMember(modalState.group.id, modalState.member.id, values) : addMember(modalState.group.id, values); setGroups(group ? groups.map((item) => item.id === next.id ? next : item) : getGroups()); setModalState(undefined); setMessage(""); } catch (error) { setMessage(error.message); } };
  const removeMember = (memberGroup, member) => { if (window.confirm(`Delete ${member.name}?`)) { const next = deleteMember(memberGroup.id, member.id); setGroups(group ? groups.map((item) => item.id === next.id ? next : item) : getGroups()); } };
  const viewHistory = (memberGroup, member) => navigate(`/groups/${encodeURIComponent(memberGroup.id)}/members/${encodeURIComponent(member.id)}/payments`);
  if (groupId && !group) return <Shell><section className="empty-groups"><h2>Group not found.</h2></section></Shell>;
  const pageTitle = group ? group.name : "All Members";
  const pageDescription = group ? `${group.members.length}/${group.totalMembers} members added` : `${visibleEntries.length} member${visibleEntries.length === 1 ? "" : "s"} across all groups`;
  return <Shell><div className="page-heading"><div><p className="eyebrow">{group ? "GROUP MEMBERS" : "MEMBER DIRECTORY"}</p><h1>{pageTitle}</h1><p>{pageDescription}</p></div>{group && <button className="primary-button create-group-button" type="button" disabled={atLimit} onClick={() => setModalState({ group, member: {} })}>{atLimit ? "Member limit reached" : "+ Add Member"}</button>}</div>{message && <p className="form-message error">{message}</p>}{atLimit && <p className="limit-message">Maximum member limit reached.</p>}{visibleEntries.length === 0 ? <section className="empty-groups"><span>M</span><h2>No members added yet.</h2><p>{group ? `Add the first member to ${group.name}.` : "Create a group and add members to see them here."}</p></section> : <MemberRows entries={visibleEntries} showGroup={!group} onEdit={(memberGroup, member) => setModalState({ group: memberGroup, member })} onDelete={removeMember} onHistory={viewHistory} />}{modalState && <AddMemberModal member={modalState.member?.id ? modalState.member : null} onClose={() => setModalState(undefined)} onSave={saveMember} />}</Shell>;
}
function Shell({ children }) { return <div className="dashboard-shell"><Sidebar /><main className="dashboard-content"><Navbar title="Members" /><section className="dashboard-body">{children}</section></main></div>; }
export default Members;
