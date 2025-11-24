import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // "Bearer 토큰값" 에서 토큰만 추출
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // 토큰 속 ID로 유저를 찾아 req.user에 저장 (비밀번호 제외)
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: '인증 실패: 유효하지 않은 토큰입니다.' });
        }
    } else {
        res.status(401).json({ success: false, message: '인증 실패: 토큰이 없습니다.' });
    }
};