/**
 * Profile Controller
 * Handles profile CRUD operations and avatar uploads
 */

import { supabaseAdmin } from '../config/supabase.js';
import { parseEmailToUSNBranchYear } from '../utils/emailParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/profile/create
 * Create a new profile
 */
export const createProfile = async (req, res) => {
  try {
    const { 
      auth_id, 
      email, 
      full_name,
      bio,
      location,
      current_company,
      linkedin,
      github,
      leetcode,
      avatar_url
    } = req.body;

    // Validate required fields
    if (!auth_id || !email) {
      return res.status(400).json({ 
        error: 'auth_id and email are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Parse email for USN, branch, passing year
    const { usn, branch, passingYear } = parseEmailToUSNBranchYear(email);

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', auth_id)
      .single();

    if (existingProfile) {
      return res.status(400).json({ 
        error: 'Profile already exists',
        code: 'PROFILE_EXISTS'
      });
    }

    // Create profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: auth_id,
        auth_id,
        email,
        usn,
        branch,
        passing_year: passingYear,
        full_name: full_name || '',
        bio: bio || null,
        location: location || null,
        current_company: current_company || null,
        linkedin: linkedin || null,
        github: github || null,
        leetcode: leetcode || null,
        avatar_url: avatar_url || null,
        is_complete: !!full_name
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return res.status(500).json({ 
        error: 'Failed to create profile',
        code: 'DB_ERROR',
        details: error.message
      });
    }

    res.status(201).json({ 
      success: true,
      message: 'Profile created successfully',
      profile
    });

  } catch (error) {
    console.error('Error in createProfile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * PUT /api/profile/update
 * Update existing profile (requires authentication)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.auth_id;
    delete updates.email;
    delete updates.usn;
    delete updates.created_at;

    // If full_name is provided, mark profile as complete
    if (updates.full_name && updates.full_name.trim()) {
      updates.is_complete = true;
    }

    // Update profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ 
        error: 'Failed to update profile',
        code: 'DB_ERROR',
        details: error.message
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * GET /api/profile/:userId
 * Get profile by user ID
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    res.status(200).json({ 
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * POST /api/profile/upload
 * Upload avatar image to Supabase Storage
 */
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload avatar',
        code: 'UPLOAD_ERROR',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError);
      // Continue anyway, we have the URL
    }

    res.status(200).json({ 
      success: true,
      message: 'Avatar uploaded successfully',
      avatar_url: publicUrl
    });

  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

export default {
  createProfile,
  updateProfile,
  getProfile,
  uploadAvatar
};
