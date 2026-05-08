const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPayments, getPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-order', protect, authorize('patient'), createOrder);
router.post('/verify',       protect, authorize('patient'), verifyPayment);
router.get('/',    protect, getPayments);
router.get('/:id', protect, getPayment);

module.exports = router;
