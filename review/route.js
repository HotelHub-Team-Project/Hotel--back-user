import { Router } from "express";
import { createReview, getReviews } from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/", verifyToken, createReview);
router.get("/", getReviews);

export default router;
