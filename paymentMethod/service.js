import PaymentMethod from "./model.js";

const normalizeCardNumber = (cardNumber) =>
  (cardNumber || "").replace(/\D/g, "");

const detectBrand = (digits) => {
  if (digits.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (/^6(011|5)/.test(digits)) return "DISCOVER";
  return undefined;
};

export const addPaymentMethod = async (userId, payload) => {
  const {
    cardNumber,
    cardExpirationYear,
    cardExpirationMonth,
    cardHolder,
    nickname,
    isDefault,
  } = payload;

  const digits = normalizeCardNumber(cardNumber);
  if (digits.length < 12 || digits.length > 19) {
    const err = new Error("INVALID_CARD_NUMBER");
    err.statusCode = 400;
    throw err;
  }

  const last4 = digits.slice(-4);
  const masked = digits.replace(/.(?=.{4})/g, "*");
  const brand = detectBrand(digits) || payload.cardBrand || undefined;

  if (isDefault) {
    await PaymentMethod.updateMany({ userId }, { isDefault: false });
  }

  const method = await PaymentMethod.create({
    userId,
    provider: "manual",
    nickname: nickname || cardHolder || brand,
    cardBrand: brand,
    cardLast4: last4,
    cardNumberMasked: masked,
    cardExpirationMonth,
    cardExpirationYear,
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
