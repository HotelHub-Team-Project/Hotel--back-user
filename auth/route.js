import { Router } from "express";
import {
  register,
  registerBusiness,
  login,
  me,
  kakaoRedirect,
  kakaoCallback,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/register/business", registerBusiness);
router.post("/login", login);
router.get("/me", verifyToken, me);
router.get("/kakao", kakaoRedirect);
router.get("/kakao/callback", kakaoCallback);

export default router;
