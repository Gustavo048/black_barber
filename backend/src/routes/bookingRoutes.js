const { Router } = require('express');
const validateBooking = require('../middleware/validateBooking');
const requireAuth = require('../middleware/requireAuth');
const publicBookingLimiter = require('../middleware/publicBookingLimiter');
const asyncHandler = require('../utils/asyncHandler');
const { createBooking, listBookings, updateBookingStatus } = require('../controllers/bookingController');

const router = Router();

// POST /api/bookings - publico: cliente cria o agendamento. So esta rota leva o rate limit.
router.post('/', publicBookingLimiter, validateBooking, asyncHandler(createBooking));

// GET /api/bookings - protegido: uso do painel administrativo (lista/filtra agendamentos)
router.get('/', requireAuth, asyncHandler(listBookings));

// PATCH /api/bookings/:id/status - protegido: marcar atendido/cancelado/no-show
router.patch('/:id/status', requireAuth, asyncHandler(updateBookingStatus));

module.exports = router;
