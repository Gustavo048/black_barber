/**
 * Logger minimalista e centralizado. Trocar por winston/pino no futuro exige
 * mudar apenas este arquivo, ja que o resto do codigo depende deste contrato
 * (info/warn/error), nao de uma lib especifica.
 */
const timestamp = () => new Date().toISOString();

module.exports = {
  info: (msg) => console.log(`[INFO ${timestamp()}] ${msg}`),
  warn: (msg) => console.warn(`[WARN ${timestamp()}] ${msg}`),
  error: (msg) => console.error(`[ERROR ${timestamp()}] ${msg}`),
};
