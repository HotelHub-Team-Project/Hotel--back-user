import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

// 호텔 목록 검색/필터
export const listHotels = async (req, res, next) => {
    try {
        const { city, guests } = req.query;
        const query = { status: 'approved' }; // 승인된 호텔만 노출
        if (city) query.city = city;

        // guests 필터: 수용 가능한 방이 있는 호텔만
        if (guests) {
            const rooms = await Room.find({ capacity: { $gte: Number(guests) }, status: 'active' }).distinct('hotel');
            query._id = { $in: rooms };
        }

        const hotels = await Hotel.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: hotels.length, data: hotels });
    } catch (error) {
        next(error);
    }
};

// 호텔 상세 + 객실/리뷰 간단 포함
export const getHotelDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            const err = new Error('호텔을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }

        const rooms = await Room.find({ hotel: id, status: 'active' }).sort({ price: 1 });
        const reviews = await Review.find({ hotelId: id }).populate('userId', 'name');

        res.status(200).json({
            success: true,
            data: {
                hotel,
                rooms,
                reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

// 특정 호텔의 객실 목록
export const listRoomsByHotel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rooms = await Room.find({ hotel: id, status: 'active' }).sort({ price: 1 });
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        next(error);
    }
};

// 전체 객실 목록 (필터 포함)
export const listRooms = async (req, res, next) => {
    try {
        const { hotelId, guests } = req.query;
        const query = { status: 'active' };
        if (hotelId) query.hotel = hotelId;
        if (guests) query.capacity = { $gte: Number(guests) };

        const rooms = await Room.find(query).sort({ price: 1 });
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        next(error);
    }
};
