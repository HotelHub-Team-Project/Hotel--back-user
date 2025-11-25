// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
    // 사업자 신청 정보 (optional)
    businessInfo: {
        businessName: { type: String },
        businessNumber: { type: String },
        bankAccount: { type: String }
    },
    // 사업자 신청 상태 관리
    businessStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// 1. 저장 전 비밀번호 암호화 (Pre-save Hook)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 2. 비밀번호 검증 메서드 (로그인 시 사용)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 응답 시 id alias 부여 및 불필요 필드 제거
userSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        ret.userId = ret._id; // 가독성용 alias
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

export default mongoose.model('User', userSchema);
