const logger = require('../utils/logger');

/** Erro de negocio previsivel (ex.: validacao), com status HTTP definido. */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  }
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Erro interno do servidor.' : err.message,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Rota nao encontrada.' });
}

module.exports = { AppError, errorHandler, notFoundHandler };
