const { createMessagingProvider } = require('./messaging');
const { findServiceById } = require('../config/services');
const { findBarberById } = require('../config/barbers');
const logger = require('../utils/logger');

// Uma unica instancia de provider para toda a aplicacao (sessao do WhatsApp e
// cara de inicializar; nao faz sentido recriar por request).
const provider = createMessagingProvider();

const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '';

function buildConfirmationMessage(booking) {
  const service = findServiceById(booking.serviceId);
  const barber = findBarberById(booking.barberId);
  return (
    `Ola, ${booking.customerName}! Seu horario na Barbershop foi confirmado:\n\n` +
    `Servico: ${service ? service.name : booking.serviceId}\n` +
    `Profissional: ${barber ? barber.name : 'A definir'}\n` +
    `Data: ${booking.date} as ${booking.time}\n\n` +
    `Se precisar remarcar, e so responder esta mensagem.`
  );
}

function buildReminderMessage(booking) {
  const service = findServiceById(booking.serviceId);
  return (
    `Lembrete: seu horario de ${service ? service.name : 'servico'} na Barbershop ` +
    `e hoje as ${booking.time}. Te esperamos!`
  );
}

/** Mensagem enviada ao barbeiro/admin sempre que um novo agendamento e criado. */
function buildAdminNotificationMessage(booking) {
  const service = findServiceById(booking.serviceId);
  const barber = findBarberById(booking.barberId);
  return (
    `Novo agendamento recebido!\n\n` +
    `Cliente: ${booking.customerName} (${booking.customerPhone})\n` +
    `Servico: ${service ? service.name : booking.serviceId}\n` +
    `Profissional: ${barber ? barber.name : 'A definir'}\n` +
    `Data: ${booking.date} as ${booking.time}` +
    (booking.notes ? `\nObservacoes: ${booking.notes}` : '')
  );
}

/**
 * Envia a confirmacao de agendamento. Se o provider de automacao falhar (ex.:
 * sessao do WhatsApp fora do ar), a falha e reportada ao chamador em vez de
 * ser engolida, para que o controller possa decidir o fallback (ex.: link
 * wa.me manual) sem quebrar a resposta da API.
 */
async function sendBookingConfirmation(booking) {
  const message = buildConfirmationMessage(booking);
  try {
    return await provider.sendMessage(booking.customerPhone, message);
  } catch (error) {
    logger.error(`Falha ao enviar confirmacao via automacao: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendBookingReminder(booking) {
  const message = buildReminderMessage(booking);
  try {
    return await provider.sendMessage(booking.customerPhone, message);
  } catch (error) {
    logger.error(`Falha ao enviar lembrete via automacao: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Avisa a equipe sobre o novo agendamento. Prioriza o telefone do proprio
 * barbeiro atribuido (config/barbers.js); se ele nao tiver telefone
 * cadastrado, cai para o numero geral ADMIN_WHATSAPP_NUMBER. Se nenhum dos
 * dois existir, so loga um aviso — nao interrompe a criacao do agendamento.
 */
async function sendAdminNotification(booking) {
  const barber = findBarberById(booking.barberId);
  const targetPhone = (barber && barber.phone) || ADMIN_WHATSAPP_NUMBER;

  if (!targetPhone) {
    logger.warn(
      `Agendamento #${booking.id} criado, mas nenhum numero de notificacao esta configurado ` +
        `(defina o telefone do barbeiro ou ADMIN_WHATSAPP_NUMBER).`
    );
    return { success: false, error: 'no-target-phone' };
  }

  const message = buildAdminNotificationMessage(booking);
  try {
    return await provider.sendMessage(targetPhone, message);
  } catch (error) {
    logger.error(`Falha ao notificar a equipe sobre o agendamento #${booking.id}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = { sendBookingConfirmation, sendBookingReminder, sendAdminNotification };
