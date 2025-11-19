// backend/models/Payment.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const paymentSchema = new Schema({
    // [테스트용 수정] required: true -> false로 변경함
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: false },
    paymentKey: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PAID', 'CANCELLED', 'FAILED'], default: 'PAID' },
    canceledAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);