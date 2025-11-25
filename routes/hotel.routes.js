import express from 'express';
import { listHotels, getHotelDetail, listRoomsByHotel, listRooms } from '../controllers/hotel.controller.js';

const router = express.Router();

// 호텔 목록 조회 (검색/필터)
router.get('/', listHotels);

// 전체 객실 목록 (옵션 필터)
router.get('/rooms', listRooms);

// 특정 호텔의 객실 목록
router.get('/:id/rooms', listRoomsByHotel);

// 호텔 상세 조회
router.get('/:id', getHotelDetail);

export default router;
