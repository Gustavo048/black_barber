const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const asyncHandler = require('../utils/asyncHandler');
const { summary } = require('../controllers/reportController');

const router = Router();

router.get('/summary', requireAuth, asyncHandler(summary));

module.exports = router;
