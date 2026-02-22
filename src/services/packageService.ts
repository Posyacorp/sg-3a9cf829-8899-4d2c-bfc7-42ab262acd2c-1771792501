import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Package = Tables<"packages">;
export type UserPackage = Tables<"user_packages">;

/**
 * Package Service - Handles investment packages and user package purchases
 */

// Get all active packages
export async function getAllPackages() {
  try {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("status", "active")
      .order("amount", { ascending: true });

    if (error) return { success: false, error: error.message };

    return { success: true, packages: data };
  } catch (error: unknown) {
    console.error("Get packages error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get packages" };
  }
}

// Get package by ID
export async function getPackageById(packageId: string) {
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
}

// Purchase package
export async function purchasePackage(data: {
  packageId: string;
  useInternalFunds: number; // Amount from internal wallets (max 70%)
  freshDeposit: number; // Fresh deposit amount (min 30%)
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Get package details
    const pkgResult = await getPackageById(data.packageId);
    if (!pkgResult.success || !pkgResult.package) {
      return { success: false, error: "Package not found" };
    }
    const pkg = pkgResult.package;

    // Validate 70/30 rule
    const totalAmount = data.useInternalFunds + data.freshDeposit;
    if (totalAmount < pkg.amount) {
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
    const adminFee = pkg.amount * 0.05;
    const netAmount = pkg.amount - adminFee;

    // Calculate next task time (3 hours from now)
    const nextTaskTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

    // Create user package
    const { data: userPackage, error: packageError } = await supabase
      .from("user_packages")
      .insert({
        user_id: user.id,
        package_id: data.packageId,
        amount_paid: pkg.amount,
        roi_percentage: pkg.roi_percentage,
        total_return: (pkg.amount * pkg.roi_percentage) / 100,
        amount_withdrawn: 0,
        next_task_time: nextTaskTime.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (packageError) return { success: false, error: packageError.message };

    // Record admin fee transaction (goes to secret admin wallet)
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "admin_fee",
      amount: adminFee,
      status: "completed",
      description: `Admin fee for package purchase (${pkg.name})`,
    });

    return { success: true, userPackage };
  } catch (error: unknown) {
    console.error("Purchase package error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Purchase failed" };
  }
}

// Get user's active packages
export async function getUserActivePackages(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_packages")
      .select(`
        *,
        packages (*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, packages: data };
  } catch (error: unknown) {
    console.error("Get user packages error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get packages" };
  }
}

// Get user's package history
export async function getUserPackageHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_packages")
      .select(`
        *,
        packages (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, packages: data };
  } catch (error: unknown) {
    console.error("Get package history error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get history" };
  }
}

// Check if user can claim task (within 30-minute window)
export async function canClaimTask(userPackageId: string) {
  try {
    const { data, error } = await supabase
      .from("user_packages")
      .select("next_task_time, last_claim_time")
      .eq("id", userPackageId)
      .single();

    if (error) return { success: false, error: error.message };

    const now = new Date();
    const nextTask = new Date(data.next_task_time);
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
}

// Claim task reward (ROI distribution)
export async function claimTaskReward(userPackageId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Check if can claim
    const claimCheck = await canClaimTask(userPackageId);
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
    const rewardAmount = (userPackage.amount_paid * randomPercent) / 100;

    // Update user package
    const newAmountWithdrawn = userPackage.amount_withdrawn + rewardAmount;
    const newNextTaskTime = new Date(Date.now() + 3 * 60 * 60 * 1000); // Next 3 hours

    // Check if package is complete
    const isComplete = newAmountWithdrawn >= userPackage.total_return;

    const { error: updateError } = await supabase
      .from("user_packages")
      .update({
        amount_withdrawn: newAmountWithdrawn,
        last_claim_time: new Date().toISOString(),
        next_task_time: isComplete ? null : newNextTaskTime.toISOString(),
        status: isComplete ? "completed" : "active",
      })
      .eq("id", userPackageId);

    if (updateError) return { success: false, error: updateError.message };

    // Credit ROI wallet
    const { error: walletError } = await supabase.rpc("credit_wallet", {
      p_user_id: user.id,
      p_wallet_type: "roi_balance",
      p_amount: rewardAmount,
    });

    if (walletError) return { success: false, error: walletError.message };

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "roi_reward",
      amount: rewardAmount,
      status: "completed",
      description: `Task reward claimed (${randomPercent.toFixed(2)}%)`,
    });

    // Create task record
    await supabase.from("tasks").insert({
      user_package_id: userPackageId,
      user_id: user.id,
      reward_amount: rewardAmount,
      reward_percentage: randomPercent,
      status: "claimed",
      window_start: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      window_end: new Date().toISOString(),
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