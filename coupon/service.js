import { Coupon } from "./model.js";

export const listAvailableCoupons = async (userId) => {
  const now = new Date();

  const coupons = await Coupon.find({
    status: "active",
    $or: [{ userId }, { userId: { $exists: false } }],
  }).sort({ validTo: 1 });

  return coupons.filter((c) => c.isAvailableForUser(userId, now));
};
