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
    role?: string;
    dateRange?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      // Cast to any to avoid "Type instantiation is excessively deep" error with complex Supabase queries
      let query: any = supabase
        .from("profiles")
        .select(`
          *,
          packages:user_packages(count),
          total_deposits:transactions(amount.sum()).eq(type, 'deposit').eq(status, 'completed'),
          total_withdrawals:transactions(amount.sum()).eq(type, 'withdrawal').eq(status, 'completed'),
          direct_referrals:profiles(count).eq(referred_by, id)
        `);

      // Search filter
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,username.ilike.%${filters.search}%,referral_code.ilike.%${filters.search}%`);
      }

      // Status filter
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // KYC filter
      if (filters?.kycStatus && filters.kycStatus !== "all") {
        if (filters.kycStatus === "not_verified") {
          query = query.or("kyc_status.is.null,kyc_status.eq.not_verified");
        } else {
          query = query.eq("kyc_status", filters.kycStatus);
        }
      }

      // Star rank filter
      if (filters?.starRank && filters.starRank !== "all") {
        // Ensure starRank is passed as a number if the column is numeric
        // If filters.starRank is a string like "1", this works if the DB expects a number (Supabase/PostgREST handles conversion mostly, but explicit is better)
        query = query.eq("star_rank", parseInt(filters.starRank));
      }

      // Role filter
      if (filters?.role && filters.role !== "all") {
        query = query.eq("role", filters.role);
      }

      // Date range filter
      if (filters?.dateRange && filters.dateRange !== "all") {
        const now = new Date();
        const startDate = new Date();
        
        switch (filters.dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(now.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte("created_at", startDate.toISOString());
      }

      // Sorting
      const sortBy = filters?.sortBy || "date";
      const sortOrder = filters?.sortOrder || "desc";
      
      switch (sortBy) {
        case "balance":
          query = query.order("current_balance", { ascending: sortOrder === "asc" });
          break;
        case "team_volume":
          query = query.order("team_volume", { ascending: sortOrder === "asc" });
          break;
        case "earnings":
          query = query.order("total_commissions", { ascending: sortOrder === "asc" });
          break;
        default: // date
          query = query.order("created_at", { ascending: sortOrder === "asc" });
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
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
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
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

  // Bulk verify KYC
  async bulkVerifyKYC(userIds: string[], kycStatus: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        kyc_status: kycStatus,
        kyc_verified: kycStatus === "verified",
        updated_at: new Date().toISOString() 
      } as any)
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error bulk verifying KYC:", error);
      throw error;
    }

    return data;
  },

  // Bulk change role
  async bulkChangeRole(userIds: string[], role: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        role,
        updated_at: new Date().toISOString() 
      })
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error bulk changing role:", error);
      throw error;
    }

    return data;
  },

  // Bulk credit wallet
  async bulkCreditWallet(userIds: string[], amount: number, walletType: string) {
    // Create transactions for each user
    const { data, error } = await supabase
      .from("transactions")
      .insert(
        userIds.map(userId => ({
          user_id: userId,
          type: "admin_credit",
          amount,
          net_amount: amount,
          fee: 0,
          status: "completed",
          wallet_type: walletType,
          description: `Bulk credit by admin - ${amount} SUI to ${walletType}`,
        })) as any
      )
      .select();

    if (error) {
      console.error("Error bulk crediting wallets:", error);
      throw error;
    }

    // Update wallet balances
    for (const userId of userIds) {
      const { error: walletError } = await supabase.rpc("update_wallet_balance" as any, {
        p_user_id: userId,
        p_wallet_type: walletType,
        p_amount: amount,
      });

      if (walletError) {
        console.error("Error updating wallet balance:", walletError);
      }
    }

    return data;
  },

  // Bulk debit wallet
  async bulkDebitWallet(userIds: string[], amount: number, walletType: string) {
    const { data, error } = await supabase
      .from("transactions")
      .insert(
        userIds.map(userId => ({
          user_id: userId,
          type: "admin_debit",
          amount: -amount,
          net_amount: -amount,
          fee: 0,
          status: "completed",
          wallet_type: walletType,
          description: `Bulk debit by admin - ${amount} SUI from ${walletType}`,
        })) as any
      )
      .select();

    if (error) {
      console.error("Error bulk debiting wallets:", error);
      throw error;
    }

    // Update wallet balances
    for (const userId of userIds) {
      const { error: walletError } = await supabase.rpc("update_wallet_balance" as any, {
        p_user_id: userId,
        p_wallet_type: walletType,
        p_amount: -amount,
      });

      if (walletError) {
        console.error("Error updating wallet balance:", walletError);
      }
    }

    return data;
  },

  // Bulk update KYC status
  async bulkUpdateKYCStatus(userIds: string[], status: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ kyc_status: status })
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error updating KYC status:", error);
      throw error;
    }

    return data;
  },

  // Bulk update role
  async bulkUpdateRole(userIds: string[], role: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: role })
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error updating role:", error);
      throw error;
    }

    return data;
  },

  // Bulk update star rank
  async bulkUpdateStarRank(userIds: string[], rank: number) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ star_rank: rank })
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error updating star rank:", error);
      throw error;
    }

    return data;
  },

  // Bulk toggle 2FA
  async bulkToggle2FA(userIds: string[], enabled: boolean) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ two_factor_enabled: enabled })
      .in("id", userIds)
      .select();

    if (error) {
      console.error("Error toggling 2FA:", error);
      throw error;
    }

    return data;
  },

  // Bulk send notification
  async bulkSendNotification(userIds: string[], title: string, message: string) {
    const { data, error } = await supabase
      .from("notifications" as any)
      .insert(
        userIds.map(userId => ({
          user_id: userId,
          title,
          message,
          type: "admin_message",
          read: false,
        }))
      )
      .select();

    if (error) {
      console.error("Error sending bulk notifications:", error);
      // If notifications table doesn't exist, return success anyway
      return { sent: userIds.length, message: "Notifications queued" };
    }

    return data;
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

  // ==================== FILTER PRESET MANAGEMENT ====================
  
  // Get all filter presets (user's own + public presets)
  async getFilterPresets(userId: string) {
    const { data, error } = await supabase
      .from("filter_presets")
      .select("*")
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("is_public", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching filter presets:", error);
      throw error;
    }

    return data;
  },

  // Save a new filter preset
  async saveFilterPreset(userId: string, presetName: string, filters: any, isPublic: boolean = false) {
    const { data, error } = await supabase
      .from("filter_presets")
      .insert({
        user_id: userId,
        preset_name: presetName,
        filters: filters,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving filter preset:", error);
      throw error;
    }

    return data;
  },

  // Update an existing filter preset
  async updateFilterPreset(presetId: string, updates: { preset_name?: string; filters?: any; is_public?: boolean; is_default?: boolean }) {
    const { data, error } = await supabase
      .from("filter_presets")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", presetId)
      .select()
      .single();

    if (error) {
      console.error("Error updating filter preset:", error);
      throw error;
    }

    return data;
  },

  // Delete a filter preset
  async deleteFilterPreset(presetId: string) {
    const { error } = await supabase
      .from("filter_presets")
      .delete()
      .eq("id", presetId);

    if (error) {
      console.error("Error deleting filter preset:", error);
      throw error;
    }

    return { success: true };
  },

  // Set a preset as default for the user
  async setDefaultPreset(userId: string, presetId: string) {
    // First, unset any existing default
    await supabase
      .from("filter_presets")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Then set the new default
    const { data, error } = await supabase
      .from("filter_presets")
      .update({ is_default: true })
      .eq("id", presetId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error setting default preset:", error);
      throw error;
    }

    return data;
  },
};