import { User, Message } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vsai.com/api';
const OTP_API_BASE_URL = process.env.NEXT_PUBLIC_OTP_API_BASE_URL || 'https://otp.vsai.com/api';

const getAuthToken = () => localStorage.getItem('vsai-token');

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('API Error:', data);
    throw new Error(data.message || 'An unexpected error occurred');
  }
  return data;
};

// --- Auth ---
export const apiLogin = async (credentials: Pick<User, 'email' | 'password'>) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const apiSignup = async (userData: Omit<User, 'id'>) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const apiGoogleLogin = async (userData: { email: string; name?: string }) => {
  const response = await fetch(`${API_BASE_URL}/google-login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const apiGetMe = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token missing');
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const apiUpdateUser = async (email: string, userData: Partial<User>) => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify({ email, ...userData }),
  });
  return handleResponse(response);
};

export const apiDeleteUser = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'DELETE',
    headers: defaultHeaders,
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const apiForgotPassword = async (email: string, newPassword?: string) => {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email, newPassword }),
  });
  return handleResponse(response);
};

// --- OTP ---
export const apiSendOtp = async (email: string) => {
  const response = await fetch(`${OTP_API_BASE_URL}/send-otp`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const apiVerifyOtp = async (email: string, code: string) => {
  const response = await fetch(`${OTP_API_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email, code }),
  });
  return handleResponse(response);
};

// --- Chat History ---
export const apiGetChatHistory = async (email: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/chat-history/${email}`, {
    headers: defaultHeaders,
  });
  const data = await handleResponse(response);
  return data.history || [];
};

export const apiSaveChatHistory = async (email: string, messages: Message[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat-history`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email, history: messages }),
  });
  await handleResponse(response);
};

export const apiClearChatHistory = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat-history/${email}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  await handleResponse(response);
};