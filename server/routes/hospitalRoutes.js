import express from 'express';
import { getApprovedHospitals, getAllHospitals, getHospitalProfile, updateHospitalProfile, approveHospital, rejectHospital } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { body } from 'express-validator';

const router = express.Router();

router.get('/', getApprovedHospitals);
router.get('/all', protect, authorize('admin'), getAllHospitals);
router.get('/profile', protect, authorize('hospital'), getHospitalProfile);
router.put('/profile', protect, authorize('hospital'), [
  body('name').optional().trim().notEmpty().withMessage('Hospital name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty')
], validate, updateHospitalProfile);
router.patch('/:id/approve', protect, authorize('admin'), approveHospital);
router.patch('/:id/reject', protect, authorize('admin'), rejectHospital);

export default router;
