const { BUSINESS_HOURS, SLOT_INTERVAL_MINUTES, MIN_BOOKING_NOTICE_MINUTES } = require('../config/businessHours');
const { BARBERS } = require('../config/barbers');
const { findServiceById } = require('../config/services');
const bookingRepository = require('../repositories/bookingRepository');
const { toMinutes, toHHMM, getWeekday, todayISO } = require('../utils/time');

function getBusinessHoursFor(date) {
  return BUSINESS_HOURS[getWeekday(date)] || null;
}

function isWithinBusinessHours(date, startMinutes, endMinutes) {
  const hours = getBusinessHoursFor(date);
  if (!hours) return false;
  return startMinutes >= toMinutes(hours.open) && endMinutes <= toMinutes(hours.close);
}

/** Janela [inicio, fim) em minutos ocupada por um agendamento, pela duracao gravada nele. */
function getBookingWindow(booking) {
  const durationMinutes = booking.durationMinutes ?? findServiceById(booking.serviceId)?.durationMinutes ?? 30;
  const start = toMinutes(booking.time);
  return { start, end: start + durationMinutes };
}

/**
 * Pura (sem I/O): dado o conjunto de agendamentos do dia ja buscado, diz se
 * um barbeiro esta livre no intervalo pedido.
 */
function isBarberFreeAmong(dayBookings, barberId, startMinutes, endMinutes) {
  return dayBookings
    .filter((booking) => booking.barberId === barberId)
    .every((existing) => {
      const { start, end } = getBookingWindow(existing);
      return endMinutes <= start || startMinutes >= end; // sem sobreposicao
    });
}

/** Pura: escolhe um barbeiro livre entre os candidatos, dado o conjunto de agendamentos do dia. */
function pickAvailableBarber(dayBookings, candidates, startMinutes, endMinutes) {
  return candidates.find((barber) => isBarberFreeAmong(dayBookings, barber.id, startMinutes, endMinutes)) || null;
}

/**
 * Escolhe um barbeiro disponivel para o intervalo pedido, buscando os
 * agendamentos do dia com UMA UNICA consulta ao banco (nao uma por
 * candidato) e fazendo a matematica de sobreposicao em memoria.
 */
async function findAvailableBarber({ date, startMinutes, endMinutes, preferredBarberId }) {
  const dayBookings = await bookingRepository.findByDate(date);
  const candidates = preferredBarberId ? BARBERS.filter((b) => b.id === preferredBarberId) : BARBERS;
  return pickAvailableBarber(dayBookings, candidates, startMinutes, endMinutes);
}

/**
 * Gera os horarios do dia dentro do expediente (descontando a duracao do
 * servico e o aviso minimo para hoje) e, para cada um, quais barbeiros estao
 * livres — tambem com uma unica consulta para o dia inteiro.
 */
async function getAvailability({ date, serviceId, barberId }) {
  const service = findServiceById(serviceId);
  if (!service) return { open: false, slots: [] };

  const hours = getBusinessHoursFor(date);
  if (!hours) return { open: false, slots: [] };

  const dayBookings = await bookingRepository.findByDate(date);

  const openMinutes = toMinutes(hours.open);
  const closeMinutes = toMinutes(hours.close);

  const isToday = date === todayISO();
  const now = new Date();
  const earliestMinutesToday = now.getHours() * 60 + now.getMinutes() + MIN_BOOKING_NOTICE_MINUTES;

  const candidateBarbers = barberId ? BARBERS.filter((b) => b.id === barberId) : BARBERS;
  const slots = [];

  for (let start = openMinutes; start + service.durationMinutes <= closeMinutes; start += SLOT_INTERVAL_MINUTES) {
    if (isToday && start < earliestMinutesToday) continue;

    const end = start + service.durationMinutes;
    const availableBarbers = candidateBarbers
      .filter((barber) => isBarberFreeAmong(dayBookings, barber.id, start, end))
      .map((barber) => ({ id: barber.id, name: barber.name }));

    if (availableBarbers.length > 0) {
      slots.push({ time: toHHMM(start), availableBarbers });
    }
  }

  return { open: true, slots };
}

module.exports = {
  isWithinBusinessHours,
  findAvailableBarber,
  getAvailability,
  getBookingWindow,
};
