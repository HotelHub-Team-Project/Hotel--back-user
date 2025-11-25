import express from 'express';
import { listRooms } from '../controllers/hotel.controller.js';

const router = express.Router();

// 전체 객실 목록 (필터 가능)
router.get('/', listRooms);

export default router;
