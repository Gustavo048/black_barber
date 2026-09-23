const { Router } = require('express');
const { getServices, getBarbers } = require('../controllers/catalogController');

const router = Router();

router.get('/services', getServices);
router.get('/barbers', getBarbers);

module.exports = router;
