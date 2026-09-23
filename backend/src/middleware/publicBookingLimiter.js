const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Protege APENAS a criacao publica de agendamento (POST /api/bookings)
 * contra spam de formulario. Deliberadamente nao se aplica as rotas
 * administrativas (GET/PATCH em /api/bookings), que sao autenticadas e
 * usadas com frequencia pelo painel — compartilhar o mesmo limite com elas
 * travaria o uso normal do dashboard (cada mudanca de filtro dispara
 * chamadas a bookings + reports).
 *
 * Em desenvolvimento o limite e bem mais alto, so para nao interromper
 * testes manuais repetidos.
 */
const publicBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 1000,
  message: { success: false, message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

module.exports = publicBookingLimiter;
