import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const { Schema } = mongoose;

const hotelSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    location: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    amenities: [{ type: String, trim: true }],
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    basePrice: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

hotelSchema.index({ city: 1, status: 1 });

hotelSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.hotelId = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Hotel = dbConnection.model("Hotel", hotelSchema);
export default Hotel;
