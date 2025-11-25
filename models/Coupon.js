import mongoose from 'mongoose';

const { Schema } = mongoose;

const couponSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    description: { type: String },
    discountType: { type: String, enum: ['amount', 'percent'], required: true },
    discountValue: { type: Number, required: true }, // 금액 또는 %
    minAmount: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // 지정 사용자 전용 쿠폰 (없으면 전체 사용 가능)
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

couponSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.couponId = ret._id; // 가독성용 alias
        delete ret._id;
        delete ret.__v;
    }
});

// 사용 가능 여부 체크용 헬퍼
couponSchema.methods.isAvailableForUser = function (userId, now = new Date()) {
    const isActive = this.status === 'active';
    const inDateRange = (!this.validFrom || this.validFrom <= now) && (!this.validTo || this.validTo >= now);
    const matchesUser = !this.userId || this.userId.toString() === userId.toString();
    return isActive && inDateRange && matchesUser;
};

export default mongoose.model('Coupon', couponSchema);
