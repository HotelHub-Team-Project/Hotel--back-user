// routes/user.routes.js
import express from 'express';
import { applyBusiness } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 사업자 전환 신청 (로그인 필요)
// POST /api/users/business-apply
router.post('/business-apply', protect, applyBusiness);

export default router;