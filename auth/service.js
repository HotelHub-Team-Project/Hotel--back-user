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

const ensureEmail = (email, provider, providerId) =>
  email || `${provider}_${providerId}@${provider}.local`;

const buildSocialName = (provider, providerId, name) =>
  name || `${provider}_user_${String(providerId).slice(-4)}`;

const findOrCreateSocialUser = async ({
  provider,
  providerId,
  email,
  name,
  phone,
}) => {
  if (!providerId) {
    const err = new Error("SOCIAL_ID_REQUIRED");
    err.statusCode = 400;
    throw err;
  }

  const finalEmail = ensureEmail(email, provider, providerId);
  const finalName = buildSocialName(provider, providerId, name);

  let user = await User.findOne({ email: finalEmail });
  if (!user) {
    user = await User.create({
      name: finalName,
      email: finalEmail,
      password: generateSocialPassword(providerId),
      phone: phone || undefined,
    });
  }

  return user;
};

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
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
  if (!user) {
    const err = new Error("INVALID_CREDENTIALS");
    err.statusCode = 401;
    throw err;
  }

  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    const err = new Error("ACCOUNT_LOCKED");
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 10) {
      user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lock
    }
    await user.save();
    const err = new Error("INVALID_CREDENTIALS");
    err.statusCode = 401;
    throw err;
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  return buildAuthResponse(user);
};

export const getProfile = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
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

  const email = ensureEmail(account.email, "kakao", kakaoId);
  const name = account.profile?.nickname || account.name;
  const user = await findOrCreateSocialUser({
    provider: "kakao",
    providerId: kakaoId,
    email,
    name,
    phone: account.phone_number,
  });

  return { ...buildAuthResponse(user), provider: "kakao" };
};

export const naverLogin = async ({ code, state, redirectUri }) => {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const finalRedirectUri =
    redirectUri || process.env.NAVER_REDIRECT_URI || "";

  if (!clientId || !clientSecret || !finalRedirectUri) {
    const err = new Error("NAVER_OAUTH_CONFIG_MISSING");
    err.statusCode = 500;
    throw err;
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: finalRedirectUri,
    code,
    state: state || "naver_oauth",
  });

  const tokenRes = await axios.post(
    "https://nid.naver.com/oauth2.0/token",
    tokenParams,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token: accessToken } = tokenRes.data;
  if (!accessToken) {
    const err = new Error("NAVER_TOKEN_FAILED");
    err.statusCode = 400;
    throw err;
  }

  const profileRes = await axios.get("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const naverProfile = profileRes.data?.response;
  if (!naverProfile) {
    const err = new Error("NAVER_PROFILE_FAILED");
    err.statusCode = 400;
    throw err;
  }

  const naverId = naverProfile.id;
  const email = ensureEmail(naverProfile.email, "naver", naverId);
  const name = naverProfile.nickname || naverProfile.name;
  const user = await findOrCreateSocialUser({
    provider: "naver",
    providerId: naverId,
    email,
    name,
    phone: naverProfile.mobile || naverProfile.mobile_e164,
  });

  return { ...buildAuthResponse(user), provider: "naver" };
};

export const googleLogin = async ({ code, redirectUri }) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const finalRedirectUri =
    redirectUri || process.env.GOOGLE_REDIRECT_URI || "";

  if (!clientId || !clientSecret || !finalRedirectUri) {
    const err = new Error("GOOGLE_OAUTH_CONFIG_MISSING");
    err.statusCode = 500;
    throw err;
  }

  const tokenParams = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: finalRedirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    tokenParams,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token: accessToken, id_token: idToken } = tokenRes.data;
  if (!accessToken && !idToken) {
    const err = new Error("GOOGLE_TOKEN_FAILED");
    err.statusCode = 400;
    throw err;
  }

  let profile;
  if (accessToken) {
    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    profile = profileRes.data;
  }

  if (!profile && idToken) {
    try {
      const payload = idToken.split(".")[1];
      profile = JSON.parse(Buffer.from(payload, "base64").toString());
    } catch (_err) {
      // ignore
    }
  }

  if (!profile) {
    const err = new Error("GOOGLE_PROFILE_FAILED");
    err.statusCode = 400;
    throw err;
  }

  const googleId = profile.sub || profile.id;
  const email = ensureEmail(profile.email, "google", googleId);
  const name = profile.name || profile.given_name || profile.family_name;
  const user = await findOrCreateSocialUser({
    provider: "google",
    providerId: googleId,
    email,
    name,
    phone: profile.phone_number,
  });

  return { ...buildAuthResponse(user), provider: "google" };
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
    subject: "[KDT-Hotel-Project] 이메일 인증 코드",
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

export const verifyPasswordResetCode = async ({ email, code }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  assertCodeValid(user, "passwordReset", code, "RESET_CODE_NOT_FOUND");
  return { email, valid: true };
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
