import { Coupon } from "./model.js";

export const listAvailableCoupons = async (userId) => {
  const now = new Date();

  const coupons = await Coupon.find({
    status: "active",
    $or: [{ userId }, { userId: { $exists: false } }],
  }).sort({ validTo: 1 });

  return coupons.filter((c) => c.isAvailableForUser(userId, now));
};

const computeDiscount = (coupon, amount) => {
  if (coupon.discountType === "amount") {
    return Math.max(0, Math.min(coupon.discountValue, amount));
  }
  if (coupon.discountType === "percent") {
    return Math.max(
      0,
      Math.min(Math.round((amount * coupon.discountValue) / 100), amount)
    );
  }
  return 0;
};

export const applyCouponForAmount = async (userId, code, amount) => {
  const now = new Date();
  const coupon = await Coupon.findOne({ code: code.trim() });
  if (!coupon) {
    const err = new Error("COUPON_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!coupon.isAvailableForUser(userId, now)) {
    const err = new Error("COUPON_NOT_AVAILABLE");
    err.statusCode = 400;
    throw err;
  }

  if (coupon.minAmount && amount < coupon.minAmount) {
    const err = new Error("COUPON_MIN_AMOUNT_NOT_MET");
    err.statusCode = 400;
    throw err;
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    const err = new Error("COUPON_USAGE_EXCEEDED");
    err.statusCode = 400;
    throw err;
  }

  const discountAmount = computeDiscount(coupon, amount);
  return {
    coupon,
    discountAmount,
    finalAmount: Math.max(0, amount - discountAmount),
  };
};

export const markCouponUsed = async (couponId, userId) => {
  if (!couponId) return;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;

  const query = {
    _id: couponId,
    ...(coupon.maxUses ? { usedCount: { $lt: coupon.maxUses } } : {}),
    ...(userId ? { usedUsers: { $ne: userId } } : {}),
  };

  const update = {
    $addToSet: { usedUsers: userId },
    $inc: { usedCount: 1 },
  };

  const updated = await Coupon.findOneAndUpdate(query, update, { new: true });
  if (!updated) {
    const err = new Error("COUPON_ALREADY_USED");
    err.statusCode = 400;
    throw err;
  }
};

export const revertCouponUsage = async (couponId, userId) => {
  if (!couponId) return;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;

  const dec = coupon.usedCount && coupon.usedCount > 0 ? -1 : 0;
  const update = {
    ...(dec ? { $inc: { usedCount: dec } } : {}),
    ...(userId ? { $pull: { usedUsers: userId } } : {}),
  };
  if (!Object.keys(update).length) return;

  await Coupon.findByIdAndUpdate(couponId, update, { new: true });
};

export const validateCouponForReservation = async (userId, reservation) => {
  if (!reservation.couponId) return null;
  const coupon = await Coupon.findById(reservation.couponId);
  if (!coupon) {
    const err = new Error("COUPON_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!coupon.isAvailableForUser(userId, new Date())) {
    const err = new Error("COUPON_NOT_AVAILABLE");
    err.statusCode = 400;
    throw err;
  }

  if (coupon.minAmount && reservation.basePrice < coupon.minAmount) {
    const err = new Error("COUPON_MIN_AMOUNT_NOT_MET");
    err.statusCode = 400;
    throw err;
  }

  const expectedDiscount = computeDiscount(coupon, reservation.basePrice);
  if (expectedDiscount !== reservation.discountAmount) {
    const err = new Error("COUPON_AMOUNT_MISMATCH");
    err.statusCode = 400;
    throw err;
  }

  const expectedTotal = Math.max(0, reservation.basePrice - expectedDiscount);
  if (expectedTotal !== reservation.totalPrice) {
    const err = new Error("COUPON_TOTAL_MISMATCH");
    err.statusCode = 400;
    throw err;
  }

  return coupon;
};
