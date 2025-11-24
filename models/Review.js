// models/Review.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const reviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    // 예약 1건당 리뷰 1개만 가능 (unique: true)
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [String], // 이미지 URL 배열
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);