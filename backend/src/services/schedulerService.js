const cron = require('node-cron');
const bookingRepository = require('../repositories/bookingRepository');
const { sendBookingReminder } = require('./messagingService');
const logger = require('../utils/logger');

const REMINDER_HOURS_BEFORE = Number(process.env.REMINDER_HOURS_BEFORE || 2);

/**
 * Job recorrente que varre os agendamentos e dispara lembretes automaticos
 * pouco antes do horario marcado. Roda a cada 5 minutos; a janela de
 * REMINDER_HOURS_BEFORE evita reenviar o mesmo lembrete (bookingRepository
 * marca reminderSentAt apos o envio).
 */
function startReminderScheduler() {
  cron.schedule('*/5 * * * *', async () => {
    const withinMs = REMINDER_HOURS_BEFORE * 60 * 60 * 1000;
    const dueBookings = await bookingRepository.findPendingReminders({ withinMs });

    for (const booking of dueBookings) {
      const result = await sendBookingReminder(booking);
      if (result.success) {
        await bookingRepository.markReminderSent(booking.id);
        logger.info(`Lembrete enviado para agendamento #${booking.id}`);
      }
    }
  });

  logger.info('Scheduler de lembretes iniciado (verificacao a cada 5 minutos).');
}

module.exports = { startReminderScheduler };
