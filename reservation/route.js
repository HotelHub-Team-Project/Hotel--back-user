import { Router } from "express";
import {
  createReservation,
  getReservationDetail,
  getMyReservations,
  cancelReservation,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.get("/my", verifyToken, getMyReservations);
router.post("/", verifyToken, createReservation);
router.patch("/:id/cancel", verifyToken, cancelReservation);
router.post("/:id/cancel", verifyToken, cancelReservation); // 이전 호환용
router.get("/:id", verifyToken, getReservationDetail);

export default router;
