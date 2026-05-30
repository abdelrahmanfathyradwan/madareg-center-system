const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://madareg-center-system.vercel.app/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  getGroups: () => fetch(`${BASE_URL}/groups`).then(handleResponse),
  getTodayGroups: () => fetch(`${BASE_URL}/groups/today/active`).then(handleResponse),
  getGroup: (id) => fetch(`${BASE_URL}/groups/${id}`).then(handleResponse),
  
  startAttendance: (groupId) => fetch(`${BASE_URL}/attendance/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId })
  }).then(handleResponse),
  
  updateAttendance: (id, status) => fetch(`${BASE_URL}/attendance/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(handleResponse),
  
  initPayments: (groupId, month) => fetch(`${BASE_URL}/payments/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, month })
  }).then(handleResponse),
  
  updatePayment: (id, status) => fetch(`${BASE_URL}/payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(handleResponse),
  
  getDashboardSummary: () => fetch(`${BASE_URL}/dashboard`).then(handleResponse),

  // Students Page & Details
  getStudents: () => fetch(`${BASE_URL}/students`).then(handleResponse),
  getStudent: (id) => fetch(`${BASE_URL}/students/${id}`).then(handleResponse),
  updateStudent: (id, data) => fetch(`${BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  
  // Teacher Notes
  addStudentNote: (id, text, tag) => fetch(`${BASE_URL}/students/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tag })
  }).then(handleResponse),
  deleteStudentNote: (id, noteId) => fetch(`${BASE_URL}/students/${id}/notes/${noteId}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Group Monthly overview
  getGroupMonthlyRecord: (id, month) => fetch(`${BASE_URL}/groups/${id}/monthly?month=${month || ''}`).then(handleResponse),
};

