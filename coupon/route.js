import { Router } from "express";
import { listAvailableCoupons, applyCoupon, getCouponByCode } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.get("/available", verifyToken, listAvailableCoupons);
router.get("/code/:code", verifyToken, getCouponByCode);
router.post("/apply", verifyToken, applyCoupon);

export default router;
