const STORAGE_KEY = "sfs_groups";

function normalizeGroup(group) {
  const totalMembers = Number(group.totalMembers) || (Array.isArray(group.members) ? group.members.length : 0) || 1;
  const totalChitAmount = Number(group.totalChitAmount) || 0;
  const amountPerMember = Number(group.amountPerMember) || (totalChitAmount && totalMembers ? totalChitAmount / totalMembers : 0);
  const advanceAmount = Number(group.advanceAmount) || amountPerMember;
  const members = Array.isArray(group.members) ? group.members.map((member) => {
    const normalized = typeof member === "string" ? { id: crypto.randomUUID(), name: member, mobile: "", address: "" } : member;
    return { ...normalized, advanceAmount: Number(normalized.advanceAmount) || advanceAmount, advanceStatus: normalized.advanceStatus === "Paid" ? "Paid" : "Pending" };
  }) : [];
  const paidMembers = members.filter((member) => member.advanceStatus === "Paid").length;
  const dues = Array.isArray(group.dues) ? group.dues.map((due) => normalizeDue(due, members)) : [];
  return { ...group, members, dues, totalMembers, totalChitAmount, amountPerMember, advanceAmount, paidMembers, pendingMembers: Math.max(totalMembers - paidMembers, 0), totalAdvanceCollected: paidMembers * advanceAmount, totalAdvancePending: Math.max(totalMembers * advanceAmount - paidMembers * advanceAmount, 0), advanceCollectionCompleted: paidMembers === totalMembers && totalMembers > 0 };
}

function normalizeDue(due, members) {
  const memberPayments = members.map((member) => {
    const existing = due.memberPayments?.find((payment) => payment.memberId === member.id) || {};
    const payments = Array.isArray(existing.payments) ? existing.payments : [];
    const paidAmount = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
    const dueAmount = Number(existing.dueAmount) || Number(due.amountPerMember) || 0;
    return { memberId: member.id, dueAmount, paidAmount, pendingAmount: Math.max(dueAmount - paidAmount, 0), status: paidAmount >= dueAmount && dueAmount > 0 ? "Paid" : "Pending", payments };
  });
  return { ...due, memberPayments };
}

export function getGroups() { try { const groups = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(groups) ? groups.map(normalizeGroup) : []; } catch { return []; } }
export function saveGroups(groups) { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)); }
export function getGroup(identifier) { return getGroups().find((group) => group.id === identifier || group.name === decodeURIComponent(identifier)); }
export function createGroup({ name, totalMembers, totalChitAmount }) { const members = Number(totalMembers); const amount = Number(totalChitAmount); if (amount <= 0 || members <= 0 || amount % members !== 0) throw new Error("Total amount must be equally divisible among all members."); const groups = getGroups(); const amountPerMember = amount / members; const createdAt = new Date(); const group = normalizeGroup({ id: crypto.randomUUID(), name, totalMembers: members, totalChitAmount: amount, amountPerMember, advanceAmount: amountPerMember, members: [], createdAt: createdAt.toISOString(), createdDate: `${String(createdAt.getDate()).padStart(2, "0")}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${createdAt.getFullYear()}`, createdMonth: createdAt.getMonth() + 1, createdYear: createdAt.getFullYear() }); saveGroups([group, ...groups]); return group; }
export function addMember(groupId, member) { const groups = getGroups(); const group = groups.find((item) => item.id === groupId); if (!group) throw new Error("Group not found."); if (group.members.length >= group.totalMembers) throw new Error("Maximum member limit reached."); const newMember = { id: crypto.randomUUID(), ...member, advanceAmount: group.advanceAmount, advanceStatus: "Pending" }; group.members.push(newMember); group.dues.forEach((due) => { due.memberPayments.push({ memberId: newMember.id, dueAmount: due.amountPerMember, paidAmount: 0, pendingAmount: due.amountPerMember, status: "Pending", payments: [] }); }); saveGroups(groups); return normalizeGroup(group); }
export function updateGroup(groupId, values) { const groups = getGroups(); const group = groups.find((item) => item.id === groupId); if (!group) throw new Error("Group not found."); if (Number(values.totalMembers) < group.members.length) throw new Error("Member limit cannot be lower than the current member count."); const totalMembers = Number(values.totalMembers); const totalChitAmount = Number(values.totalChitAmount); if (totalChitAmount <= 0 || totalMembers <= 0 || totalChitAmount % totalMembers !== 0) throw new Error("Total amount must be equally divisible among all members."); const amountPerMember = totalChitAmount / totalMembers; Object.assign(group, { name: values.name, totalMembers, totalChitAmount, amountPerMember, advanceAmount: amountPerMember }); group.members = group.members.map((member) => ({ ...member, advanceAmount: amountPerMember })); saveGroups(groups); return normalizeGroup(group); }
export function deleteGroup(groupId) { saveGroups(getGroups().filter((group) => group.id !== groupId)); }
export function updateMember(groupId, memberId, values) { const groups = getGroups(); const group = groups.find((item) => item.id === groupId); const member = group?.members.find((item) => item.id === memberId); if (!member) throw new Error("Member not found."); Object.assign(member, values); saveGroups(groups); return normalizeGroup(group); }
export function deleteMember(groupId, memberId) { const groups = getGroups(); const group = groups.find((item) => item.id === groupId); if (!group) throw new Error("Group not found."); group.members = group.members.filter((member) => member.id !== memberId); saveGroups(groups); return normalizeGroup(group); }
export function createDue(groupId, { month, amountPerMember }) { const groups = getGroups(); const group = groups.find((item) => item.id === groupId); if (!group) throw new Error("Group not found."); if (group.dues.length >= group.totalMembers) throw new Error(`A group with ${group.totalMembers} members can have a maximum of ${group.totalMembers} dues.`); const [year, monthNumber] = month.split("-").map(Number); const amount = Number(amountPerMember); if (!year || !monthNumber || amount <= 0) throw new Error("Enter a valid due month and amount."); const due = { id: crypto.randomUUID(), dueNumber: group.dues.length + 1, month: monthNumber, year, amountPerMember: amount, createdDate: new Date().toISOString(), memberPayments: group.members.map((member) => ({ memberId: member.id, dueAmount: amount, paidAmount: 0, pendingAmount: amount, status: "Pending", payments: [] })) }; group.dues.push(due); saveGroups(groups); return normalizeGroup(group);
}
export function addDuePayment(groupId, dueId, memberId, amount) { const groups = getGroups(); const group = groups.find((item) => item.id === groupId); const due = group?.dues.find((item) => item.id === dueId); const memberPayment = due?.memberPayments.find((item) => item.memberId === memberId); if (!memberPayment) throw new Error("Due payment record not found."); const paymentAmount = Number(amount); if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) throw new Error("Payment amount must be greater than 0."); const pendingAmount = memberPayment.dueAmount - memberPayment.paidAmount; if (paymentAmount > pendingAmount) throw new Error(`Payment amount cannot exceed the pending amount of ₹${pendingAmount.toLocaleString("en-IN")}.`); memberPayment.payments.push({ id: crypto.randomUUID(), amount: paymentAmount, paymentDate: new Date().toISOString() }); saveGroups(groups); return normalizeGroup(group);
}
