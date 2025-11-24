// routes/auth.routes.js
import express from 'express';
import { registerUser, loginUser, getMyProfile } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// [추가] 내 정보 조회 (로그인 필요)
router.get('/me', protect, getMyProfile);

export default router;