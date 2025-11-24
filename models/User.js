import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'business', 'admin'], default: 'user' },
    // ... 다른 필드는 나중에 팀원이 추가
}, { timestamps: true });

export default mongoose.model('User', userSchema);