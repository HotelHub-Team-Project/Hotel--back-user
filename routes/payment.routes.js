// routes/payment.routes.js
import express from 'express';
import { confirmPayment } from '../controllers/payment.controller.js';

const router = express.Router();

// POST /api/payments/confirm
router.post('/confirm', confirmPayment);

export default router;