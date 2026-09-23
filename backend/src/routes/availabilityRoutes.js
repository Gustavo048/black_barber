const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getSlots } = require('../controllers/availabilityController');

const router = Router();

router.get('/', asyncHandler(getSlots));

module.exports = router;
