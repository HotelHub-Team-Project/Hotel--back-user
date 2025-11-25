import { Router } from "express";
import { listAvailableCoupons } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.get("/available", verifyToken, listAvailableCoupons);

export default router;
