const InMemoryBookingRepository = require('./InMemoryBookingRepository');
const logger = require('../utils/logger');

/**
 * Escolhe a implementacao a partir de DATABASE_URL: com ela definida, usa
 * Postgres (Neon) — dados persistem entre reinicios e ganham a protecao
 * anti-sobreposicao no nivel do banco. Sem ela, cai para memoria (bom para
 * dev local e para os testes automatizados, sem precisar de rede/banco).
 * As duas implementam a mesma interface assincrona, entao o resto do app
 * (controllers, services) nunca precisa saber qual esta ativa.
 *
 * O require de PostgresBookingRepository (e, por tabela, do pacote "pg") e
 * feito aqui dentro, so quando DATABASE_URL existe — assim um ambiente que
 * nunca configurou Postgres nem precisa ter "pg" instalado para rodar.
 */
function createBookingRepository() {
  if (process.env.DATABASE_URL) {
    logger.info('DATABASE_URL configurada — usando PostgresBookingRepository.');
    const PostgresBookingRepository = require('./PostgresBookingRepository');
    return new PostgresBookingRepository();
  }
  logger.warn('DATABASE_URL nao configurada — usando InMemoryBookingRepository (dados nao persistem entre reinicios).');
  return new InMemoryBookingRepository();
}

module.exports = createBookingRepository();
