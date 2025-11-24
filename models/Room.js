import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true }, // 예: 디럭스 룸
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    // ... 재고 관련 필드는 나중에 협의
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
