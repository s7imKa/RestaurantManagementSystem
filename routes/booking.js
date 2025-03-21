const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getBookingForm);
router.post('/', bookingController.reserveTable);

module.exports = router;
