-- Migration: Create auth_otp table for numeric OTP authentication
-- Purpose: Store hashed OTPs with expiry, rate limiting, and purpose tracking

CREATE TABLE IF NOT EXISTS public.auth_otp (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'forgot')),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS auth_otp_email_idx ON public.auth_otp(email);
CREATE INDEX IF NOT EXISTS auth_otp_expires_at_idx ON public.auth_otp(expires_at);

-- Enable RLS (service role will bypass this, but good practice)
ALTER TABLE public.auth_otp ENABLE ROW LEVEL SECURITY;

-- No public access to OTP table - only backend with service role key
CREATE POLICY "No direct access to OTP table" ON public.auth_otp
  FOR ALL USING (false);

-- Function to clean up expired OTPs (can be called by cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.auth_otp
  WHERE expires_at < NOW() OR used = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON TABLE public.auth_otp IS 'Stores hashed OTPs for email-based authentication (signup, login, password reset)';
COMMENT ON FUNCTION public.cleanup_expired_otps IS 'Removes expired and used OTPs from the database';
