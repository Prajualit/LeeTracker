import express from 'express';
import {
    initiateProfileVerification,
    verifyProfileOwnership,
    getVerificationStatus,
    removeProfileVerification
} from '../controllers/verificationController.js';

const router = express.Router();

// POST /api/v1/verification/initiate - Start profile verification process
router.post('/initiate', initiateProfileVerification);

// POST /api/v1/verification/verify - Verify profile ownership
router.post('/verify', verifyProfileOwnership);

// GET /api/v1/verification/status/:userId - Get verification status
router.get('/status/:userId', getVerificationStatus);

// DELETE /api/v1/verification/remove - Remove profile verification
router.delete('/remove', removeProfileVerification);

export default router;
