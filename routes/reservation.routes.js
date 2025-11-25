import express from 'express';
import { createReservation, getReservation, getMyReservations, cancelReservation } from '../controllers/reservation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// /my 경로가 /:id 보다 먼저 정의되어야 함
router.get('/my', protect, getMyReservations);

// 예약 생성 (로그인 필요)
router.post('/', protect, createReservation);

// 예약 취소 (로그인 필요)
router.post('/:id/cancel', protect, cancelReservation);

// 예약 상세 조회 (로그인 필요)
router.get('/:id', protect, getReservation);

export default router;
