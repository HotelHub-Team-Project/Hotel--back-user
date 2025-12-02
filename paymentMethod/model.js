import mongoose from "mongoose";
import { userConnection } from "../config/db.js";

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["manual"], default: "manual" },
    nickname: { type: String, trim: true },
    cardBrand: { type: String },
    cardLast4: { type: String, required: true },
    cardNumberMasked: { type: String, required: true },
    cardExpirationMonth: { type: String, required: true },
    cardExpirationYear: { type: String, required: true },
    cardHolder: { type: String, trim: true },
    country: { type: String, trim: true },
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
  },
});

export const PaymentMethod = userConnection.model(
  "PaymentMethod",
  paymentMethodSchema
);
export default PaymentMethod;
