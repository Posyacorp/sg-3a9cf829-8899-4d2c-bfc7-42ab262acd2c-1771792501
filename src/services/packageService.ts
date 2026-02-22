import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Package = Database["public"]["Tables"]["packages"]["Row"];
type UserPackage = Database["public"]["Tables"]["user_packages"]["Row"];

const ADMIN_SECRET_WALLET = "0xe7da79a7fea4ea3c8656c6d647a6bc31752d72c7";

/**
 * Package Service - Handles investment packages and user package purchases
 */

export const packageService = {
  // Get all active packages
  async getAllPackages() {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("min_deposit", { ascending: true });

      if (error) return { success: false, error: error.message };

      return { success: true, packages: data };
    } catch (error: unknown) {
      console.error("Get packages error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get packages" };
    }
  },

  // Get package by ID
  async getPackageById(packageId: string) {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (error) return { success: false, error: error.message };

      return { success: true, package: data };
    } catch (error: unknown) {
      console.error("Get package error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Package not found" };
    }
  },

  // Purchase package with 70/30 rule
  async purchasePackage(data: {
    packageId: string;
    useInternalFunds: number; // Amount from internal wallets (max 70%)
    freshDeposit: number; // Fresh deposit amount (min 30%)
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // Get package details
      const pkgResult = await this.getPackageById(data.packageId);
      if (!pkgResult.success || !pkgResult.package) {
        return { success: false, error: "Package not found" };
      }
      const pkg = pkgResult.package;

      // Validate 70/30 rule
      const totalAmount = data.useInternalFunds + data.freshDeposit;
      if (totalAmount < pkg.min_deposit) {
        return { success: false, error: "Insufficient funds" };
      }

      const internalPercent = (data.useInternalFunds / totalAmount) * 100;
      if (internalPercent > 70) {
        return { success: false, error: "Maximum 70% internal funds allowed" };
      }

      const freshPercent = (data.freshDeposit / totalAmount) * 100;
      if (freshPercent < 30) {
        return { success: false, error: "Minimum 30% fresh deposit required" };
      }

      // Deduct 5% admin fee
      const adminFee = totalAmount * 0.05;
      const netAmount = totalAmount - adminFee;

      // Calculate next task time (3 hours from now)
      const nextTaskTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

      // Create user package
      const { data: userPackage, error: packageError } = await supabase
        .from("user_packages")
        .insert({
          user_id: user.id,
          package_id: data.packageId,
          deposit_amount: totalAmount,
          max_roi_percentage: pkg.max_roi_percentage,
          next_task_time: nextTaskTime.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (packageError) return { success: false, error: packageError.message };

      // Record admin fee transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "admin_fee",
        wallet_type: "main",
        amount: adminFee,
        net_amount: 0,
        status: "completed",
        admin_note: `5% admin fee for package purchase (${pkg.name}) to ${ADMIN_SECRET_WALLET}`,
      });

      // Record package purchase transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "package_purchase",
        wallet_type: "main",
        amount: totalAmount,
        net_amount: netAmount,
        package_id: data.packageId,
        status: "completed",
      });

      return { success: true, userPackage };
    } catch (error: unknown) {
      console.error("Purchase package error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Purchase failed" };
    }
  },

  async buyPackage(
    userId: string,
    packageId: string,
    amount: number,
    useInternalFunds: boolean = false
  ): Promise<{ success: boolean; message: string; packageData?: UserPackage }> {
    try {
      // Get package details
      const { data: pkg, error: pkgError } = await supabase
        .from("packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (pkgError || !pkg) {
        return { success: false, message: "Package not found" };
      }

      // Validate amount
      if (amount < pkg.min_deposit) {
        return {
          success: false,
          message: `Minimum investment is ${pkg.min_deposit} SUI`,
        };
      }

      // Calculate 5% admin fee
      const adminFee = amount * 0.05;
      const packageAmount = amount - adminFee;

      // Get user's wallets
      const { data: userWallets, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (walletError || !userWallets) {
        return { success: false, message: "Wallet not found" };
      }

      if (useInternalFunds) {
        // 70/30 rule: 70% from P2P wallet, 30% from main wallet
        const p2pAmount = amount * 0.7;
        const mainAmount = amount * 0.3;

        if (userWallets.p2p_balance < p2pAmount) {
          return {
            success: false,
            message: `Insufficient P2P balance. Need ${p2pAmount.toFixed(2)} SUI`,
          };
        }

        if (userWallets.main_balance < mainAmount) {
          return {
            success: false,
            message: `Insufficient main balance. Need ${mainAmount.toFixed(2)} SUI (30% fresh deposit)`,
          };
        }

        // Deduct from both wallets
        const { error: updateError } = await supabase
          .from("wallets")
          .update({
            p2p_balance: userWallets.p2p_balance - p2pAmount,
            main_balance: userWallets.main_balance - mainAmount,
          })
          .eq("user_id", userId);

        if (updateError) {
          return { success: false, message: "Failed to deduct balance" };
        }
      } else {
        // Full payment from main wallet
        if (userWallets.main_balance < amount) {
          return {
            success: false,
            message: `Insufficient main balance. Need ${amount} SUI`,
          };
        }

        const { error: updateError } = await supabase
          .from("wallets")
          .update({
            main_balance: userWallets.main_balance - amount,
          })
          .eq("user_id", userId);

        if (updateError) {
          return { success: false, message: "Failed to deduct balance" };
        }
      }

      // Record admin fee transaction (hidden from user)
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "admin_fee",
        amount: adminFee,
        net_amount: 0,
        wallet_type: "main", // Changed from admin_secret to main as wallet_type enum constraint likely exists or needs a valid wallet type
        status: "completed",
        admin_note: `5% package fee to ${ADMIN_SECRET_WALLET}`,
        hash_key: `admin_fee_${Date.now()}`,
      });

      // Create user package
      const { data: userPackage, error: createError } = await supabase
        .from("user_packages")
        .insert({
          user_id: userId,
          package_id: packageId,
          deposit_amount: packageAmount,
          current_roi_earned: 0,
          max_roi_percentage: pkg.max_roi_percentage,
          is_active: true,
          last_task_time: new Date().toISOString(),
          next_task_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
        })
        .select()
        .single();

      if (createError) {
        return { success: false, message: "Failed to create package" };
      }

      // Record package purchase transaction
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "package_purchase",
        amount: packageAmount,
        net_amount: packageAmount,
        wallet_type: "main",
        status: "completed",
        admin_note: `Purchased ${pkg.name} package`,
      });

      return {
        success: true,
        message: "Package purchased successfully!",
        packageData: userPackage,
      };
    } catch (error) {
      console.error("Buy package error:", error);
      return { success: false, message: "Failed to purchase package" };
    }
  },

  // Get user's active packages
  async getUserActivePackages(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_packages")
        .select(`
          *,
          packages (*)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("purchased_at", { ascending: false });

      if (error) return { success: false, error: error.message };

      return { success: true, packages: data };
    } catch (error: unknown) {
      console.error("Get user packages error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get packages" };
    }
  },

  // Get user's package history
  async getUserPackageHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_packages")
        .select(`
          *,
          packages (*)
        `)
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });

      if (error) return { success: false, error: error.message };

      return { success: true, packages: data };
    } catch (error: unknown) {
      console.error("Get package history error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get history" };
    }
  },

  // Check if user can claim task (within 30-minute window)
  async canClaimTask(userPackageId: string) {
    try {
      const { data, error } = await supabase
        .from("user_packages")
        .select("next_task_time, last_task_time")
        .eq("id", userPackageId)
        .single();

      if (error) return { success: false, error: error.message };

      const now = new Date();
      const nextTask = new Date(data.next_task_time || Date.now());
      const windowStart = nextTask;
      const windowEnd = new Date(nextTask.getTime() + 30 * 60 * 1000); // 30 minutes

      const canClaim = now >= windowStart && now <= windowEnd;

      return { 
        success: true, 
        canClaim,
        nextTaskTime: data.next_task_time,
        timeUntilTask: nextTask.getTime() - now.getTime(),
      };
    } catch (error: unknown) {
      console.error("Check claim task error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Check failed" };
    }
  },

  // Claim task reward (ROI distribution)
  async claimTaskReward(userPackageId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // Check if can claim
      const claimCheck = await this.canClaimTask(userPackageId);
      if (!claimCheck.success || !claimCheck.canClaim) {
        return { success: false, error: "Not within claiming window" };
      }

      // Get user package
      const { data: userPackage, error: pkgError } = await supabase
        .from("user_packages")
        .select("*, packages (*)")
        .eq("id", userPackageId)
        .single();

      if (pkgError) return { success: false, error: pkgError.message };

      // Calculate random reward (max 10% daily / max 3.33% per 3-hour interval)
      const maxRewardPercent = 3.33; // 10% daily / 3 intervals
      const randomPercent = Math.random() * maxRewardPercent;
      const rewardAmount = (userPackage.deposit_amount * randomPercent) / 100;

      // Update user package
      const newRoiEarned = (userPackage.current_roi_earned || 0) + rewardAmount;
      const newRoiPercentage = (newRoiEarned / userPackage.deposit_amount) * 100;
      const newNextTaskTime = new Date(Date.now() + 3 * 60 * 60 * 1000); // Next 3 hours

      // Check if package is complete
      const isComplete = newRoiPercentage >= userPackage.max_roi_percentage;

      const { error: updateError } = await supabase
        .from("user_packages")
        .update({
          current_roi_earned: newRoiEarned,
          total_roi_percentage: newRoiPercentage,
          last_task_time: new Date().toISOString(),
          next_task_time: isComplete ? null : newNextTaskTime.toISOString(),
          is_active: !isComplete,
          is_completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
          tasks_completed: (userPackage.tasks_completed || 0) + 1,
        })
        .eq("id", userPackageId);

      if (updateError) return { success: false, error: updateError.message };

      // Credit ROI wallet using RPC
      const { error: walletError } = await supabase.rpc('credit_wallet', {
        p_user_id: user.id,
        p_wallet_type: 'roi_balance',
        p_amount: rewardAmount
      });

      if (walletError) {
        console.error("Wallet update error:", walletError);
      }

      // Record ROI claim transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "roi_claim",
        wallet_type: "roi",
        amount: rewardAmount,
        net_amount: rewardAmount,
        package_id: userPackage.package_id,
        status: "completed",
        admin_note: `Task reward claimed (${randomPercent.toFixed(2)}%)`,
      });

      // Create task record
      const taskNumber = (userPackage.tasks_completed || 0) + 1;
      await supabase.from("tasks").insert({
        user_package_id: userPackageId,
        user_id: user.id,
        task_number: taskNumber,
        roi_percentage: randomPercent,
        roi_amount: rewardAmount,
        status: "claimed",
        window_start: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        window_end: new Date().toISOString(),
        claimed_at: new Date().toISOString(),
      });

      return { 
        success: true, 
        rewardAmount,
        rewardPercentage: randomPercent,
        isPackageComplete: isComplete,
      };
    } catch (error: unknown) {
      console.error("Claim task error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Claim failed" };
    }
  }
};