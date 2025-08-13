import { API_BASE_URL } from '../config/api';

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, fullName })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  
  return data;
};

export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  
  return data;
};

export const signOut = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
  
  localStorage.removeItem('auth_token');
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return null;
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    localStorage.removeItem('auth_token');
    return null;
  }
  
  const data = await response.json();
  return data.user;
};

// Session management
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};