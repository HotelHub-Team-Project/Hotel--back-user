import { Router } from "express";
import reservationRoutes from "../reservation/route.js";
import paymentRoutes from "../payment/route.js";
import reviewRoutes from "../review/route.js";
import authRoutes from "../auth/route.js";
import userRoutes from "../user/route.js";
import hotelRoutes from "../hotel/route.js";
import roomRoutes from "../room/route.js";
import favoriteRoutes from "../favorite/route.js";
import couponRoutes from "../coupon/route.js";
import paymentMethodRoutes from "../paymentMethod/route.js";

const router = Router();

router.use("/reservations", reservationRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/hotels", hotelRoutes);
router.use("/rooms", roomRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/coupons", couponRoutes);
router.use("/payment-methods", paymentMethodRoutes);

export default router;
