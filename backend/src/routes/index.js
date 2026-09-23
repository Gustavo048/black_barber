const { Router } = require('express');
const bookingRoutes = require('./bookingRoutes');
const catalogRoutes = require('./catalogRoutes');
const availabilityRoutes = require('./availabilityRoutes');
const authRoutes = require('./authRoutes');
const reportRoutes = require('./reportRoutes');

const router = Router();

router.use('/bookings', bookingRoutes);
router.use('/availability', availabilityRoutes);
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/', catalogRoutes);

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

module.exports = router;
