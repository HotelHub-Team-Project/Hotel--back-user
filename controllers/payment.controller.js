import * as paymentService from '../services/payment.service.js';

export const confirmPayment = async (req, res, next) => {
    try {
        const { paymentKey, orderId, amount } = req.body;

        if (!paymentKey || !orderId || !amount) {
            throw new Error('결제 승인에 필요한 정보가 부족합니다.');
        }

        const result = await paymentService.confirmPayment(paymentKey, orderId, amount);

        res.status(200).json({
            success: true,
            message: '결제가 성공적으로 승인되었습니다.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};