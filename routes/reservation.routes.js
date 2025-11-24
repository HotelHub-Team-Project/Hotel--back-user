import express from 'express';
import { createReservation, getReservation, getMyReservations } from '../controllers/reservation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// [중요] /my 경로가 /:id 보다 먼저 정의되어야 합니다.
// 그렇지 않으면 'my'를 id로 인식해서 에러가 날 수 있습니다.

// 내 예약 목록 조회 (로그인 필요)
router.get('/my', protect, getMyReservations);

// 예약 생성 (로그인 필요)
router.post('/', protect, createReservation);

// 예약 상세 조회 (로그인 필요)
router.get('/:id', protect, getReservation);

export default router;