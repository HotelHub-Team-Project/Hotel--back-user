import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';
import Hotel from '../models/Hotel.js';

// 리뷰 작성: confirmed 예약만 허용
export const createReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { reservationId, hotelId, rating, comment, images } = req.body;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation || reservation.status !== 'confirmed') {
            const err = new Error('확정된 예약에 대해서만 리뷰를 작성할 수 있습니다.');
            err.statusCode = 400;
            throw err;
        }
        if (reservation.userId.toString() !== userId.toString()) {
            const err = new Error('본인 예약이 아닙니다.');
            err.statusCode = 403;
            throw err;
        }

        const review = await Review.create({
            userId,
            reservationId,
            hotelId,
            rating,
            comment,
            images
        });

        // 호텔 평점 갱신
        const hotel = await Hotel.findById(hotelId);
        if (hotel) {
            const newCount = (hotel.ratingCount || 0) + 1;
            const newAvg = ((hotel.ratingAverage || 0) * (hotel.ratingCount || 0) + rating) / newCount;
            hotel.ratingAverage = newAvg;
            hotel.ratingCount = newCount;
            await hotel.save();
        }

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

// 리뷰 목록 조회 (호텔별 필터)
export const getReviews = async (req, res, next) => {
    try {
        const { hotelId } = req.query;
        const query = {};
        if (hotelId) query.hotelId = hotelId;

        const reviews = await Review.find(query)
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        next(error);
    }
};
