import axios from "axios";
import PaymentMethod from "./model.js";

const getSecretKey = () => {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    const err = new Error("TOSS_SECRET_KEY_NOT_SET");
    err.statusCode = 500;
    throw err;
  }
  return key;
};

const issueBillingKey = async (payload) => {
  try {
    const secretKey = getSecretKey();
    const encryptedSecretKey =
      "Basic " + Buffer.from(secretKey + ":").toString("base64");

    const response = await axios.post(
      "https://api.tosspayments.com/v1/billing/authorizations/card",
      payload,
      {
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Toss BillingKey Error:",
      error.response?.data || error.message
    );
    const err = new Error(
      error.response?.data?.message || "BILLING_KEY_ISSUE_FAILED"
    );
    err.statusCode = error.response?.status || error.statusCode || 500;
    throw err;
  }
};

export const addPaymentMethod = async (userId, payload) => {
  const {
    cardNumber,
    cardExpirationYear,
    cardExpirationMonth,
    cardPassword,
    customerIdentityNumber,
    isDefault,
  } = payload;

  const billingResult = await issueBillingKey({
    customerKey: userId.toString(),
    cardNumber,
    cardExpirationYear,
    cardExpirationMonth,
    cardPassword,
    customerIdentityNumber,
  });

  const cardInfo = billingResult.card || {};

  if (isDefault) {
    await PaymentMethod.updateMany({ userId }, { isDefault: false });
  }

  const method = await PaymentMethod.create({
    userId,
    provider: "toss",
    billingKey: billingResult.billingKey,
    cardBrand: cardInfo.company, // toss 명칭
    cardIssuer: cardInfo.issuerCode,
    cardLast4: cardInfo.number?.slice(-4),
    cardNumberMasked: cardInfo.number,
    cardType: cardInfo.cardType,
    country: cardInfo.country,
    isDefault: !!isDefault,
  });

  return method;
};

export const listPaymentMethods = async (userId) => {
  return PaymentMethod.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

export const removePaymentMethod = async (userId, id) => {
  const removed = await PaymentMethod.findOneAndDelete({ _id: id, userId });
  if (!removed) {
    const err = new Error("PAYMENT_METHOD_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  return removed;
};

export const setDefaultPaymentMethod = async (userId, id) => {
  const target = await PaymentMethod.findOne({ _id: id, userId });
  if (!target) {
    const err = new Error("PAYMENT_METHOD_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  await PaymentMethod.updateMany({ userId }, { isDefault: false });
  target.isDefault = true;
  await target.save();
  return target;
};
