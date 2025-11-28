import { Router } from "express";
import { confirmPayment, cancelPayment } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

// PG(Toss) 결제 승인/취소
router.post("/confirm", verifyToken, confirmPayment);
router.post("/cancel", verifyToken, cancelPayment);

export default router;
