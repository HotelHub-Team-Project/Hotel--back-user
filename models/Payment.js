// models/Payment.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const paymentSchema = new Schema({
    // [토스연동 임시] required: true -> false로 변경함
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: false },
    paymentKey: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PAID', 'CANCELLED', 'FAILED'], default: 'PAID' },
    canceledAt: { type: Date }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

paymentSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.paymentId = ret._id; // 가독성용 alias
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model('Payment', paymentSchema);
