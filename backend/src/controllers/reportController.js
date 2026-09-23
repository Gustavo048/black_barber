const { getSummary } = require('../services/reportService');

/**
 * GET /api/reports/summary?startDate=&endDate=&barberId=&serviceId=
 * Protegido por requireAuth — so a equipe autenticada ve faturamento.
 */
async function summary(req, res) {
  const { startDate, endDate, barberId, serviceId } = req.query;
  const result = await getSummary({ startDate, endDate, barberId, serviceId });
  res.json({ success: true, ...result });
}

module.exports = { summary };
