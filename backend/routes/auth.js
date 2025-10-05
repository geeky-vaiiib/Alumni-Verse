/**
 * Authentication Routes
 * Handles OTP-based authentication
 */

import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Send OTP to email for signup, login, or forgot password
 * 
 * Body:
 *   - email: string (required) - SIT institutional email
 *   - purpose: 'signup' | 'login' | 'forgot' (required)
 */
router.post('/send-otp', sendOTP);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user
 * 
 * Body:
 *   - email: string (required)
 *   - otp: string (required) - 6-digit OTP
 *   - purpose: 'signup' | 'login' | 'forgot' (required)
 */
router.post('/verify-otp', verifyOTP);

export default router;
