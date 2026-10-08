import express from 'express';
import { createRequest, getMyRequests, getHospitalRequests, acceptRequest, processRequest, completeRequest, rejectRequest } from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.post('/', protect, authorize('recipient'), [
  body('baby').isMongoId().withMessage('Baby ID is invalid'),
  body('hospital').isMongoId().withMessage('Hospital ID is invalid'),
  body('quantityMl').isFloat({ min: 1 }).withMessage('Quantity must be at least 1ml'),
  body('urgency').optional().isIn(['normal', 'emergency']).withMessage('Invalid urgency')
], validate, createRequest);

router.get('/my', protect, authorize('recipient'), getMyRequests);
router.get('/hospital', protect, authorize('hospital'), getHospitalRequests);
router.patch('/:id/accept', protect, authorize('hospital'), param('id').isMongoId(), validate, acceptRequest);
router.patch('/:id/process', protect, authorize('hospital'), param('id').isMongoId(), validate, processRequest);
router.patch('/:id/complete', protect, authorize('hospital'), param('id').isMongoId(), validate, completeRequest);
router.patch('/:id/reject', protect, authorize('hospital'), [
  param('id').isMongoId(),
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required')
], validate, rejectRequest);

export default router;
