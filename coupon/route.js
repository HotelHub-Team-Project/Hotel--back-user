import { Router } from "express";
import { listAvailableCoupons, applyCoupon } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.get("/available", verifyToken, listAvailableCoupons);
router.post("/apply", verifyToken, applyCoupon);

export default router;
