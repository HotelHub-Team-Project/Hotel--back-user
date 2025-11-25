import Coupon from '../models/Coupon.js';

// 내 사용 가능 쿠폰 목록
export const listAvailableCoupons = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const coupons = await Coupon.find({
            status: 'active',
            $or: [{ userId }, { userId: { $exists: false } }]
        }).sort({ validTo: 1 });

        const available = coupons.filter((c) => c.isAvailableForUser(userId, now));
        res.status(200).json({ success: true, count: available.length, data: available });
    } catch (error) {
        next(error);
    }
};
