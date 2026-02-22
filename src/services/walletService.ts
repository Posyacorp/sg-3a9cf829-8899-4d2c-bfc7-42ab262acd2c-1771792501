import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Wallet = Tables<"wallets">;

/**
 * Wallet Service - Handles multi-wallet system (Main, ROI, Earning, P2P)
 */

// Get user's wallet balances
export async function getUserWallet(userId: string) {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, wallet: data };
  } catch (error: unknown) {
    console.error("Get wallet error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get wallet" };
  }
}

// P2P Transfer (Internal transfer between users)
export async function p2pTransfer(data: {
  toUserId: string;
  amount: number;
  fromWallet: "main_balance" | "roi_balance" | "earning_balance" | "p2p_balance";
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    if (user.id === data.toUserId) {
      return { success: false, error: "Cannot transfer to yourself" };
    }

    // Get sender wallet
    const senderWallet = await getUserWallet(user.id);
    if (!senderWallet.success || !senderWallet.wallet) {
      return { success: false, error: "Wallet not found" };
    }

    // Check sufficient balance
    const senderBalance = senderWallet.wallet[data.fromWallet];
    if (senderBalance < data.amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Calculate 1% P2P fee
    const p2pFee = data.amount * 0.01;
    const netAmount = data.amount - p2pFee;

    // Deduct from sender
    const { error: deductError } = await supabase.rpc("debit_wallet", {
      p_user_id: user.id,
      p_wallet_type: data.fromWallet,
      p_amount: data.amount,
    });

    if (deductError) return { success: false, error: deductError.message };

    // Credit to receiver's P2P wallet
    const { error: creditError } = await supabase.rpc("credit_wallet", {
      p_user_id: data.toUserId,
      p_wallet_type: "p2p_balance",
      p_amount: netAmount,
    });

    if (creditError) return { success: false, error: creditError.message };

    // Record P2P fee to admin
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "p2p_fee",
      amount: p2pFee,
      status: "completed",
      description: "P2P transfer fee (1%)",
    });

    // Record transfer transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "p2p_transfer",
      amount: data.amount,
      status: "completed",
      description: `P2P transfer to user ${data.toUserId}`,
    });

    return { success: true, netAmount, fee: p2pFee };
  } catch (error: unknown) {
    console.error("P2P transfer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Transfer failed" };
  }
}

// Internal wallet transfer (between own wallets)
export async function internalTransfer(data: {
  fromWallet: "main_balance" | "roi_balance" | "earning_balance" | "p2p_balance";
  toWallet: "main_balance" | "roi_balance" | "earning_balance" | "p2p_balance";
  amount: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    if (data.fromWallet === data.toWallet) {
      return { success: false, error: "Cannot transfer to same wallet" };
    }

    // Get wallet
    const wallet = await getUserWallet(user.id);
    if (!wallet.success || !wallet.wallet) {
      return { success: false, error: "Wallet not found" };
    }

    // Check sufficient balance
    const balance = wallet.wallet[data.fromWallet];
    if (balance < data.amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Deduct from source wallet
    const { error: deductError } = await supabase.rpc("debit_wallet", {
      p_user_id: user.id,
      p_wallet_type: data.fromWallet,
      p_amount: data.amount,
    });

    if (deductError) return { success: false, error: deductError.message };

    // Credit to destination wallet
    const { error: creditError } = await supabase.rpc("credit_wallet", {
      p_user_id: user.id,
      p_wallet_type: data.toWallet,
      p_amount: data.amount,
    });

    if (creditError) return { success: false, error: creditError.message };

    return { success: true };
  } catch (error: unknown) {
    console.error("Internal transfer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Transfer failed" };
  }
}

// Get total available balance (all wallets)
export async function getTotalBalance(userId: string) {
  try {
    const wallet = await getUserWallet(userId);
    if (!wallet.success || !wallet.wallet) {
      return { success: false, error: "Wallet not found" };
    }

    const total = 
      wallet.wallet.main_balance +
      wallet.wallet.roi_balance +
      wallet.wallet.earning_balance +
      wallet.wallet.p2p_balance;

    return { success: true, total, wallet: wallet.wallet };
  } catch (error: unknown) {
    console.error("Get total balance error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get balance" };
  }
}