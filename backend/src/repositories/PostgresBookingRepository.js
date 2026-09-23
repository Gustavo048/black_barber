const { getPool } = require('../config/db');

/** Converte uma linha do banco (snake_case) para o formato usado pela aplicacao (camelCase). */
function mapRow(row) {
  return {
    id: String(row.id),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    serviceId: row.service_id,
    serviceName: row.service_name,
    servicePrice: Number(row.service_price),
    durationMinutes: row.duration_minutes,
    barberId: row.barber_id,
    barberName: row.barber_name,
    date: row.date, // ja vem como string "YYYY-MM-DD" gracas ao setTypeParser em config/db.js
    time: String(row.time).slice(0, 5), // "HH:mm:ss" -> "HH:mm"
    notes: row.notes,
    status: row.status,
    reminderSentAt: row.reminder_sent_at ? new Date(row.reminder_sent_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * Implementacao real, com Postgres (Neon). A protecao contra dois clientes
 * sobrescreverem o mesmo horario tem duas camadas: a checagem de
 * disponibilidade da aplicacao (services/availabilityService.js) evita a
 * maioria dos casos, e a constraint EXCLUDE definida em sql/schema.sql pega
 * o resto — inclusive a corrida entre duas requisicoes simultaneas, que a
 * aplicacao sozinha nao consegue garantir.
 */
class PostgresBookingRepository {
  async create(bookingData) {
    const {
      customerName,
      customerPhone,
      serviceId,
      serviceName,
      servicePrice,
      durationMinutes,
      barberId,
      barberName,
      date,
      time,
      notes,
    } = bookingData;

    try {
      const result = await getPool().query(
        `INSERT INTO bookings
          (customer_name, customer_phone, service_id, service_name, service_price,
           duration_minutes, barber_id, barber_name, date, time, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [customerName, customerPhone, serviceId, serviceName, servicePrice, durationMinutes, barberId, barberName, date, time, notes || '']
      );
      return mapRow(result.rows[0]);
    } catch (error) {
      // 23P01 = exclusion_violation: a constraint EXCLUDE do schema.sql
      // recusou por sobreposicao real de horario para o mesmo barbeiro —
      // mesmo que a checagem da aplicacao tenha passado (corrida entre duas
      // requisicoes quase simultaneas). Traduzimos para um erro de dominio
      // que o controller sabe converter em 409.
      if (error.code === '23P01') {
        const conflictError = new Error('Esse horario acabou de ser ocupado por outro cliente. Escolha outro horario.');
        conflictError.isBookingConflict = true;
        throw conflictError;
      }
      throw error;
    }
  }

  async findById(id) {
    const result = await getPool().query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  /** Filtros opcionais: startDate, endDate, barberId, serviceId, status. */
  async findAll(filters = {}) {
    const conditions = [];
    const values = [];

    if (filters.startDate) {
      values.push(filters.startDate);
      conditions.push(`date >= $${values.length}`);
    }
    if (filters.endDate) {
      values.push(filters.endDate);
      conditions.push(`date <= $${values.length}`);
    }
    if (filters.barberId) {
      values.push(filters.barberId);
      conditions.push(`barber_id = $${values.length}`);
    }
    if (filters.serviceId) {
      values.push(filters.serviceId);
      conditions.push(`service_id = $${values.length}`);
    }
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await getPool().query(`SELECT * FROM bookings ${where} ORDER BY date, time`, values);
    return result.rows.map(mapRow);
  }

  async findByDate(date) {
    const result = await getPool().query(`SELECT * FROM bookings WHERE date = $1 AND status <> 'cancelado'`, [date]);
    return result.rows.map(mapRow);
  }

  /**
   * Agendamentos cujo lembrete ainda nao foi enviado e cujo horario cai
   * dentro da janela informada. Compara contra now() do proprio Postgres —
   * atencao ao fuso horario da sessao do banco se ele divergir do fuso da
   * barbearia (ver nota no README).
   */
  async findPendingReminders({ withinMs }) {
    const result = await getPool().query(
      `SELECT * FROM bookings
       WHERE reminder_sent_at IS NULL
         AND status <> 'cancelado'
         AND (date + time)::timestamp BETWEEN now() AND now() + ($1 || ' milliseconds')::interval`,
      [withinMs]
    );
    return result.rows.map(mapRow);
  }

  async markReminderSent(id) {
    const result = await getPool().query(`UPDATE bookings SET reminder_sent_at = now() WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async updateStatus(id, status) {
    const result = await getPool().query(`UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`, [status, id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}

module.exports = PostgresBookingRepository;
