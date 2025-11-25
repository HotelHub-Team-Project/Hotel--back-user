import Favorite from '../models/Favorite.js';
import Hotel from '../models/Hotel.js';

export const listFavorites = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const favorites = await Favorite.find({ userId })
            .populate('hotelId', 'name city address images ratingAverage ratingCount');
        res.status(200).json({ success: true, count: favorites.length, data: favorites });
    } catch (error) {
        next(error);
    }
};

export const addFavorite = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { hotelId } = req.body;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            const err = new Error('호텔을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }

        const favorite = await Favorite.findOneAndUpdate(
            { userId, hotelId },
            { userId, hotelId },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        if (error.code === 11000) {
            // unique index 충돌 시 이미 존재한다고 안내
            error.statusCode = 409;
            error.message = '이미 찜한 호텔입니다.';
        }
        next(error);
    }
};

export const removeFavorite = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params; // favorite document id
        const deleted = await Favorite.findOneAndDelete({ _id: id, userId });
        if (!deleted) {
            const err = new Error('찜 항목을 찾을 수 없습니다.');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({ success: true, message: '삭제되었습니다.' });
    } catch (error) {
        next(error);
    }
};
