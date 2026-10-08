import express from 'express';
import { getAvailability, getHospitalStock } from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/availability', getAvailability);
router.get('/hospital', protect, authorize('hospital'), getHospitalStock);

export default router;
