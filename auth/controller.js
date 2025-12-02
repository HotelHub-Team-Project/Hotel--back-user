import * as authService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";
import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow("", null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const emailCodeSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const emailChangeRequestSchema = Joi.object({
  newEmail: Joi.string().email().required(),
});

const emailChangeConfirmSchema = Joi.object({
  code: Joi.string().required(),
});

const redirectWithToken = (res, data, redirectUri) => {
  if (!redirectUri) {
    return res.status(200).json(successResponse(data, "LOGIN_SUCCESS", 200));
  }

  const url = new URL(redirectUri);
  url.hash =
    `token=${encodeURIComponent(data.token)}` +
    `&name=${encodeURIComponent(data.name || "")}` +
    `&email=${encodeURIComponent(data.email || "")}` +
    (data.provider ? `&provider=${encodeURIComponent(data.provider)}` : "");

  return res.redirect(url.toString());
};

export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const data = await authService.register(req.body);
    return res
      .status(201)
      .json(successResponse(data, "REGISTER_SUCCESS", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }

    const data = await authService.login(req.body);
    return res.status(200).json(successResponse(data, "LOGIN_SUCCESS", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 401)
      .json(errorResponse(err.message, err.statusCode || 401));
  }
};

export const me = async (req, res) => {
  try {
    const data = authService.getProfile(req.user);
    return res.status(200).json(successResponse(data, "PROFILE", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const sendEmailVerificationCode = async (req, res) => {
  try {
    const { error } = emailCodeSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await authService.sendEmailVerificationCode(req.body);
    return res
      .status(200)
      .json(successResponse(data, "EMAIL_VERIFICATION_CODE_SENT", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const verifyEmailCode = async (req, res) => {
  try {
    const { error } = verifyEmailSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await authService.verifyEmailCode(req.body);
    return res
      .status(200)
      .json(successResponse(data, "EMAIL_VERIFIED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await authService.requestPasswordReset(req.body);
    return res
      .status(200)
      .json(successResponse(data, "RESET_CODE_SENT", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await authService.resetPassword(req.body);
    return res
      .status(200)
      .json(successResponse(data, "PASSWORD_RESET", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const requestEmailChange = async (req, res) => {
  try {
    const { error } = emailChangeRequestSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await authService.requestEmailChange(req.user._id, req.body);
    return res
      .status(200)
      .json(successResponse(data, "EMAIL_CHANGE_CODE_SENT", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const confirmEmailChange = async (req, res) => {
  try {
    const { error } = emailChangeConfirmSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(errorResponse(error.details[0].message, 400));
    }
    const data = await authService.confirmEmailChange(req.user._id, req.body);
    return res
      .status(200)
      .json(successResponse(data, "EMAIL_CHANGED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const kakaoRedirect = (_req, res) => {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res
      .status(500)
      .json(errorResponse("KAKAO_OAUTH_CONFIG_MISSING", 500));
  }

  const kakaoAuthUrl =
    "https://kauth.kakao.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=code";

  return res.redirect(kakaoAuthUrl);
};

export const kakaoCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json(errorResponse("AUTH_CODE_REQUIRED", 400));
    }

    const data = await authService.kakaoLogin({
      code,
      redirectUri: process.env.KAKAO_REDIRECT_URI,
    });

    return redirectWithToken(res, data, process.env.KAKAO_LOGIN_REDIRECT);
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const naverRedirect = (_req, res) => {
  const clientId = process.env.NAVER_CLIENT_ID;
  const redirectUri = process.env.NAVER_REDIRECT_URI;
  const state = process.env.NAVER_LOGIN_STATE || "naver_oauth";

  if (!clientId || !redirectUri) {
    return res
      .status(500)
      .json(errorResponse("NAVER_OAUTH_CONFIG_MISSING", 500));
  }

  const naverAuthUrl =
    "https://nid.naver.com/oauth2.0/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=code" +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(naverAuthUrl);
};

export const naverCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json(errorResponse("AUTH_CODE_REQUIRED", 400));
    }

    const data = await authService.naverLogin({
      code,
      state,
      redirectUri: process.env.NAVER_REDIRECT_URI,
    });

    return redirectWithToken(res, data, process.env.NAVER_LOGIN_REDIRECT);
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

export const googleRedirect = (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const state = process.env.GOOGLE_LOGIN_STATE || "google_oauth";
  const scope = encodeURIComponent("openid email profile");

  if (!clientId || !redirectUri) {
    return res
      .status(500)
      .json(errorResponse("GOOGLE_OAUTH_CONFIG_MISSING", 500));
  }

  const googleAuthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=code" +
    `&scope=${scope}` +
    "&access_type=offline" +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(googleAuthUrl);
};

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json(errorResponse("AUTH_CODE_REQUIRED", 400));
    }

    const data = await authService.googleLogin({
      code,
      state,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    return redirectWithToken(res, data, process.env.GOOGLE_LOGIN_REDIRECT);
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};
