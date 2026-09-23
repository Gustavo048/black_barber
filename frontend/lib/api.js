/**
 * Cliente de API centralizado. Toda chamada ao backend passa por aqui,
 * evitando strings de URL espalhadas pelos componentes e concentrando o
 * tratamento de erro em um unico lugar.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Nao foi possivel completar a solicitacao.');
  }

  return data;
}

export function createBooking(payload) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Busca os horarios livres para uma data + servico (e, opcionalmente, um barbeiro especifico). */
export function fetchAvailability({ date, serviceId, barberId }) {
  const params = new URLSearchParams({ date, serviceId });
  if (barberId) params.set('barberId', barberId);
  return request(`/availability?${params.toString()}`);
}

export function fetchServices() {
  return request('/services');
}

export function fetchBarbers() {
  return request('/barbers');
}
