/**
 * Expediente da barbearia por dia da semana (0 = domingo ... 6 = sabado).
 * `null` significa fechado no dia. Mantido consistente com o texto exibido
 * no rodape do frontend (components/Footer.jsx) — se um mudar, o outro deve
 * ser atualizado junto, ja que sao dois apps sem modulo compartilhado.
 */
const BUSINESS_HOURS = {
  0: null, // domingo: fechado
  1: { open: '09:00', close: '20:00' },
  2: { open: '09:00', close: '20:00' },
  3: { open: '09:00', close: '20:00' },
  4: { open: '09:00', close: '20:00' },
  5: { open: '09:00', close: '20:00' },
  6: { open: '09:00', close: '18:00' }, // sabado
};

// Intervalo entre horarios oferecidos ao cliente (ex.: 09:00, 09:30, 10:00...).
const SLOT_INTERVAL_MINUTES = 30;

// Antecedencia minima para agendar no mesmo dia (evita marcar "para daqui a 2 minutos").
const MIN_BOOKING_NOTICE_MINUTES = 30;

module.exports = { BUSINESS_HOURS, SLOT_INTERVAL_MINUTES, MIN_BOOKING_NOTICE_MINUTES };
