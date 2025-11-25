import mongoose from 'mongoose';

const { Schema } = mongoose;

const favoriteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// 같은 사용자가 같은 호텔을 중복 찜하지 못하도록 유니크 인덱스 구성
favoriteSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

favoriteSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.favoriteId = ret._id; // 가독성용 alias
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model('Favorite', favoriteSchema);
