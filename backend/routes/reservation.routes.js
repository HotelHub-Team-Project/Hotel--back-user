import express from 'express';
import { createReservation, getReservation } from '../controllers/reservation.controller.js';

const router = express.Router();

// POST /api/reservations
router.post('/', createReservation);

// GET /api/reservations/:id
router.get('/:id', getReservation);

export default router;