const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flexi_access_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return { start: s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), end: e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), days };
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: '#d97706', confirmed: '#2563eb', active: '#16a34a',
    completed: '#64748b', cancelled: '#e94560', verified: '#16a34a',
    rejected: '#e94560', not_submitted: '#64748b',
  };
  return map[status] || '#64748b';
}

export function getStatusBg(status: string) {
  const map: Record<string, string> = {
    pending: '#fffbeb', confirmed: '#eff6ff', active: '#f0fdf4',
    completed: '#f8fafc', cancelled: '#fff1f2', verified: '#f0fdf4',
    rejected: '#fff1f2', not_submitted: '#f8fafc',
  };
  return map[status] || '#f8fafc';
}
