import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    reservationId: { type: Schema.Types.ObjectId, ref: "Reservation" },
    paymentKey: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PAID", "CANCELLED", "FAILED"],
      default: "PAID",
    },
    canceledAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

paymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.paymentId = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Payment = dbConnection.model("Payment", paymentSchema);
export default Payment;
