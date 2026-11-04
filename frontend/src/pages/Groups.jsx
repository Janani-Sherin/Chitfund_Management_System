import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "../components/CreateGroupModal";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { createGroup, deleteGroup, getGroups, updateGroup } from "../services/groupsService";
import "../styles/groups.css";
import "../styles/rows.css";

function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(getGroups);
  const [modalGroup, setModalGroup] = useState(undefined);
  const [advanceGroup, setAdvanceGroup] = useState(null);
  const refresh = () => setGroups(getGroups());
  const saveGroup = (values) => { try { const savedGroup = modalGroup?.id ? updateGroup(modalGroup.id, values) : createGroup(values); refresh(); setModalGroup(undefined); if (!modalGroup?.id) setAdvanceGroup(savedGroup); } catch (error) { window.alert(error.message); } };
  const removeGroup = (group) => { if (window.confirm(`Delete ${group.name} and all of its members?`)) { deleteGroup(group.id); refresh(); } };
  return <div className="dashboard-shell"><Sidebar /><main className="dashboard-content"><Navbar title="Groups" /><section className="dashboard-body"><div className="page-heading"><div><p className="eyebrow">GROUP MANAGEMENT</p><h1>Groups</h1><p>Create and view your chit fund groups in one place.</p></div><button className="primary-button create-group-button" type="button" onClick={() => setModalGroup({})}>+ Create Group</button></div>{groups.length === 0 ? <section className="empty-groups"><span>+</span><h2>No groups created yet.</h2><p>Use the Create Group button to add your first group and its members.</p></section> : <section className="data-list group-list"><div className="data-row data-header"><span>Group</span><span>Financial Details</span><span>Advance Collection</span><span>Created</span><span>Actions</span></div>{groups.map((group) => <article className="data-row" key={group.id}><button className="row-main group-row-main" type="button" onClick={() => navigate(`/groups/${encodeURIComponent(group.id)}/members`)}><strong>{group.name}</strong><span>Members: {group.totalMembers} | Total: {formatCurrency(group.totalChitAmount)}</span><span>Per member: {formatCurrency(group.amountPerMember)}<br />Advance: {group.paidMembers}/{group.totalMembers} Paid<br /><em className={group.advanceCollectionCompleted ? "status-complete" : "status-pending"}>{group.advanceCollectionCompleted ? "Advance Collection Completed" : "Advance Collection Pending"}</em>{group.advanceCollectionCompleted && <><br />First Due: {formatCurrency(4000)}/member</>}</span><span>{group.createdDate || new Date(group.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></button><div className="row-actions"><button className="action-button" type="button" onClick={() => setModalGroup(group)}>Edit</button><button className="action-button danger" type="button" onClick={() => removeGroup(group)}>Delete</button></div></article>)}</section>}</section></main>{modalGroup !== undefined && <CreateGroupModal group={modalGroup.id ? modalGroup : null} onClose={() => setModalGroup(undefined)} onSave={saveGroup} />}{advanceGroup && <AdvanceModal group={advanceGroup} onClose={() => setAdvanceGroup(null)} />}</div>;
}
function AdvanceModal({ group, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="group-modal advance-modal" role="dialog" aria-modal="true" aria-labelledby="advance-modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">GROUP CREATED</p><h2 id="advance-modal-title">Advance Amount</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button></div><p>Group: <strong>{group.name}</strong></p><p>Total Members: <strong>{group.totalMembers}</strong></p><p>Advance Amount Per Member: <strong>{formatCurrency(group.advanceAmount)}</strong></p><div className="calculation-summary"><strong>Each member must pay an advance amount of {formatCurrency(group.advanceAmount)}.</strong><span>Total Advance Collection</span><strong>{formatCurrency(group.advanceAmount)} x {group.totalMembers} = {formatCurrency(group.totalAdvanceCollected + group.totalAdvancePending)}</strong></div><p className="form-message">Members remain Pending until you collect each advance from the Members page.</p><div className="modal-actions"><button className="primary-button" type="button" onClick={onClose}>Continue</button></div></section></div>;
}
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
export default Groups;
