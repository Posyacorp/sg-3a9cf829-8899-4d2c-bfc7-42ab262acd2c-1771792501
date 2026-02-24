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
  async signUp(email: string, password: string, username: string, fullName: string, referralCode?: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email,
          username,
          full_name: fullName,
          referral_code: Math.random().toString(36).substring(7).toUpperCase(),
          referred_by: referralCode ? await this.getUserIdByReferralCode(referralCode) : null,
          role: 'user',
          status: true // is_active
        } as any);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue to create wallets even if profile fails (can be fixed later)
      }

      // Create wallets
      const walletTypes = ['main', 'roi', 'earning', 'p2p'];
      const walletInserts = walletTypes.map(type => ({
        user_id: authData.user!.id,
        wallet_type: type,
        balance: 0,
        locked_balance: 0
      }));

      const { error: walletError } = await supabase
        .from("wallets")
        .insert(walletInserts);

      if (walletError) console.error("Wallet creation error:", walletError);
    }

    return authData;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Reset Password (send email)
  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}reset-password`,
    });
  },

  // Update Password (logged in or with token)
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password });
  },

  async validateReferralCode(code: string): Promise<boolean> {
    if (!code) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .maybeSingle();
        
      if (error) {
        console.error("Error validating referral code:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Exception validating referral code:", error);
      return false;
    }
  },

  async getUserIdByReferralCode(code: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .single();
    
    if (error || !data) return null;
    return data.id;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};