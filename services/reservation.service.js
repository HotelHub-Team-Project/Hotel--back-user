import Reservation from '../models/Reservation.js';

export const createReservation = async (userId, data) => {
    // TODO: 실제 비즈니스 로직 (재고 확인 등) 구현 필요

    // 테스트용 단순 생성 로직
    const reservation = new Reservation({
        ...data,
        userId
    });

    await reservation.save();
    return reservation;
};

export const getReservationById = async (id) => {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
        const error = new Error('예약을 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    return reservation;
};