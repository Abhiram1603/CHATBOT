

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import * as api from '../../services/apiService';
import Logo from '../ui/Logo';
import { GoogleIcon } from '../ui/Icons';
import InputField from '../ui/InputField';

interface LoginPageProps {
    // FIX: Changed onLoginSuccess to expect an object with token and user
    onLoginSuccess: (data: { token: string; user: User }) => void;
    onSwitchToSignup: () => void;
    onSwitchToForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToSignup, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleGoogleRedirect = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (token) {
                // Clean the URL immediately to prevent re-triggering
                window.history.replaceState({}, document.title, window.location.pathname);
                setIsSubmitting(true);
                setError('');
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const googleUserData = { email: payload.email, name: payload.name };

                    // Call our main backend to upsert the user and get a proper session token
                    const data = await api.apiGoogleLogin(googleUserData);
                    onLoginSuccess(data); // This data now contains the correct token and user object from our DB
                } catch (e) {
                    setError("Failed to process Google authentication. Please try again.");
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        handleGoogleRedirect();
    }, [onLoginSuccess]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const data = await api.apiLogin({ email, password });
            // FIX: Pass the entire data object which includes token and user
            onLoginSuccess(data);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5002/auth/google';
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4 fade-in aurora-bg">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                   <Logo className="justify-center mb-2"/>
                   <h1 className="text-3xl font-bold text-[var(--text-primary)] font-heading">Welcome Back</h1>
                   <p className="text-[var(--text-secondary)]">Sign in to continue your conversation.</p>
                </div>

                <div className="glassmorphism p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            id="email"
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />

                        <div>
                            <InputField
                                id="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <div className="text-right mt-1">
                                <button type="button" onClick={onSwitchToForgotPassword} className="text-sm text-[var(--accent-cyan)] hover:underline focus:outline-none">Forgot password?</button>
                            </div>
                        </div>


                        {error && <p className="text-red-400 text-sm text-center" role="alert">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-cyan)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                {isSubmitting ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                     <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-primary)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-6">
                             <button
                                onClick={handleGoogleLogin}
                                className="w-full inline-flex justify-center items-center py-2 px-4 border border-[var(--border-primary)] rounded-md shadow-sm bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-cyan)] transition-colors"
                            >
                                <GoogleIcon />
                                <span className="ml-2">Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </div>

                 <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignup} className="font-medium text-[var(--accent-cyan)] hover:underline focus:outline-none">Sign up</button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;