import express from 'express';
import { listFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 내 찜 목록
router.get('/', protect, listFavorites);

// 찜 추가
router.post('/', protect, addFavorite);

// 찜 삭제
router.delete('/:id', protect, removeFavorite);

export default router;
