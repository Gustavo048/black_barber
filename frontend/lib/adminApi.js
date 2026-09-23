/**
 * Cliente de API do painel administrativo. Separado de lib/api.js porque
 * estas chamadas exigem o token JWT (Authorization: Bearer ...) e tratam
 * expiracao de sessao — o cliente publico (lib/api.js) nao precisa de nada disso.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'blackline_admin_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function rawRequest(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro ao comunicar com o servidor.');
  return data;
}

/** Chamada autenticada. Lanca "SESSION_EXPIRED" em 401 para a tela tratar (limpar token e redirecionar). */
async function adminRequest(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('SESSION_EXPIRED');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    throw new Error('SESSION_EXPIRED');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro ao comunicar com o servidor.');
  return data;
}

export function login(username, password) {
  return rawRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function fetchAdminBookings(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return adminRequest(`/bookings${query ? `?${query}` : ''}`);
}

export function updateBookingStatus(id, status) {
  return adminRequest(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function fetchReportSummary(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return adminRequest(`/reports/summary${query ? `?${query}` : ''}`);
}
