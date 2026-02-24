import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * User Service - Handles user profile management using the 'profiles' table
 */

// Register new user (Handled by authService usually, but keeping for reference/admin)
// Note: authService.signUp handles profile creation via triggers or direct insert

// Get current user profile
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
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
export async function updateUserProfile(updates: Partial<Profile>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
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
      .from("profiles")
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
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", userId);

    if (error) return { success: false, error: error.message };

    return { success: true, count: count || 0 };
  } catch (error: unknown) {
    console.error("Get downline count error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get downline count" };
  }
}

// Get user's referral tree (direct referrals for now)
export async function getReferralTree(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("referred_by", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get referral tree error:", error);
    return [];
  }
}

// Check if user has active package
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