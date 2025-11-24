// controllers/auth.controller.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// 토큰 생성 함수 (JWT)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '30d',
    });
};

// @desc    회원가입
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('이미 존재하는 이메일입니다.');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.create({ name, email, password, phone });

        res.status(201).json({
            success: true,
            message: '회원가입 성공',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    로그인
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                success: true,
                message: '로그인 성공',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id), // 이 토큰을 프론트엔드가 저장해서 씁니다.
                },
            });
        } else {
            const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            error.statusCode = 401;
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

// @desc    내 정보 조회 (마이페이지)
// @route   GET /api/auth/me
export const getMyProfile = async (req, res, next) => {
    try {
        // authMiddleware를 통과했다면 req.user에 유저 정보가 있습니다.
        const user = req.user;

        res.status(200).json({
            success: true,
            message: '내 정보를 성공적으로 조회했습니다.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                // User 모델에 businessStatus 필드가 있다면 추가 (사업자 신청 상태 확인용)
                businessStatus: user.businessStatus
            },
        });
    } catch (error) {
        next(error);
    }
};