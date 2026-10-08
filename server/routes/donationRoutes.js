import express from 'express';
import { createDonation, getMyDonations, getHospitalDonations, verifyDonation, rejectDonation, collectDonation } from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.post('/', protect, authorize('donor'), [
  body('hospital').isMongoId().withMessage('Hospital ID is invalid'),
  body('quantityMl').isFloat({ min: 1 }).withMessage('Quantity must be at least 1ml')
], validate, createDonation);

router.get('/my', protect, authorize('donor'), getMyDonations);
router.get('/hospital', protect, authorize('hospital'), getHospitalDonations);
router.patch('/:id/verify', protect, authorize('hospital'), param('id').isMongoId(), validate, verifyDonation);
router.patch('/:id/reject', protect, authorize('hospital'), [
  param('id').isMongoId(),
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required')
], validate, rejectDonation);
router.patch('/:id/collect', protect, authorize('hospital'), [
  param('id').isMongoId(),
  body('quantityMl').isFloat({ min: 1 }).withMessage('Collected quantity must be at least 1ml')
], validate, collectDonation);

export default router;
