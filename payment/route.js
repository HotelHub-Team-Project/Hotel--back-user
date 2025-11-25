import { Router } from "express";
import { confirmPayment, cancelPayment } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/toss/confirm", verifyToken, confirmPayment);
router.post("/toss/cancel", verifyToken, cancelPayment);

export default router;
