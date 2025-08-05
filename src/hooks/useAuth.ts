import { useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser extends User {
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('plan_type, subscription_status')
            .eq('id', session.user.id)
            .single();

          setUser({
            ...session.user,
            planType: profile?.plan_type,
            subscriptionStatus: profile?.subscription_status
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('plan_type, subscription_status')
            .eq('id', session.user.id)
            .single();

          setUser({
            ...session.user,
            planType: profile?.plan_type,
            subscriptionStatus: profile?.subscription_status
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      await signUp(email, password, fullName);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
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