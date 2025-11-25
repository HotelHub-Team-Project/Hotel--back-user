import jwt from "jsonwebtoken";
import axios from "axios";
import { User } from "../user/model.js";

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

const generateSocialPassword = (providerId) =>
  `social_${providerId}_${Date.now()}`;

const ensureEmail = (email, providerId) =>
  email || `kakao_${providerId}@kakao.local`;

export const register = async ({ name, email, password, phone }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("USER_ALREADY_EXISTS");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password, phone });
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: signToken(user._id),
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: signToken(user._id),
    };
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
    role: user.role,
    businessStatus: user.businessStatus,
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

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: signToken(user._id),
    provider: "kakao",
  };
};
