// routes/review.routes.js
import express from 'express';
import { createReview, getReviews } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 리뷰 작성 (로그인 필요)
router.post('/', protect, createReview);

// 리뷰 조회
router.get('/', getReviews);

export default router;
