const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

/**
 * Protege rotas administrativas (lista de agendamentos, mudanca de status,
 * relatorios). Espera um header "Authorization: Bearer <token>" com um JWT
 * emitido por POST /api/auth/login. Nao ha sessao/estado no servidor — o
 * token e auto-contido e expira sozinho (ver JWT_EXPIRES_IN).
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Nao autenticado. Faca login para acessar esse recurso.', 401);
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    throw new AppError('Sessao invalida ou expirada. Faca login novamente.', 401);
  }
}

module.exports = requireAuth;
