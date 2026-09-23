/**
 * Implementacao em memoria — usada em desenvolvimento local sem banco
 * configurado, e nos testes automatizados (rapida, isolada, sem rede). Os
 * dados somem a cada reinicio do processo; para persistencia real, ver
 * PostgresBookingRepository.js.
 *
 * Metodos sao "async" so por consistencia de interface com
 * PostgresBookingRepository — nao ha I/O de verdade aqui, mas o resto da
 * aplicacao chama `await repo.metodo()` sem saber (nem precisar saber) qual
 * implementacao esta ativa.
 */
class InMemoryBookingRepository {
  constructor() {
    this._bookings = new Map();
    this._nextId = 1;
  }

  async create(bookingData) {
    const id = String(this._nextId++);
    const booking = {
      id,
      status: 'pendente',
      reminderSentAt: null,
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
    this._bookings.set(id, booking);
    return booking;
  }

  async findById(id) {
    return this._bookings.get(id) || null;
  }

  /** Filtros opcionais: startDate, endDate, barberId, serviceId, status. */
  async findAll(filters = {}) {
    let bookings = Array.from(this._bookings.values());

    if (filters.startDate) bookings = bookings.filter((b) => b.date >= filters.startDate);
    if (filters.endDate) bookings = bookings.filter((b) => b.date <= filters.endDate);
    if (filters.barberId) bookings = bookings.filter((b) => b.barberId === filters.barberId);
    if (filters.serviceId) bookings = bookings.filter((b) => b.serviceId === filters.serviceId);
    if (filters.status) bookings = bookings.filter((b) => b.status === filters.status);

    return bookings.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }

  /** Agendamentos ativos (nao cancelados) em uma data especifica — base para checagem de conflito. */
  async findByDate(date) {
    const all = await this.findAll();
    return all.filter((booking) => booking.date === date && booking.status !== 'cancelado');
  }

  /** Agendamentos cujo lembrete ainda nao foi enviado e que ocorrem dentro da janela informada. */
  async findPendingReminders({ withinMs }) {
    const now = Date.now();
    const all = await this.findAll();
    return all.filter((booking) => {
      if (booking.reminderSentAt || booking.status === 'cancelado') return false;
      const bookingTime = new Date(`${booking.date}T${booking.time}:00`).getTime();
      const diff = bookingTime - now;
      return diff > 0 && diff <= withinMs;
    });
  }

  async markReminderSent(id) {
    const booking = await this.findById(id);
    if (!booking) return null;
    booking.reminderSentAt = new Date().toISOString();
    return booking;
  }

  async updateStatus(id, status) {
    const booking = await this.findById(id);
    if (!booking) return null;
    booking.status = status;
    return booking;
  }
}

module.exports = InMemoryBookingRepository;
