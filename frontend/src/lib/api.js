const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  getGroups: () => fetch(`${BASE_URL}/groups`).then(res => res.json()),
  getTodayGroups: () => fetch(`${BASE_URL}/groups/today/active`).then(res => res.json()),
  getGroup: (id) => fetch(`${BASE_URL}/groups/${id}`).then(res => res.json()),
  
  startAttendance: (groupId) => fetch(`${BASE_URL}/attendance/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId })
  }).then(res => res.json()),
  
  updateAttendance: (id, status) => fetch(`${BASE_URL}/attendance/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(res => res.json()),
  
  initPayments: (groupId, month) => fetch(`${BASE_URL}/payments/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, month })
  }).then(res => res.json()),
  
  updatePayment: (id, status) => fetch(`${BASE_URL}/payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(res => res.json()),
  
  getDashboardSummary: () => fetch(`${BASE_URL}/dashboard`).then(res => res.json()),
};
