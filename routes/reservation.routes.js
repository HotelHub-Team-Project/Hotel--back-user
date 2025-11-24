import express from 'express';
import { createReservation, getReservation } from '../controllers/reservation.controller.js';

const router = express.Router();

router.post('/', createReservation);
router.get('/:id', getReservation);

export default router;