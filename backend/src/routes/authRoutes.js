const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../utils/asyncHandler');
const { login } = require('../controllers/authController');

const router = Router();

// Poucas tentativas por IP: e a unica porta de entrada do painel administrativo.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

router.post('/login', loginLimiter, asyncHandler(login));

module.exports = router;
