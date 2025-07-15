"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; 
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk refresh data user
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser(profile);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Fungsi untuk logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Effect untuk mendengarkan perubahan auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set loading state
        setIsLoading(true)
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session check:', session?.user?.id)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          setUser(profile)
          console.log('Profile loaded:', profile)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Run initialization
    initializeAuth()
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error loading profile:', error);
          setUser(null);
        } else {
          console.log('Profile loaded:', profile);
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};