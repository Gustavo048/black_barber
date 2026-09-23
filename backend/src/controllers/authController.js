const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

/**
 * Login unico de administrador (sem tabela de usuarios — a barbearia toda
 * usa uma unica credencial, configurada via env vars). O hash bcrypt evita
 * guardar a senha em texto puro mesmo nesse cenario simples.
 */
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Informe usuario e senha.');
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) {
    throw new AppError(
      'Login de administrador nao configurado no servidor (defina ADMIN_USERNAME e ADMIN_PASSWORD_HASH).',
      500
    );
  }

  const validUsername = username === expectedUsername;
  // Sempre chama bcrypt.compare, mesmo com usuario errado, para nao vazar
  // por tempo de resposta se o usuario existe ou nao (timing attack basico).
  const validPassword = await bcrypt.compare(password, expectedHash);

  if (!validUsername || !validPassword) {
    throw new AppError('Usuario ou senha invalidos.', 401);
  }

  const token = jwt.sign({ sub: username, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.json({ success: true, token, expiresIn: JWT_EXPIRES_IN });
}

module.exports = { login };
