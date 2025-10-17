
import React, { useState, useEffect } from 'react';
import * as api from '../../services/apiService';
import Logo from '../ui/Logo';
import InputField from '../ui/InputField';
import { checkPasswordStrength, PasswordStrength } from '../../utils/passwordUtils';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter';

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchToLogin }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, text: '', color: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (step === 2) {
            setPasswordStrength(checkPasswordStrength(newPassword));
        }
    }, [newPassword, step]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await api.apiSendOtp(email);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code. Please check the email address.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordStrength.score < 3) {
            setError("Please choose a stronger password.");
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            // First, verify the OTP
            await api.apiVerifyOtp(email, otp);
            // If OTP is correct, reset the password
            await api.apiForgotPassword(email, newPassword);
            setStep(3);
        } catch (err: any) {
             setError(err.message || 'Failed to reset password. The code may be invalid or expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPasswordWeak = newPassword.length > 0 && passwordStrength.score < 3;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 fade-in aurora-bg">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                   <Logo className="justify-center mb-2"/>
                   <h1 className="text-3xl font-bold text-[var(--text-primary)] font-heading">Reset Password</h1>
                </div>
                
                <div className="glassmorphism p-8 rounded-2xl shadow-2xl">
                    {step === 1 && (
                         <>
                            <p className="text-center text-[var(--text-secondary)] text-sm mb-6">
                                Enter your email address and we'll send you a code to reset your password.
                            </p>
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <InputField id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-cyan)] disabled:opacity-50">
                                    {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                         <form onSubmit={handleResetPassword} className="space-y-6">
                            <p className="text-center text-[var(--text-secondary)] text-sm">
                                We've sent a 6-digit code to <span className="font-medium text-[var(--text-primary)]">{email}</span>.
                            </p>
                            <InputField id="otp" label="Verification Code" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} className="text-center tracking-[0.5em]" disabled={isSubmitting} />
                            <div>
                                <InputField id="new-password" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} disabled={isSubmitting} />
                                <PasswordStrengthMeter strength={passwordStrength} />
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={isSubmitting || isPasswordWeak} className="w-full py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-md hover:brightness-110 disabled:opacity-50">
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                    
                    {step === 3 && (
                        <div className="text-center">
                            <p className="text-[var(--text-primary)] mb-4">Your password has been reset successfully!</p>
                             <button onClick={onSwitchToLogin} className="w-full py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-md hover:brightness-110">
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                    Remember your password?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-[var(--accent-cyan)] hover:underline focus:outline-none">Log in</button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
