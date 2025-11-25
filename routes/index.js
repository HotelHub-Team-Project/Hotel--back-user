import express from 'express';
import reservationRoutes from './reservation.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import hotelRoutes from './hotel.routes.js';
import roomRoutes from './room.routes.js';
import favoriteRoutes from './favorite.routes.js';
import couponRoutes from './coupon.routes.js';

const router = express.Router();

router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/coupons', couponRoutes);

export default router;
