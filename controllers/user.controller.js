import User from '../models/User.js';

// @desc    사업자 전환 신청
// @route   POST /api/users/business-apply
export const applyBusiness = async (req, res, next) => {
    try {
        const { businessName, businessNumber, bankAccount } = req.body;
        const userId = req.user._id; // auth middleware에서 설정

        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.statusCode = 404;
            throw error;
        }

        // 이미 사업자(owner)인 경우
        if (user.role === 'owner') {
            const error = new Error('이미 사업자로 등록된 계정입니다.');
            error.statusCode = 400;
            throw error;
        }

        // User 모델에 businessInfo, businessStatus 필드가 없으면 에러날 수 있음.
        // (User 모델에 해당 필드가 추가되어 있다고 가정합니다)
        user.businessInfo = { businessName, businessNumber, bankAccount };
        user.businessStatus = 'pending'; // 승인 대기 상태

        await user.save();

        res.status(200).json({
            success: true,
            message: '사업자 신청이 완료되었습니다. 관리자 승인을 기다려주세요.',
            data: {
                email: user.email,
                businessStatus: user.businessStatus
            }
        });
    } catch (error) {
        next(error);
    }
};