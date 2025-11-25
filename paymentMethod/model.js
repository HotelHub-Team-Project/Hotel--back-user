import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["toss"], default: "toss" },
    billingKey: { type: String, required: true },
    cardBrand: { type: String },
    cardIssuer: { type: String },
    cardLast4: { type: String },
    cardNumberMasked: { type: String },
    cardType: { type: String }, // credit/debit 등
    country: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

paymentMethodSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.paymentMethodId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.billingKey; // 민감 토큰은 숨김
  },
});

export const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
export default PaymentMethod;
