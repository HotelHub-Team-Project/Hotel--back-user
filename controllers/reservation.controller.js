import * as reservationService from '../services/reservation.service.js';

export const createReservation = async (req, res, next) => {
    try {
        // TODO: Auth 미들웨어 연동 후 req.user.id 사용
        const userId = "temp_user_id_for_test";
        const reservationData = req.body;

        const newReservation = await reservationService.createReservation(userId, reservationData);

        res.status(201).json({
            success: true,
            data: newReservation
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