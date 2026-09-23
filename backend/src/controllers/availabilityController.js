const { getAvailability } = require('../services/availabilityService');
const { AppError } = require('../middleware/errorHandler');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/availability?date=YYYY-MM-DD&serviceId=xxx&barberId=opcional
 * Usado pelo formulario para so oferecer horarios realmente livres.
 */
async function getSlots(req, res) {
  const { date, serviceId, barberId } = req.query;

  if (!date || !DATE_REGEX.test(date)) {
    throw new AppError('Informe uma data valida (AAAA-MM-DD) via query string "date".');
  }
  if (!serviceId) {
    throw new AppError('Informe o servico via query string "serviceId".');
  }

  const result = await getAvailability({ date, serviceId, barberId: barberId || null });
  res.json({ success: true, ...result });
}

module.exports = { getSlots };
