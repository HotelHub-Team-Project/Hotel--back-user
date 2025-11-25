import * as paymentService from '../services/payment.service.js';

export const confirmPayment = async (req, res, next) => {
    try {
        const { paymentKey, orderId, amount } = req.body;
        if (!paymentKey || !orderId || !amount) {
            const err = new Error('결제 확인에 필요한 정보가 부족합니다.');
            err.statusCode = 400;
            throw err;
        }

        const result = await paymentService.confirmPayment(paymentKey, orderId, amount);

        res.status(200).json({
            success: true,
            message: '결제가 확인되었습니다.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const cancelPayment = async (req, res, next) => {
    try {
        const { paymentKey, cancelReason = '사용자 취소' } = req.body;
        if (!paymentKey) {
            const err = new Error('paymentKey는 필수입니다.');
            err.statusCode = 400;
            throw err;
        }

        const result = await paymentService.cancelPayment(paymentKey, cancelReason);

        res.status(200).json({
            success: true,
            message: '결제가 취소되었습니다.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
