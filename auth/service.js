import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import { User } from "../user/model.js";
import { sendMail } from "../common/mailer.js";

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

const generateSocialPassword = (providerId) =>
  `social_${providerId}_${Date.now()}`;

const ensureEmail = (email, providerId) =>
  email || `kakao_${providerId}@kakao.local`;

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  token: signToken(user._id),
});

const generateCode = () => String(crypto.randomInt(100000, 999999));

const setCodeWithExpiry = (user, fieldBase) => {
  const code = generateCode();
  user[`${fieldBase}Code`] = code;
  user[`${fieldBase}Expires`] = new Date(Date.now() + 15 * 60 * 1000);
  return code;
};

const assertCodeValid = (user, fieldBase, code, errorMessage) => {
  const savedCode = user[`${fieldBase}Code`];
  const expires = user[`${fieldBase}Expires`];
  if (!savedCode || !expires) {
    const err = new Error(errorMessage || "CODE_NOT_FOUND");
    err.statusCode = 400;
    throw err;
  }
  if (expires.getTime() < Date.now()) {
    const err = new Error("CODE_EXPIRED");
    err.statusCode = 400;
    throw err;
  }
  if (savedCode !== code) {
    const err = new Error("CODE_MISMATCH");
    err.statusCode = 400;
    throw err;
  }
};

export const register = async ({ name, email, password, phone }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("USER_ALREADY_EXISTS");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password, phone });
  return buildAuthResponse(user);
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return buildAuthResponse(user);
  }
  const err = new Error("INVALID_CREDENTIALS");
  err.statusCode = 401;
  throw err;
};

export const getProfile = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    emailVerified: user.emailVerified,
  };
};

export const kakaoLogin = async ({ code, redirectUri }) => {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const finalRedirectUri =
    redirectUri || process.env.KAKAO_REDIRECT_URI || "";

  if (!clientId || !finalRedirectUri) {
    const err = new Error("KAKAO_OAUTH_CONFIG_MISSING");
    err.statusCode = 500;
    throw err;
  }

  // 1) 토큰 발급
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: finalRedirectUri,
    code,
  });
  if (clientSecret) tokenParams.append("client_secret", clientSecret);

  const tokenRes = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    tokenParams,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token: accessToken } = tokenRes.data;
  if (!accessToken) {
    const err = new Error("KAKAO_TOKEN_FAILED");
    err.statusCode = 400;
    throw err;
  }

  // 2) 사용자 정보 조회
  const profileRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const kakaoProfile = profileRes.data;
  const kakaoId = kakaoProfile.id;
  const account = kakaoProfile.kakao_account || {};

  const email = ensureEmail(account.email, kakaoId);
  const name =
    account.profile?.nickname ||
    account.name ||
    `kakao_user_${String(kakaoId).slice(-4)}`;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: generateSocialPassword(kakaoId),
      phone: account.phone_number || undefined,
    });
  }

  return { ...buildAuthResponse(user), provider: "kakao" };
};

export const sendEmailVerificationCode = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  const code = setCodeWithExpiry(user, "emailVerification");
  await user.save();
  await sendMail({
    to: email,
    subject: "[Hotel] 이메일 인증 코드",
    text: `인증 코드: ${code}\n15분 이내에 입력해 주세요.`,
  });
  return { email, sent: true };
};

export const verifyEmailCode = async ({ email, code }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  assertCodeValid(user, "emailVerification", code, "VERIFICATION_CODE_NOT_FOUND");
  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return buildAuthResponse(user);
};

export const requestPasswordReset = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  const code = setCodeWithExpiry(user, "passwordReset");
  await user.save();
  await sendMail({
    to: email,
    subject: "[Hotel] 비밀번호 재설정 코드",
    text: `비밀번호 재설정 코드: ${code}\n15분 이내에 입력해 주세요.`,
  });
  return { email, sent: true };
};

export const resetPassword = async ({ email, code, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  assertCodeValid(user, "passwordReset", code, "RESET_CODE_NOT_FOUND");
  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return buildAuthResponse(user);
};

export const requestEmailChange = async (userId, { newEmail }) => {
  const existing = await User.findOne({ email: newEmail });
  if (existing) {
    const err = new Error("EMAIL_ALREADY_IN_USE");
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  user.pendingEmail = newEmail;
  const code = setCodeWithExpiry(user, "emailChange");
  await user.save();
  await sendMail({
    to: newEmail,
    subject: "[Hotel] 이메일 변경 확인 코드",
    text: `이메일 변경 확인 코드: ${code}\n15분 이내에 입력해 주세요.`,
  });
  return { newEmail, sent: true };
};

export const confirmEmailChange = async (userId, { code }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  if (!user.pendingEmail) {
    const err = new Error("EMAIL_CHANGE_NOT_REQUESTED");
    err.statusCode = 400;
    throw err;
  }
  assertCodeValid(user, "emailChange", code, "EMAIL_CHANGE_CODE_NOT_FOUND");
  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.emailVerified = true;
  user.emailChangeCode = undefined;
  user.emailChangeExpires = undefined;
  await user.save();
  return buildAuthResponse(user);
};
