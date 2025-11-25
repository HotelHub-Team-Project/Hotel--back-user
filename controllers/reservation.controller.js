// controllers/reservation.controller.js
import * as reservationService from '../services/reservation.service.js';
import Reservation from '../models/Reservation.js';
import Payment from '../models/Payment.js';
import * as paymentService from '../services/payment.service.js';

// @desc    예약 생성
// @route   POST /api/reservations
export const createReservation = async (req, res, next) => {
    try {
        // [수정됨] 토큰에서 로그인한 유저 ID 가져오기
        // authMiddleware가 req.user를 설정해줍니다.
        // 더 이상 body에서 userId를 받지 않습니다.
        const userId = req.user._id;
        const reservationData = req.body;

        // 서비스 호출
        const newReservation = await reservationService.createReservation(userId, reservationData);

        res.status(201).json({
            success: true,
            message: '예약이 생성되었습니다. 결제를 진행해주세요.',
            data: {
                // Toss 결제창의 orderId로 사용될 예약 ID
                reservationId: newReservation._id,
                ...newReservation.toObject()
            }
        });
    } catch (error) {
        next(error);
    }
};

// [추가됨] 내 예약 목록 조회
// @route   GET /api/reservations/my
export const getMyReservations = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 내 ID로 예약된 목록 조회
        // populate를 사용하여 참조된 Hotel, Room 정보를 함께 가져옵니다.
        const reservations = await Reservation.find({ userId })
            .populate('hotelId', 'name address') // Hotel 모델의 name, address 필드 가져오기
            .populate('roomId', 'name type')     // Room 모델의 name, type 필드 가져오기
            .sort({ createdAt: -1 });            // 최신순 정렬

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    예약 상세 조회
// @route   GET /api/reservations/:id
export const getReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findOne({ _id: id, userId: req.user._id });
        if (!reservation) {
            const err = new Error('예약을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    예약 취소
// @route   POST /api/reservations/:id/cancel
export const cancelReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { cancelReason = '사용자 취소' } = req.body;

        const reservation = await Reservation.findOne({ _id: id, userId });
        if (!reservation) {
            const err = new Error('취소할 예약을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }

        if (reservation.status === 'cancelled') {
            return res.status(200).json({
                success: true,
                message: '이미 취소된 예약입니다.',
                data: reservation
            });
        }

        let paymentResult;
        if (reservation.paymentId) {
            const payment = await Payment.findById(reservation.paymentId);
            if (payment?.paymentKey) {
                paymentResult = await paymentService.cancelPayment(payment.paymentKey, cancelReason);
                payment.status = 'CANCELLED';
                payment.canceledAt = new Date();
                await payment.save();
            }
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.status(200).json({
            success: true,
            message: '예약이 취소되었습니다.',
            data: {
                reservation,
                payment: paymentResult
            }
        });
    } catch (error) {
        next(error);
    }
};
