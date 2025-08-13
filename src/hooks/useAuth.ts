import { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  planType?: string;
  subscriptionStatus?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signIn(email, password);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  };
};