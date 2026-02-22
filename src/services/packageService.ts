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
      .eq("is_active", true)
      .order("min_deposit", { ascending: true });

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

// Purchase package with 70/30 rule
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
      admin_note: `5% admin fee for package purchase (${pkg.name})`,
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
      .eq("is_active", true)
      .order("purchased_at", { ascending: false });

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
      .order("purchased_at", { ascending: false });

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

    // Credit ROI wallet using SQL UPDATE
    await supabase
      .from("wallets")
      .update({ 
        roi_balance: supabase.raw(`roi_balance + ${rewardAmount}`) 
      })
      .eq("user_id", user.id);

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