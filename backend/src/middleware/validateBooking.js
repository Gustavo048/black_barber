const { AppError } = require('./errorHandler');
const { findServiceById } = require('../config/services');
const { findBarberById } = require('../config/barbers');

const PHONE_REGEX = /^\d{10,13}$/; // E.164 sem "+", ex.: 5511999999999
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm

/**
 * Validacao manual e explicita (sem lib externa) para manter o pacote de
 * dependencias enxuto. Para um formulario maior, migrar para zod/joi seria o
 * proximo passo natural sem quebrar o contrato desta funcao.
 */
function validateBooking(req, res, next) {
  const { customerName, customerPhone, serviceId, barberId, date, time } = req.body;

  if (!customerName || customerName.trim().length < 2) {
    throw new AppError('Informe um nome valido.');
  }
  if (!customerPhone || !PHONE_REGEX.test(customerPhone)) {
    throw new AppError('Informe um telefone valido, com DDI e DDD (ex.: 5511999999999).');
  }
  if (!serviceId || !findServiceById(serviceId)) {
    throw new AppError('Servico selecionado invalido.');
  }
  if (barberId && !findBarberById(barberId)) {
    throw new AppError('Profissional selecionado invalido.');
  }
  if (!date || !DATE_REGEX.test(date)) {
    throw new AppError('Informe uma data valida (AAAA-MM-DD).');
  }
  if (!time || !TIME_REGEX.test(time)) {
    throw new AppError('Informe um horario valido (HH:mm).');
  }

  const requestedDateTime = new Date(`${date}T${time}:00`);
  if (requestedDateTime.getTime() < Date.now()) {
    throw new AppError('Nao e possivel agendar em uma data/horario no passado.');
  }

  next();
}

module.exports = validateBooking;
