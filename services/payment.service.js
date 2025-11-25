// services/payment.service.js
import axios from 'axios';
import Payment from '../models/Payment.js';
import Reservation from '../models/Reservation.js';

export const confirmPayment = async (paymentKey, orderId, amount) => {
    try {
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey = 'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

        const response = await axios.post(
            'https://api.tosspayments.com/v1/payments/confirm',
            { paymentKey, orderId, amount },
            { headers: { Authorization: encryptedSecretKey, 'Content-Type': 'application/json' } }
        );

        const paymentData = response.data;

        // orderId로 예약 찾기 (프런트에서 reservationId를 orderId로 전달)
        const reservation = await Reservation.findById(orderId);
        if (!reservation) {
            throw new Error('결제는 완료되었으나, 해당 예약을 찾을 수 없습니다.');
        }

        const payment = new Payment({
            reservationId: reservation._id,
            orderId: paymentData.orderId,
            paymentKey: paymentData.paymentKey,
            amount: paymentData.totalAmount,
            status: 'PAID',
        });
        await payment.save();

        reservation.status = 'confirmed';
        reservation.paymentId = payment._id;
        await reservation.save();

        return paymentData;
    } catch (error) {
        console.error('Toss Payment Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
    }
};

export const cancelPayment = async (paymentKey, cancelReason = '사용자 취소') => {
    try {
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey = 'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

        const response = await axios.post(
            `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
            { cancelReason },
            { headers: { Authorization: encryptedSecretKey, 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('Toss Payment Cancel Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || '결제 취소 중 오류가 발생했습니다.');
    }
};
