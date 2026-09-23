const { SERVICES } = require('../config/services');
const { BARBERS } = require('../config/barbers');

/** Expoe o catalogo de servicos/barbeiros para o frontend consumir dinamicamente. */
function getServices(req, res) {
  res.json({ success: true, services: SERVICES });
}

function getBarbers(req, res) {
  res.json({ success: true, barbers: BARBERS });
}

module.exports = { getServices, getBarbers };
