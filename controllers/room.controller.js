import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';

// 공통: 겹치는 예약이 있는 roomId 구하기
const getReservedRoomIds = async (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return [];

    const overlap = await Reservation.find({
        status: { $nin: ['cancelled'] },
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
    }).select('roomId');

    return overlap.map(r => r.roomId);
};

// @desc    객실 목록 조회 (hotelId 필터 가능)
// @route   GET /api/rooms
export const getRooms = async (req, res, next) => {
    try {
        const { hotelId, guests, checkIn, checkOut } = req.query;

        const reservedRoomIds = await getReservedRoomIds(checkIn, checkOut);

        const filter = { status: 'active' };
        if (hotelId) filter.hotel = hotelId;
        if (guests) filter.capacity = { $gte: Number(guests) };
        if (reservedRoomIds.length) filter._id = { $nin: reservedRoomIds };

        const rooms = await Room.find(filter)
            .populate('hotel', 'name city ratingAverage ratingCount address images')
            .lean();

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms,
        });
    } catch (error) {
        next(error);
    }
};
