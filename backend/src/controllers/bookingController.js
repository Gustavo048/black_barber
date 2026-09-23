const bookingRepository = require('../repositories/bookingRepository');
const { sendBookingConfirmation, sendAdminNotification } = require('../services/messagingService');
const { findServiceById } = require('../config/services');
const { isWithinBusinessHours, findAvailableBarber } = require('../services/availabilityService');
const { toMinutes } = require('../utils/time');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const WHATSAPP_NUMBER = process.env.BARBERSHOP_WHATSAPP_NUMBER || '';

/** Monta um link wa.me de fallback, usado quando a automacao nao confirma o envio. */
function buildFallbackWhatsAppLink(booking) {
  const text = encodeURIComponent(
    `Ola! Gostaria de confirmar meu agendamento de ${booking.serviceName} no dia ${booking.date} as ${booking.time}.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/**
 * Cria o agendamento somente depois de confirmar que:
 * 1) o horario pedido cabe dentro do expediente daquele dia (considerando a
 *    duracao do servico, nao so o instante inicial);
 * 2) existe pelo menos um barbeiro livre nesse intervalo, segundo a
 *    aplicacao (o preferido, se o cliente escolheu um; qualquer um, caso
 *    contrario).
 * Essas duas checagens evitam a grande maioria das sobrescritas. A garantia
 * final, porem, e do proprio banco: se DATABASE_URL estiver configurada, a
 * constraint EXCLUDE de sql/schema.sql recusa qualquer sobreposicao real no
 * INSERT, mesmo que duas requisicoes tenham passado pela checagem acima ao
 * mesmo tempo (corrida entre requisicoes concorrentes). Esse erro do banco
 * e capturado abaixo e convertido em 409, igual ao caso "sem barbeiro livre".
 */
async function createBooking(req, res) {
  const { customerName, customerPhone, serviceId, barberId, date, time, notes } = req.body;

  const service = findServiceById(serviceId);
  const startMinutes = toMinutes(time);
  const endMinutes = startMinutes + service.durationMinutes;

  if (!isWithinBusinessHours(date, startMinutes, endMinutes)) {
    throw new AppError(
      'Esse horario esta fora do expediente da barbearia nesse dia, ou o servico nao terminaria antes do fechamento.',
      400
    );
  }

  const assignedBarber = await findAvailableBarber({
    date,
    startMinutes,
    endMinutes,
    preferredBarberId: barberId || null,
  });

  if (!assignedBarber) {
    throw new AppError(
      barberId
        ? 'Esse profissional ja tem um horario marcado nesse intervalo. Escolha outro horario ou outro profissional.'
        : 'Nao ha profissionais disponiveis nesse horario. Escolha outro horario.',
      409
    );
  }

  let booking;
  try {
    booking = await bookingRepository.create({
      customerName: customerName.trim(),
      customerPhone,
      serviceId,
      // Snapshot do nome/preco/duracao no momento do agendamento: se o
      // catalogo mudar depois (reajuste de preco, servico renomeado), os
      // relatorios financeiros de agendamentos passados continuam corretos.
      serviceName: service.name,
      servicePrice: service.price,
      durationMinutes: service.durationMinutes,
      barberId: assignedBarber.id,
      barberName: assignedBarber.name,
      date,
      time,
      notes: notes ? String(notes).trim().slice(0, 300) : '',
    });
  } catch (error) {
    if (error.isBookingConflict) {
      throw new AppError(error.message, 409);
    }
    throw error;
  }

  const messageResult = await sendBookingConfirmation(booking);
  const adminNotification = await sendAdminNotification(booking);

  if (!messageResult.success) {
    logger.warn(`Automacao de WhatsApp indisponivel para o agendamento #${booking.id}; oferecendo fallback wa.me.`);
  }
  if (!adminNotification.success) {
    logger.warn(`Notificacao para a equipe nao pode ser enviada automaticamente para o agendamento #${booking.id}.`);
  }

  res.status(201).json({
    success: true,
    message: messageResult.success
      ? `Agendamento confirmado com ${assignedBarber.name}! Enviamos a confirmacao pelo WhatsApp.`
      : `Agendamento com ${assignedBarber.name} recebido. Nao conseguimos enviar a confirmacao automatica; use o link abaixo para confirmar por WhatsApp.`,
    booking,
    automatedMessageSent: messageResult.success,
    teamNotified: adminNotification.success,
    whatsappFallbackUrl: messageResult.success ? null : buildFallbackWhatsAppLink(booking),
  });
}

const VALID_STATUSES = ['pendente', 'atendido', 'cancelado', 'no-show'];

/**
 * GET /api/bookings — uso do painel administrativo (protegido por
 * requireAuth). Aceita filtros opcionais por periodo, barbeiro, servico e
 * status; a filtragem e feita dentro do repositorio (SQL WHERE no Postgres,
 * ou array filter na versao em memoria) para nao trazer o banco inteiro
 * para a memoria do processo.
 */
async function listBookings(req, res) {
  const { startDate, endDate, barberId, serviceId, status } = req.query;
  const bookings = await bookingRepository.findAll({ startDate, endDate, barberId, serviceId, status });
  res.json({ success: true, bookings });
}

/**
 * PATCH /api/bookings/:id/status — o dono/equipe marca o que de fato
 * aconteceu (atendido, cancelado, no-show). E esse status que os relatorios
 * financeiros usam para contar receita — nada e faturado so por existir.
 */
async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Status invalido. Use um destes: ${VALID_STATUSES.join(', ')}.`);
  }

  const updated = await bookingRepository.updateStatus(id, status);
  if (!updated) {
    throw new AppError('Agendamento nao encontrado.', 404);
  }

  res.json({ success: true, booking: updated });
}

module.exports = { createBooking, listBookings, updateBookingStatus };
