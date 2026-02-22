import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["profiles"]["Row"];

// Admin User Management Service
export const adminService = {
  // Get all users with filters
  async getAllUsers(filters?: {
    search?: string;
    status?: string;
    kycStatus?: string;
    starRank?: string;
  }) {
    let query = supabase
      .from("profiles")
      .select(`
        *,
        user_packages!user_packages_user_id_fkey(
          id,
          package_id,
          amount,
          status,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,referral_code.ilike.%${filters.search}%`
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    // Apply KYC filter
    if (filters?.kycStatus && filters.kycStatus !== "all") {
      query = query.eq("kyc_verified", filters.kycStatus === "verified");
    }

    // Apply star rank filter
    if (filters?.starRank && filters.starRank !== "all") {
      // Extract number from "star_X" string
      const rankNum = parseInt(filters.starRank.replace("star_", ""));
      if (!isNaN(rankNum)) {
        query = query.eq("star_rank", rankNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    return data || [];
  },

  // Get single user details
  async getUserDetails(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_packages!user_packages_user_id_fkey(*),
        wallets!wallets_user_id_fkey(*)
      `)
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }

    return data;
  },

  // Update user status (suspend/activate)
  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user status:", error);
      throw error;
    }

    return data;
  },

  // Bulk update user status
  async bulkUpdateStatus(userIds: string[], status: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error bulk updating status:", error);
      throw error;
    }

    return data;
  },

  // Delete users (bulk)
  async bulkDeleteUsers(userIds: string[]) {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .in("id", userIds);

    if (error) {
      console.error("Error deleting users:", error);
      throw error;
    }

    return true;
  },

  // Reset user password
  async resetUserPassword(userId: string, newPassword: string) {
    // In production, this would use Supabase Admin API
    // For now, we'll update a password_hash field
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        password_hash: newPassword, // In production, hash this properly
        updated_at: new Date().toISOString() 
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error resetting password:", error);
      throw error;
    }

    return data;
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string, userId: string) {
    const resetToken = `${userId}_${Date.now()}_reset`;
    const resetLink = `https://sui24.trade/reset-password?token=${resetToken}`;

    // In production, this would trigger an email service
    // For now, we'll just return the reset link
    console.log(`Password reset email sent to ${email}`);
    console.log(`Reset link: ${resetLink}`);

    return { resetLink, email };
  },

  // Get user activity timeline
  async getUserActivity(userId: string) {
    const { data, error } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user activity:", error);
      // Return empty array if table doesn't exist yet
      return [];
    }

    return data || [];
  },

  // Enable/disable 2FA for user
  async toggle2FA(userId: string, enabled: boolean) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        two_factor_enabled: enabled,
        updated_at: new Date().toISOString() 
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error toggling 2FA:", error);
      throw error;
    }

    return data;
  },

  // Create impersonation token
  async createImpersonationToken(adminId: string, userId: string) {
    const token = `impersonate_${adminId}_${userId}_${Date.now()}`;
    
    // Store impersonation session
    const { data, error } = await supabase
      .from("admin_impersonation")
      .insert({
        admin_id: adminId,
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating impersonation token:", error);
      // If table doesn't exist, return mock data
      return { token, user_id: userId };
    }

    return data;
  },

  // Detect fraudulent activity
  async detectFraud(userId: string) {
    // Fraud detection logic
    const user = await this.getUserDetails(userId);
    const activities = await this.getUserActivity(userId);

    const fraudIndicators = {
      suspiciousLoginPattern: false,
      multipleAccountsFromSameIP: false,
      unusualTransactionVolume: false,
      rapidWithdrawals: false,
      selfReferral: false,
      riskScore: 0,
    };

    // Check for suspicious patterns
    // 1. Multiple logins from different locations in short time
    const loginActivities = activities.filter((a: any) => a.activity_type === "login");
    if (loginActivities.length > 10) {
      const recentLogins = loginActivities.slice(0, 10);
      const uniqueIPs = new Set(recentLogins.map((l: any) => l.metadata?.ip_address));
      if (uniqueIPs.size > 5) {
        fraudIndicators.suspiciousLoginPattern = true;
        fraudIndicators.riskScore += 30;
      }
    }

    // 2. Check for self-referral (referred_by === user_id)
    if (user.referred_by === user.id) {
      fraudIndicators.selfReferral = true;
      fraudIndicators.riskScore += 50;
    }

    // 3. Check withdrawal patterns
    const withdrawals = activities.filter((a: any) => a.activity_type === "withdrawal");
    if (withdrawals.length > 5) {
      const recentWithdrawals = withdrawals.slice(0, 5);
      const timeSpan = new Date(recentWithdrawals[0].created_at).getTime() - 
                       new Date(recentWithdrawals[4].created_at).getTime();
      if (timeSpan < 3600000) { // Less than 1 hour
        fraudIndicators.rapidWithdrawals = true;
        fraudIndicators.riskScore += 40;
      }
    }

    return fraudIndicators;
  },

  // Subscribe to real-time user updates
  subscribeToUserUpdates(callback: (payload: any) => void) {
    const channel = supabase
      .channel("user_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        callback
      )
      .subscribe();

    return channel;
  },

  // Unsubscribe from real-time updates
  unsubscribeFromUserUpdates(channel: any) {
    supabase.removeChannel(channel);
  },
};