import express from 'express';
import { createBaby, getBabies, getBaby, updateBaby, deleteBaby } from '../controllers/babyController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { body } from 'express-validator';

const router = express.Router();

router.post('/', protect, authorize('recipient'), [
  body('babyName').notEmpty().withMessage('Baby name is required'),
  body('ageInMonths').isNumeric().withMessage('Age in months is required'),
  body('weightKg').isNumeric().withMessage('Weight in kg is required'),
  body('bloodGroup').notEmpty().withMessage('Blood group is required'),
  body('hospital').optional({ checkFalsy: true }).isMongoId().withMessage('Hospital ID is invalid')
], validate, createBaby);

router.get('/', protect, authorize('recipient'), getBabies);
router.get('/:id', protect, authorize('recipient'), getBaby);
router.put('/:id', protect, authorize('recipient'), updateBaby);
router.delete('/:id', protect, authorize('recipient'), deleteBaby);

export default router;
