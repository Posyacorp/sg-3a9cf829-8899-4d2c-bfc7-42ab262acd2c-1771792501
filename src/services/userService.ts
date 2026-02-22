import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type User = Tables<"users">;

/**
 * User Service - Handles user registration, authentication, and profile management
 */

// Register new user with referral code
export async function registerUser(data: {
  email: string;
  password: string;
  full_name: string;
  referral_code?: string;
}) {
  try {
    // Check if referral code exists
    let referrer_id = null;
    if (data.referral_code) {
      const { data: referrer } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", data.referral_code)
        .single();
      
      if (!referrer) {
        return { success: false, error: "Invalid referral code" };
      }
      referrer_id = referrer.id;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: "Registration failed" };

    // Generate unique referral code
    const referralCode = `SUI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        referral_code: referralCode,
        referred_by: referrer_id,
      });

    if (profileError) return { success: false, error: profileError.message };

    return { 
      success: true, 
      user: authData.user,
      referral_code: referralCode 
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Registration failed" };
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };

    return { success: true, user: data.user, session: data.session };
  } catch (error: unknown) {
    console.error("Login error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Login failed" };
  }
}

// Logout user
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: unknown) {
    console.error("Logout error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Logout failed" };
  }
}

// Get current user profile
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, user: data };
  } catch (error: unknown) {
    console.error("Get user error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get user" };
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<User>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, user: data };
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

// Get user by referral code
export async function getUserByReferralCode(referralCode: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, referral_code")
      .eq("referral_code", referralCode)
      .single();

    if (error) return { success: false, error: "Invalid referral code" };

    return { success: true, user: data };
  } catch (error: unknown) {
    console.error("Get user by referral error:", error);
    return { success: false, error: error instanceof Error ? error.message : "User not found" };
  }
}

// Get user's downline count (direct referrals)
export async function getUserDownlineCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", userId);

    if (error) return { success: false, error: error.message };

    return { success: true, count: count || 0 };
  } catch (error: unknown) {
    console.error("Get downline count error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get downline count" };
  }
}

// Check if user has active package (for MLM commission eligibility)
export async function hasActivePackage(userId: string) {
  try {
    const { count, error } = await supabase
      .from("user_packages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, hasActive: (count || 0) > 0 };
  } catch (error: unknown) {
    console.error("Check active package error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Check failed" };
  }
}