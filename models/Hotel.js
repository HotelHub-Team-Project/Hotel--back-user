// models/Hotel.js
import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // 리뷰 평점 계산을 위한 필드 (미리 넣어두면 편함)
    totalRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Hotel', hotelSchema);