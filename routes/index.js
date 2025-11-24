import express from 'express';
import reservationRoutes from './reservation.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js'; // [추가]

const router = express.Router();

router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // [추가] - /api/users 경로로 연결

export default router;