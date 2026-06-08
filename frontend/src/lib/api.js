const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://madareg-center-system.vercel.app/api";
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('madarej_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (res) => {
  if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  login: (password) => fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  }).then(handleResponse),

  getGroups: () => fetch(`${BASE_URL}/groups`, { headers: getHeaders() }).then(handleResponse),
  getTodayGroups: () => fetch(`${BASE_URL}/groups/today/active`, { headers: getHeaders() }).then(handleResponse),
  getGroup: (id) => fetch(`${BASE_URL}/groups/${id}`, { headers: getHeaders() }).then(handleResponse),
  deleteGroup: (id) => fetch(`${BASE_URL}/groups/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  createGroup: (data) => fetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  
  startAttendance: (groupId) => fetch(`${BASE_URL}/attendance/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ groupId })
  }).then(handleResponse),
  
  updateAttendance: (id, status, isContacted) => fetch(`${BASE_URL}/attendance/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, isContacted })
  }).then(handleResponse),

  getTodayAbsent: (date) => fetch(`${BASE_URL}/attendance/today/absent${date ? `?date=${date}` : ''}`, { headers: getHeaders() }).then(handleResponse),
  
  initPayments: (groupId, month) => fetch(`${BASE_URL}/payments/init`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ groupId, month })
  }).then(handleResponse),
  
  updatePayment: (id, status) => fetch(`${BASE_URL}/payments/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  }).then(handleResponse),
  
  getDashboardSummary: () => fetch(`${BASE_URL}/dashboard`, { headers: getHeaders() }).then(handleResponse),

  // Students Page & Details
  getStudents: () => fetch(`${BASE_URL}/students`, { headers: getHeaders() }).then(handleResponse),
  getStudent: (id) => fetch(`${BASE_URL}/students/${id}`, { headers: getHeaders() }).then(handleResponse),
  deleteStudent: (id) => fetch(`${BASE_URL}/students/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  updateStudent: (id, data) => fetch(`${BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  createStudent: (data) => fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  
  // Teacher Notes
  addStudentNote: (id, text, tag) => fetch(`${BASE_URL}/students/${id}/notes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text, tag })
  }).then(handleResponse),
  deleteStudentNote: (id, noteId) => fetch(`${BASE_URL}/students/${id}/notes/${noteId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  // Group Monthly overview
  getGroupMonthlyRecord: (id, month) => fetch(`${BASE_URL}/groups/${id}/monthly?month=${month || ''}`, { headers: getHeaders() }).then(handleResponse),

  // Tasks
  getTasks: (date) => fetch(`${BASE_URL}/tasks${date ? `?date=${date}` : ''}`, { headers: getHeaders() }).then(handleResponse),
  createTask: (title, date) => fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, date })
  }).then(handleResponse),
  toggleTask: (id, completed) => fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ completed })
  }).then(handleResponse),
  deleteTask: (id) => fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),
};
