/**
 * Auth Page - Complete numeric OTP authentication
 * Implements signup, login, and forgot password flows with backend API
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Sparkles, ArrowLeft, Mail, Key, Shield } from 'lucide-react';
import { OTPInput } from '@/components/auth/OTPInput';
import { parseEmailToUSNBranchYear, validateEmailDomain } from '@/utils/emailParser';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || 'sit.ac.in';

type AuthMode = 'signup' | 'login' | 'forgot';
type Step = 'email' | 'otp';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const validateEmail = (email: string) => {
    if (!validateEmailDomain(email, ALLOWED_DOMAIN)) {
      toast.error(`Please use your institutional email (@${ALLOWED_DOMAIN})`);
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;

    setLoading(true);

    try {
      // Parse email to extract USN, branch, passing year
      const parsed = parseEmailToUSNBranchYear(email);
      setParsedData(parsed);

      // Call backend API to send OTP
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
      setResendCountdown(60);
      toast.success('OTP sent! Check your email (or console in dev mode)');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (completedOTP: string) => {
    setLoading(true);

    try {
      // Call backend API to verify OTP
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: completedOTP,
          purpose: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      toast.success(data.message || 'Verification successful!');

      // For signup, we need to establish a session
      if (mode === 'signup') {
        // Sign in with a temporary password (backend created the user)
        // For now, redirect to profile setup and let user complete it
        setTimeout(() => {
          navigate('/profile-setup', { state: { email, userId: data.userId, parsedData } });
        }, 500);
      } else if (mode === 'login') {
        // For login, check if profile is complete
        if (data.needsProfileSetup) {
          navigate('/profile-setup', { state: { email, userId: data.userId } });
        } else {
          navigate('/dashboard');
        }
      } else if (mode === 'forgot') {
        // For forgot password, show success and redirect to login
        toast.success('Password reset successful! Please login with the new OTP.');
        setTimeout(() => {
          setMode('login');
          setStep('email');
          setOTP('');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Invalid OTP');
      setOTP('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    setOTP('');
    await handleSendOTP({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOTP('');
    setParsedData(null);
  };

  const getTitle = () => {
    if (step === 'otp') return 'Verify Your Identity';
    if (mode === 'signup') return 'Create Account';
    if (mode === 'login') return 'Welcome Back';
    return 'Reset Password';
  };

  const getDescription = () => {
    if (step === 'otp') {
      return `Enter the 6-digit code sent to ${email}`;
    }
    if (mode === 'signup') {
      return 'Join the AlumniVerse community';
    }
    if (mode === 'login') {
      return 'Sign in to your account';
    }
    return 'Recover your account access';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="w-full card-gradient border-border/50 shadow-2xl relative z-10">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-center mb-2">
                {step === 'email' ? (
                  <Sparkles className="h-10 w-10 text-primary" />
                ) : (
                  <Shield className="h-10 w-10 text-primary" />
                )}
              </div>
              <CardTitle className="text-3xl font-bold text-center">
                <span className="text-gradient">{getTitle()}</span>
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                {getDescription()}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Institutional Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={`yourname@${ALLOWED_DOMAIN}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      required
                      className="bg-input border-border focus:border-primary transition-colors"
                      disabled={loading}
                    />
                  </div>

                  {parsedData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-1 text-sm"
                    >
                      <p><strong>USN:</strong> {parsedData.usn}</p>
                      <p><strong>Branch:</strong> {parsedData.branch}</p>
                      <p><strong>Passing Year:</strong> {parsedData.passingYear}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full glow-effect"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'signup' ? 'Sign Up with OTP' : mode === 'login' ? 'Send Login OTP' : 'Send Reset OTP'}
                  </Button>

                  <div className="space-y-2">
                    <div className="text-center">
                      {mode !== 'signup' && (
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className="text-sm text-primary hover:underline"
                        >
                          Don't have an account? Sign Up
                        </button>
                      )}
                      {mode === 'signup' && (
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-sm text-primary hover:underline"
                        >
                          Already have an account? Sign In
                        </button>
                      )}
                    </div>
                    {mode !== 'forgot' && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="flex items-center gap-2 justify-center">
                      <Key className="h-4 w-4" />
                      Enter 6-Digit Code
                    </Label>
                    <OTPInput
                      length={6}
                      value={otp}
                      onChange={setOTP}
                      onComplete={handleVerifyOTP}
                      disabled={loading}
                    />
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={resendCountdown > 0 || loading}
                      className="text-primary"
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToEmail}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Auth;
