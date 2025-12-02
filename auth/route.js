import { Router } from "express";
import {
  register,
  login,
  me,
  kakaoRedirect,
  kakaoCallback,
  sendEmailVerificationCode,
  verifyEmailCode,
  forgotPassword,
  resetPassword,
  requestEmailChange,
  confirmEmailChange,
  naverRedirect,
  naverCallback,
  googleRedirect,
  googleCallback,
} from "./controller.js";
import { verifyToken } from "../common/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, me);
router.post("/email/send-code", sendEmailVerificationCode);
router.post("/email/verify", verifyEmailCode);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);
router.post("/email/change/request", verifyToken, requestEmailChange);
router.post("/email/change/confirm", verifyToken, confirmEmailChange);
router.get("/kakao", kakaoRedirect);
router.get("/kakao/callback", kakaoCallback);
router.get("/naver", naverRedirect);
router.get("/naver/callback", naverCallback);
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);

export default router;
