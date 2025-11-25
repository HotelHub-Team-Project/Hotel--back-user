// routes/payment.routes.js
import express from 'express';
import { confirmPayment, cancelPayment } from '../controllers/payment.controller.js';

const router = express.Router();

// 결제 승인
router.post('/toss/confirm', confirmPayment);

// 결제 취소
router.post('/toss/cancel', cancelPayment);

export default router;
