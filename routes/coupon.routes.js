import express from 'express';
import { listAvailableCoupons } from '../controllers/coupon.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 내 쿠폰함 조회
router.get('/available', protect, listAvailableCoupons);

export default router;
