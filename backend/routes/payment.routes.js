import express from 'express';
const router = express.Router();

// 임시 라우트 (에러 방지용)
router.get('/', (req, res) => res.send('Payment Route OK'));

export default router;