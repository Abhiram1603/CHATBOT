
import React, { useState, useEffect, useCallback } from 'react';
import ChatPage from './components/pages/ChatPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import ProfilePage from './components/pages/ProfilePage';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { User } from './types';
import * as api from './services/apiService';

type AuthState = 'login' | 'signup' | 'forgot_password';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('vsai-theme');
        return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authState, setAuthState] = useState<AuthState>('login');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('vsai-theme', theme);
    }, [theme]);

    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('vsai-token');
            if (token) {
                try {
                    const data = await api.apiGetMe();
                    setCurrentUser(data.user);
                } catch (error) {
                    console.error("Session validation failed:", error);
                    localStorage.removeItem('vsai-token');
                }
            }
            setIsLoading(false);
        };

        validateSession();
    }, []);

    const handleLogin = (data: { token: string; user: User }) => {
        localStorage.setItem('vsai-token', data.token);
        setCurrentUser(data.user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('vsai-token');
        setAuthState('login');
    };
    
    const handleUpdateUser = async (updatedUser: Partial<User>) => {
        if (!currentUser) return;
        try {
            const result = await api.apiUpdateUser(currentUser.email, updatedUser);
            setCurrentUser(result.user);
        } catch (error) {
            console.error("Failed to update user:", error);
            // Optionally show an error message to the user
        }
    };
    
    const handleDeleteUser = async () => {
        if (!currentUser) return;
        try {
            await api.apiDeleteUser(currentUser.email);
            handleLogout();
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    if (isLoading) {
        return <div className="h-screen w-screen bg-[var(--bg-primary)]" />;
    }

    return (
        <ErrorBoundary>
            <div className={`app-container font-sans bg-grid ${theme}`}>
                {!currentUser ? (
                    <>
                        {authState === 'login' && <LoginPage onLoginSuccess={handleLogin} onSwitchToSignup={() => setAuthState('signup')} onSwitchToForgotPassword={() => setAuthState('forgot_password')} />}
                        {authState === 'signup' && <SignupPage onSignupSuccess={handleLogin} onSwitchToLogin={() => setAuthState('login')} />}
                        {authState === 'forgot_password' && <ForgotPasswordPage onSwitchToLogin={() => setAuthState('login')} />}
                    </>
                ) : (
                    <>
                        <ChatPage
                            currentUser={currentUser}
                            onLogout={handleLogout}
                            onOpenProfile={() => setIsProfileOpen(true)}
                            theme={theme}
                            onThemeChange={setTheme}
                        />
                        {isProfileOpen && (
                            <ProfilePage
                                user={currentUser}
                                onClose={() => setIsProfileOpen(false)}
                                onUpdate={handleUpdateUser}
                                onDelete={handleDeleteUser}
                            />
                        )}
                    </>
                )}
            </div>
            <style>{`
                .app-container {
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .bg-grid {
                   background-image:
                        linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
                   background-size: 40px 40px;
                }
            `}</style>
        </ErrorBoundary>
    );
};

export default App;
