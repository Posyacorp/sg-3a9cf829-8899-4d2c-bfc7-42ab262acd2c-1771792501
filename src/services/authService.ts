/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
  created_at?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Dynamic URL Helper
const getURL = () => {
  let url = process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
           process?.env?.NEXT_PUBLIC_SITE_URL ?? 
           'http://localhost:3000'
  
  if (!url) {
    url = 'http://localhost:3000';
  }
  
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

// Network diagnostic helper
const diagnoseNetworkError = (error: any): string => {
  if (error.message?.includes('fetch')) {
    return "Network error: Unable to connect to authentication server. Please check your internet connection.";
  }
  if (error.message?.includes('CORS')) {
    return "CORS error: Authentication server configuration issue.";
  }
  if (error.message?.includes('timeout')) {
    return "Request timeout: Authentication server took too long to respond.";
  }
  return error.message || "An unexpected error occurred";
};

export const authService = {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Get user error:", error);
        return null;
      }
      
      return user ? {
        id: user.id,
        email: user.email || "",
        user_metadata: user.user_metadata,
        created_at: user.created_at
      } : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Get session error:", error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error("Get current session error:", error);
      return null;
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, referralCode?: string, metadata?: any): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // Generate referral code if not provided
      const code = referralCode || `SUI${Math.floor(100000 + Math.random() * 900000)}`;

      // TEMPORARY: Email verification bypass (remove when Resend DNS is configured)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // emailRedirectTo: `${getURL()}auth/confirm-email`, // DISABLED - Enable when email is ready
          data: { ...metadata, referral_code: code },
          emailRedirectTo: undefined // TEMPORARY: Skip email confirmation
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      const authUser = data.user ? {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at
      } : null;

      if (data.user) {
        // Create profile entry if it doesn't exist (handling potential triggers)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            referral_code: code, // Use the generated/passed code
            role: 'user',
            status: 'active'
          }, { onConflict: 'id' });

        // CRITICAL: Create users table entry as it is referenced by wallets/transactions
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: email,
            referral_code: code, // Sync referral code
            account_status: 'active',
            // referred_by needs to be handled if we have the ID, but here we might only have code
            // The metadata trigger might handle this, but being safe:
          }, { onConflict: 'id' });
          
        if (profileError) console.error("Profile creation error:", profileError);
        if (userError) console.error("User creation error:", userError);
      }

      return { user: authUser, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { 
        user: null, 
        error: { message: "An unexpected error occurred during sign up" } 
      };
    }
  },

  // Sign in with email and password - with retry logic
  async signIn(email: string, password: string, retries = 2): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      console.log("Attempting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error from Supabase:", error);
        
        // Retry on network errors
        if (retries > 0 && error.message?.toLowerCase().includes('fetch')) {
          console.log(`Retrying login... (${retries} attempts remaining)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return this.signIn(email, password, retries - 1);
        }
        
        return { 
          user: null, 
          error: { 
            message: diagnoseNetworkError(error),
            code: error.status?.toString() 
          } 
        };
      }

      if (!data.user) {
        return {
          user: null,
          error: { message: "Login failed - no user data returned" }
        };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at
      };

      // Ensure profile exists after successful login
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          console.warn("Profile check error:", profileError);
        }

        // Create profile if it doesn't exist
        if (!profileData) {
          console.log("Profile not found, creating...");
          const { error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email || email,
              referral_code: data.user.user_metadata?.referral_code || `SUI${Math.floor(100000 + Math.random() * 900000)}`,
              role: 'user',
              status: 'active'
            }, { onConflict: 'id' });

          if (createError) {
            console.error("Profile creation error:", createError);
          }
        }

        // Ensure users table entry exists
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userError) {
          console.warn("Users table check error:", userError);
        }

        if (!userData) {
          console.log("Users table entry not found, creating...");
          const { error: createUserError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email || email,
              referral_code: data.user.user_metadata?.referral_code || `SUI${Math.floor(100000 + Math.random() * 900000)}`,
              account_status: 'active'
            }, { onConflict: 'id' });

          if (createUserError) {
            console.error("Users table creation error:", createUserError);
          }
        }
      } catch (profileException) {
        console.error("Profile/User creation exception:", profileException);
        // Don't fail the login if profile creation fails
      }

      console.log("Login successful for:", email);
      return { user: authUser, error: null };
      
    } catch (error: any) {
      console.error("Sign in exception:", error);
      
      // Retry on network exceptions
      if (retries > 0 && (error.message?.includes('fetch') || error.message?.includes('network'))) {
        console.log(`Retrying login after exception... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.signIn(email, password, retries - 1);
      }
      
      return { 
        user: null, 
        error: { 
          message: diagnoseNetworkError(error)
        } 
      };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { 
        error: { message: "An unexpected error occurred during sign out" } 
      };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}reset-password`,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error("Reset password error:", error);
      return { 
        error: { message: "An unexpected error occurred during password reset" } 
      };
    }
  },

  // Update password (for password reset flow)
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error("Update password error:", error);
      return { 
        error: { message: "An unexpected error occurred while updating password" } 
      };
    }
  },

  // Confirm email (REQUIRED)
  async confirmEmail(token: string, type: 'signup' | 'recovery' | 'email_change' = 'signup'): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      const authUser = data.user ? {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at
      } : null;

      return { user: authUser, error: null };
    } catch (error) {
      console.error("Confirm email error:", error);
      return { 
        user: null, 
        error: { message: "An unexpected error occurred during email confirmation" } 
      };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
