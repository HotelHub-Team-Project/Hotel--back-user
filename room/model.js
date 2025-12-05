import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    inventory: { type: Number, required: true, min: 0, default: 1 },
    images: [{ type: String, trim: true }],
    amenities: [{ type: String, trim: true }],
    status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.roomId = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Room = dbConnection.model("Room", roomSchema);
export default Room;
