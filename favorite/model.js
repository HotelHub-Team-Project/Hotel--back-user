import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// user + hotel 조합으로 중복 방지
favoriteSchema.index({ user: 1, hotel: 1 }, { unique: true });

favoriteSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.favoriteId = ret._id;
    // 프론트 호환용 필드
    ret.userId = ret.user;
    ret.hotelId = ret.hotel;
    delete ret._id;
    delete ret.__v;
  },
});

export const Favorite = dbConnection.model("Favorite", favoriteSchema);
export default Favorite;
