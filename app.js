import 'dotenv/config'; // .env 파일 로드
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js'; // .js 확장자 필수

// [중요] 모델들을 가장 먼저 로딩하여 Mongoose에 등록시킴
// 이렇게 하면 이후 컨트롤러나 서비스에서 populate('Hotel') 등을 쓸 때 에러가 안 납니다.
import './models/index.js';

import apiRoutes from './routes/index.js';
import errorHandler from './middlewares/error.handler.js';

const app = express();

// 1. 데이터베이스 연결
connectDB();

// 2. 미들웨어 설정
app.use(cors({
    origin: process.env.FRONT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// 3. 라우팅
app.use('/api', apiRoutes);

// 4. 헬스 체크
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

// 5. 전역 에러 핸들링
app.use(errorHandler);

// 6. 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});