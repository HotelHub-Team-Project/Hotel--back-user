import * as reservationService from '../services/reservation.service.js';

export const createReservation = async (req, res, next) => {
    try {
        // [수정됨] "temp_user_id_12345" -> "64b1f2c9e4b0a1a2b3c4d5e6" (유효한 ObjectId 형식)
        // 실제 로그인 구현 전까지는 이 가짜 ID를 사용합니다.
        const userId = req.body.userId || "64b1f2c9e4b0a1a2b3c4d5e6";
        const reservationData = req.body;

        const newReservation = await reservationService.createReservation(userId, reservationData);

        res.status(201).json({
            success: true,
            message: '예약이 생성되었습니다. 결제를 진행해주세요.',
            data: {
                // 중요: 이 _id가 Toss 결제창의 orderId로 사용됩니다!
                reservationId: newReservation._id,
                ...newReservation.toObject()
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await reservationService.getReservationById(id);

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};