import axios from 'axios';
import Payment from '../models/Payment.js';

export const confirmPayment = async (paymentKey, orderId, amount) => {
    try {
        // 1. 시크릿 키 인코딩 (Basic Auth)
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey = 'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

        // 2. Toss API 호출
        const response = await axios.post(
            'https://api.tosspayments.com/v1/payments/confirm',
            {
                paymentKey,
                orderId,
                amount,
            },
            {
                headers: {
                    Authorization: encryptedSecretKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        // 3. DB 저장
        const paymentData = response.data;

        const payment = new Payment({
            reservationId: null, // 테스트 중이라 null
            orderId: paymentData.orderId,
            paymentKey: paymentData.paymentKey,
            amount: paymentData.totalAmount,
            status: 'PAID',
        });

        await payment.save();

        return paymentData;

    } catch (error) {
        console.error('Toss Payment Error:', error.response?.data || error.message);
        // Toss에서 보낸 에러 메시지를 그대로 클라이언트에 전달
        throw new Error(error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
    }
};