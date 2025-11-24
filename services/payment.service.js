// services/payment.service.js
import axios from 'axios';
import Payment from '../models/Payment.js';
import Reservation from '../models/Reservation.js'; // Reservation 모델 불러오기

export const confirmPayment = async (paymentKey, orderId, amount) => {
    try {
        // 1. Toss API 호출 (결제 승인 요청)
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey = 'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

        const response = await axios.post(
            'https://api.tosspayments.com/v1/payments/confirm',
            { paymentKey, orderId, amount },
            { headers: { Authorization: encryptedSecretKey, 'Content-Type': 'application/json' } }
        );

        const paymentData = response.data;

        // 2. [추가됨] 예약(Reservation) 찾기
        // 클라이언트가 orderId 자리에 예약의 _id를 보냈다고 가정합니다.
        const reservation = await Reservation.findById(orderId);

        if (!reservation) {
            // 결제는 됐는데 예약이 DB에 없는 상황
            throw new Error('결제는 승인되었으나, 해당 예약을 찾을 수 없습니다.');
        }

        // 3. Payment 정보 저장
        const payment = new Payment({
            reservationId: reservation._id, // 진짜 예약 ID 연결
            orderId: paymentData.orderId,
            paymentKey: paymentData.paymentKey,
            amount: paymentData.totalAmount,
            status: 'PAID',
        });
        await payment.save();

        // 4. [추가됨] 예약 상태 'confirmed'로 변경 및 결제 ID 연결
        reservation.status = 'confirmed';
        reservation.paymentId = payment._id;
        await reservation.save();

        return paymentData;

    } catch (error) {
        console.error('Toss Payment Error:', error.response?.data || error.message);
        // Toss에서 보낸 에러 메시지를 그대로 클라이언트에 전달
        throw new Error(error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
    }
};