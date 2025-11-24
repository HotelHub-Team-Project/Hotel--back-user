import Reservation from '../models/Reservation.js';

// 예약 생성
export const createReservation = async (userId, data) => {
    // 1. 예약 데이터 준비
    const reservation = new Reservation({
        ...data,
        userId, // 로그인한 사용자 ID
        status: 'pending', // 기본 상태: '결제 대기'
    });

    // 2. DB 저장
    await reservation.save();
    return reservation;
};

// 예약 조회 (ID로)
export const getReservationById = async (id) => {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
        const error = new Error('예약을 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }
    return reservation;
};