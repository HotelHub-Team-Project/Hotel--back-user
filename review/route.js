import { Router } from "express";
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  reportReview,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/", verifyToken, createReview);
router.get("/", getReviews);
router.patch("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);
router.post("/:id/report", verifyToken, reportReview);

export default router;
