import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerBusinessNumber: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // 사용자 한도/중복 사용을 제어할 때 쓰는 내부 필드(관리자 스키마에는 없음)
    maxUses: { type: Number, default: 1 }, // 0이면 무제한
    usedCount: { type: Number, default: 0 }, // 지금까지 사용된 횟수
    usedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // 같은 사용자의 중복 사용을 막고 싶을 때 기록
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

couponSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.couponId = ret._id;
    // 프론트 호환용 필드
    ret.discountType = "amount";
    ret.discountValue = ret.discountAmount;
    ret.minAmount = ret.minOrderAmount;
    delete ret._id;
    delete ret.__v;
  },
});

couponSchema.methods.isAvailableForUser = function (userId, now = new Date()) {
  const isActive = this.isActive !== false;
  const inDateRange =
    (!this.validFrom || this.validFrom <= now) &&
    (!this.validTo || this.validTo >= now);
  const underMaxUses = !this.maxUses || this.usedCount < this.maxUses;
  const notUsedByUser =
    !userId || !this.usedUsers?.some((u) => u.toString() === userId.toString());
  return isActive && inDateRange && underMaxUses && notUsedByUser;
};

export const Coupon = dbConnection.model("Coupon", couponSchema);
export default Coupon;
