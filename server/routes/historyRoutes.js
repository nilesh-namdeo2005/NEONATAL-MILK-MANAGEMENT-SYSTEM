import express from 'express';
import { getHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getHistory);

export default router;
