import express from 'express';
import { getStats, exportReport, getUsers, toggleUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/reports/export', protect, authorize('admin'), exportReport);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/toggle', protect, authorize('admin'), toggleUser);

export default router;
