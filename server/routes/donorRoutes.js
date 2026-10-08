import express from 'express';
import { getAllDonors, getDonorProfile, updateDonorProfile, updateDonorScreening } from '../controllers/donorController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { body } from 'express-validator';

const router = express.Router();

router.get('/', protect, authorize('admin', 'hospital'), getAllDonors);
router.get('/profile', protect, authorize('donor'), getDonorProfile);
router.put('/profile', protect, authorize('donor'), updateDonorProfile);
router.patch('/:id/screening', protect, authorize('hospital'), [
  body('screeningStatus').isIn(['approved', 'rejected']).withMessage('Invalid screening status'),
  body('screeningNote').optional().isString().trim()
], validate, updateDonorScreening);

export default router;
