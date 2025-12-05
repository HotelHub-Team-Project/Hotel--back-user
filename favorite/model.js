import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

favoriteSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

favoriteSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.favoriteId = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Favorite = dbConnection.model("Favorite", favoriteSchema);
export default Favorite;
