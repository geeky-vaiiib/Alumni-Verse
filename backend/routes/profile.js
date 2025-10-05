/**
 * Profile Routes
 * Handles profile CRUD and avatar uploads
 */

import express from 'express';
import multer from 'multer';
import { verifySupabaseJWT } from '../middleware/auth.js';
import { 
  createProfile, 
  updateProfile, 
  getProfile, 
  uploadAvatar 
} from '../controllers/profileController.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/profile/create
 * Create a new profile (no auth required for initial creation)
 * 
 * Body:
 *   - auth_id: string (required) - Supabase auth user ID
 *   - email: string (required)
 *   - full_name: string
 *   - bio: string
 *   - location: string
 *   - current_company: string
 *   - linkedin: string
 *   - github: string
 *   - leetcode: string
 *   - avatar_url: string
 */
router.post('/create', createProfile);

/**
 * PUT /api/profile/update
 * Update existing profile (requires authentication)
 * 
 * Body: Any profile fields to update
 */
router.put('/update', verifySupabaseJWT, updateProfile);

/**
 * GET /api/profile/:userId
 * Get profile by user ID
 */
router.get('/:userId', getProfile);

/**
 * POST /api/profile/upload
 * Upload avatar image (requires authentication)
 * 
 * Body: multipart/form-data with 'avatar' file field
 */
router.post('/upload', verifySupabaseJWT, upload.single('avatar'), uploadAvatar);

export default router;
