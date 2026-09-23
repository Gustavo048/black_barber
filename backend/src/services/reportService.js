const bookingRepository = require('../repositories/bookingRepository');

/**
 * Agrega os agendamentos em um resumo financeiro/operacional para o painel
 * administrativo. Faturamento so conta agendamentos marcados como
 * "atendido" — um "pendente" ainda pode nao acontecer, e "cancelado"/
 * "no-show" nao geraram receita. Os valores usados sao os gravados no
 * proprio agendamento (servicePrice/barberName), nao o catalogo atual —
 * assim um reajuste de preco no futuro nao reescreve relatorios antigos.
 */
async function getSummary({ startDate, endDate, barberId, serviceId } = {}) {
  const bookings = await bookingRepository.findAll({ startDate, endDate, barberId, serviceId });

  const statusCounts = { pendente: 0, atendido: 0, cancelado: 0, 'no-show': 0 };
  const byService = new Map();
  const byBarber = new Map();
  let totalRevenue = 0;

  for (const booking of bookings) {
    statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;

    if (booking.status !== 'atendido') continue;

    const price = booking.servicePrice || 0;
    totalRevenue += price;

    const serviceEntry =
      byService.get(booking.serviceId) || { id: booking.serviceId, name: booking.serviceName, count: 0, revenue: 0 };
    serviceEntry.count += 1;
    serviceEntry.revenue += price;
    byService.set(booking.serviceId, serviceEntry);

    const barberEntry =
      byBarber.get(booking.barberId) || { id: booking.barberId, name: booking.barberName, count: 0, revenue: 0 };
    barberEntry.count += 1;
    barberEntry.revenue += price;
    byBarber.set(booking.barberId, barberEntry);
  }

  return {
    totalBookings: bookings.length,
    totalRevenue,
    statusCounts,
    byService: Array.from(byService.values()).sort((a, b) => b.revenue - a.revenue),
    byBarber: Array.from(byBarber.values()).sort((a, b) => b.revenue - a.revenue),
  };
}

module.exports = { getSummary };
