/**
 * OTP Controller
 * Handles OTP generation, verification, and rate limiting
 */

import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../config/supabase.js';
import { sendOTPEmail } from '../config/email.js';
import { generateOTP, validateEmailDomain, parseEmailToUSNBranchYear } from '../utils/emailParser.js';

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS || '5');
const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'sit.ac.in';

// In-memory rate limiting (for production, use Redis)
const rateLimitStore = new Map();

/**
 * Check rate limit for email
 * Returns true if rate limit exceeded
 */
const checkRateLimit = (email) => {
  const now = Date.now();
  const userRequests = rateLimitStore.get(email) || [];
  
  // Clean up old requests (older than 1 hour)
  const recentRequests = userRequests.filter(time => now - time < 3600000);
  
  // Check limits: max 5 per hour, max 2 per minute
  const lastMinuteRequests = recentRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 5) {
    return { limited: true, reason: 'Too many OTP requests. Please try again in an hour.' };
  }
  
  if (lastMinuteRequests.length >= 2) {
    return { limited: true, reason: 'Too many OTP requests. Please wait a minute.' };
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(email, recentRequests);
  
  return { limited: false };
};

/**
 * POST /api/send-otp
 * Generate and send OTP to email
 */
export const sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    // Validate input
    if (!email || !purpose) {
      return res.status(400).json({ 
        error: 'Email and purpose are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate purpose
    if (!['signup', 'login', 'forgot'].includes(purpose)) {
      return res.status(400).json({ 
        error: 'Invalid purpose. Must be signup, login, or forgot',
        code: 'INVALID_PURPOSE'
      });
    }

    // Validate email domain
    if (!validateEmailDomain(email, ALLOWED_DOMAIN)) {
      return res.status(400).json({ 
        error: `Only ${ALLOWED_DOMAIN} email addresses are allowed`,
        code: 'INVALID_DOMAIN'
      });
    }

    // Check rate limit
    const rateCheck = checkRateLimit(email);
    if (rateCheck.limited) {
      return res.status(429).json({ 
        error: rateCheck.reason,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // For signup, check if user already exists
    if (purpose === 'signup') {
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser.users.some(u => u.email === email);
      
      if (userExists) {
        return res.status(400).json({ 
          error: 'An account with this email already exists. Please use login instead.',
          code: 'USER_EXISTS'
        });
      }
    }

    // For login/forgot, check if user exists
    if (purpose === 'login' || purpose === 'forgot') {
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser.users.some(u => u.email === email);
      
      if (!userExists) {
        return res.status(400).json({ 
          error: 'No account found with this email. Please sign up first.',
          code: 'USER_NOT_FOUND'
        });
      }
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    console.log(`🔐 Generated OTP for ${email}: ${otp} (${purpose})`);

    // Hash OTP before storing
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Store OTP in database
    const { error: dbError } = await supabaseAdmin
      .from('auth_otp')
      .insert({
        email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        purpose,
        attempts: 0,
        used: false
      });

    if (dbError) {
      console.error('Database error storing OTP:', dbError);
      return res.status(500).json({ 
        error: 'Failed to generate OTP. Please try again.',
        code: 'DB_ERROR'
      });
    }

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, purpose);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails (for development)
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Failed to send verification email. Please try again.',
          code: 'EMAIL_ERROR'
        });
      }
    }

    res.status(200).json({ 
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MINUTES * 60 // seconds
    });

  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * POST /api/verify-otp
 * Verify OTP and create/authenticate user
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    // Validate input
    if (!email || !otp || !purpose) {
      return res.status(400).json({ 
        error: 'Email, OTP, and purpose are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Find most recent valid OTP
    const { data: otpRecords, error: fetchError } = await supabaseAdmin
      .from('auth_otp')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !otpRecords || otpRecords.length === 0) {
      return res.status(400).json({ 
        error: 'No valid OTP found. Please request a new one.',
        code: 'OTP_NOT_FOUND'
      });
    }

    const otpRecord = otpRecords[0];

    // Check attempts
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(400).json({ 
        error: 'Maximum OTP attempts exceeded. Please request a new OTP.',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isValid) {
      // Increment attempts
      await supabaseAdmin
        .from('auth_otp')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      return res.status(400).json({ 
        error: 'Invalid OTP. Please try again.',
        code: 'INVALID_OTP',
        attemptsRemaining: MAX_OTP_ATTEMPTS - otpRecord.attempts - 1
      });
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('auth_otp')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Handle based on purpose
    if (purpose === 'signup') {
      // Create new user
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          email_verified: true,
          signup_method: 'otp'
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ 
          error: 'Failed to create user account',
          code: 'USER_CREATE_ERROR'
        });
      }

      // Parse email for profile data
      const { usn, branch, branchCode, passingYear } = parseEmailToUSNBranchYear(email);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          auth_id: data.user.id,
          email,
          usn,
          branch,
          passing_year: passingYear,
          full_name: '', // To be filled in profile setup
          is_complete: false
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, profile can be created later
      }

      // Generate session token
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (sessionError) {
        console.error('Error generating session:', sessionError);
      }

      return res.status(200).json({ 
        success: true,
        message: 'Account created successfully',
        userId: data.user.id,
        needsProfileSetup: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          usn,
          branch,
          passingYear
        }
      });
    }

    if (purpose === 'login') {
      // Get existing user
      const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        return res.status(400).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if profile is complete
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_complete')
        .eq('id', user.id)
        .single();

      return res.status(200).json({ 
        success: true,
        message: 'Login successful',
        userId: user.id,
        needsProfileSetup: !profile?.is_complete,
        user: {
          id: user.id,
          email: user.email
        }
      });
    }

    if (purpose === 'forgot') {
      // For password reset, we'll return success and let client handle it
      const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        return res.status(400).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      return res.status(200).json({ 
        success: true,
        message: 'OTP verified. You can now reset your password.',
        userId: user.id,
        user: {
          id: user.id,
          email: user.email
        }
      });
    }

    res.status(400).json({ 
      error: 'Invalid purpose',
      code: 'INVALID_PURPOSE'
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

export default {
  sendOTP,
  verifyOTP
};
