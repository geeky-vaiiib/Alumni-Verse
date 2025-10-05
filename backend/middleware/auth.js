/**
 * Authentication Middleware
 * Verifies Supabase JWT tokens for protected routes
 */

import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Verify Supabase JWT token from Authorization header
 * Attaches user object to req.user if valid
 */
export const verifySupabaseJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token using Supabase admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    req.user = user || null;
    req.token = token;
    
    next();
  } catch (error) {
    // If verification fails, just continue without user
    req.user = null;
    next();
  }
};

export default {
  verifySupabaseJWT,
  optionalAuth
};
