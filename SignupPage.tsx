

import React, { useState, useEffect } from 'react';
import * as api from '../../services/apiService';
import { User } from '../../types';
import Logo from '../ui/Logo';
import InputField from '../ui/InputField';
import { GoogleIcon } from '../ui/Icons';
import { checkPasswordStrength, PasswordStrength } from '../../utils/passwordUtils';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter';


interface SignupPageProps {
  // FIX: Changed onSignupSuccess to expect an object with token and user
  onSignupSuccess: (data: { token: string; user: User }) => void;
  onSwitchToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, text: '', color: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(password));
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordStrength.score < 3) {
            setError("Please choose a stronger password.");
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            const newUser: Omit<User, 'id'> = { name, email, password };
            const data = await api.apiSignup(newUser);
            // FIX: Pass the entire data object which includes token and user
            onSignupSuccess(data);
        } catch (err: any) {
             setError(err.message || 'Signup failed. An account with this email may already exist.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGoogleSignup = () => {
        window.location.href = 'http://localhost:5002/auth/google';
    };
    
    const isPasswordWeak = password.length > 0 && passwordStrength.score < 3;


    return (
        <div className="min-h-screen flex items-center justify-center p-4 fade-in aurora-bg">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                   <Logo className="justify-center mb-2"/>
                   <h1 className="text-3xl font-bold text-[var(--text-primary)] font-heading">Create Account</h1>
                   <p className="text-[var(--text-secondary)]">Join VSAI and start exploring.</p>
                </div>
                
                <div className="glassmorphism p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} autoComplete="name" />
                        <InputField id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} autoComplete="email"/>
                        <div>
                            <InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} disabled={isSubmitting} autoComplete="new-password" />
                            <PasswordStrengthMeter strength={passwordStrength} />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button type="submit" disabled={isSubmitting || isPasswordWeak} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-cyan)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                     <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-primary)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Or sign up with</span>
                            </div>
                        </div>
                        <div className="mt-6">
                             <button
                                onClick={handleGoogleSignup}
                                className="w-full inline-flex justify-center items-center py-2 px-4 border border-[var(--border-primary)] rounded-md shadow-sm bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-cyan)] transition-colors"
                            >
                                <GoogleIcon />
                                <span className="ml-2">Sign up with Google</span>
                            </button>
                        </div>
                    </div>
                </div>

                 <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-[var(--accent-cyan)] hover:underline focus:outline-none">Log in</button>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;