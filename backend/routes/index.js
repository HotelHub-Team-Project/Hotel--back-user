import express from 'express';
import reservationRoutes from './reservation.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
// import authRoutes from './auth.routes.js'; 

const router = express.Router();

router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
// router.use('/auth', authRoutes);

export default router;