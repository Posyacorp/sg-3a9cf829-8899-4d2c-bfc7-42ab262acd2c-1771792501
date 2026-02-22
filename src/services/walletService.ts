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
    const senderBalance = senderWallet.wallet[data.fromWallet] || 0;
    if (senderBalance < data.amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Calculate 1% P2P fee
    const p2pFee = data.amount * 0.01;
    const netAmount = data.amount - p2pFee;

    // Deduct from sender using SQL UPDATE
    await supabase
      .from("wallets")
      .update({ 
        [data.fromWallet]: supabase.raw(`${data.fromWallet} - ${data.amount}`) 
      })
      .eq("user_id", user.id);

    // Credit to receiver's P2P wallet using SQL UPDATE
    await supabase
      .from("wallets")
      .update({ 
        p2p_balance: supabase.raw(`p2p_balance + ${netAmount}`) 
      })
      .eq("user_id", data.toUserId);

    // Record P2P fee to admin
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "admin_fee",
      wallet_type: "main",
      amount: p2pFee,
      net_amount: 0,
      status: "completed",
      admin_note: "P2P transfer fee (1%)",
    });

    // Record transfer transactions
    await supabase.from("transactions").insert([
      {
        user_id: user.id,
        from_user_id: user.id,
        to_user_id: data.toUserId,
        type: "p2p_send",
        wallet_type: data.fromWallet.replace("_balance", "") as "main" | "roi" | "earning" | "p2p",
        amount: data.amount,
        net_amount: netAmount,
        fee: p2pFee,
        status: "completed",
      },
      {
        user_id: data.toUserId,
        from_user_id: user.id,
        to_user_id: data.toUserId,
        type: "p2p_receive",
        wallet_type: "p2p",
        amount: netAmount,
        net_amount: netAmount,
        status: "completed",
      }
    ]);

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
    const balance = wallet.wallet[data.fromWallet] || 0;
    if (balance < data.amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Perform internal transfer using SQL UPDATE
    await supabase
      .from("wallets")
      .update({ 
        [data.fromWallet]: supabase.raw(`${data.fromWallet} - ${data.amount}`),
        [data.toWallet]: supabase.raw(`${data.toWallet} + ${data.amount}`)
      })
      .eq("user_id", user.id);

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
      (wallet.wallet.main_balance || 0) +
      (wallet.wallet.roi_balance || 0) +
      (wallet.wallet.earning_balance || 0) +
      (wallet.wallet.p2p_balance || 0);

    return { success: true, total, wallet: wallet.wallet };
  } catch (error: unknown) {
    console.error("Get total balance error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get balance" };
  }
}

// Request withdrawal (external - subject to 50% tax)
export async function requestWithdrawal(data: {
  amount: number;
  walletAddress: string;
  fromWallet: "main_balance" | "roi_balance" | "earning_balance" | "p2p_balance";
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Get wallet
    const wallet = await getUserWallet(user.id);
    if (!wallet.success || !wallet.wallet) {
      return { success: false, error: "Wallet not found" };
    }

    // Check sufficient balance
    const balance = wallet.wallet[data.fromWallet] || 0;
    if (balance < data.amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Calculate 50% withdrawal tax for external withdrawals
    const withdrawalTax = data.amount * 0.50;
    const netAmount = data.amount - withdrawalTax;

    // Deduct from wallet (will be held until admin approval)
    await supabase
      .from("wallets")
      .update({ 
        [data.fromWallet]: supabase.raw(`${data.fromWallet} - ${data.amount}`),
        locked_balance: supabase.raw(`locked_balance + ${data.amount}`)
      })
      .eq("user_id", user.id);

    // Create withdrawal transaction (pending admin approval)
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "withdrawal",
        wallet_type: data.fromWallet.replace("_balance", "") as "main" | "roi" | "earning" | "p2p",
        amount: data.amount,
        fee: withdrawalTax,
        net_amount: netAmount,
        wallet_address: data.walletAddress,
        status: "pending",
        admin_note: "Withdrawal request - 50% external tax applies",
      })
      .select()
      .single();

    if (txError) return { success: false, error: txError.message };

    return { 
      success: true, 
      transaction,
      netAmount,
      tax: withdrawalTax 
    };
  } catch (error: unknown) {
    console.error("Request withdrawal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Withdrawal request failed" };
  }
}

// Request deposit
export async function requestDeposit(data: {
  amount: number;
  hashKey: string;
  walletAddress: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Create deposit transaction (pending admin approval)
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        wallet_type: "main",
        amount: data.amount,
        net_amount: data.amount,
        hash_key: data.hashKey,
        wallet_address: data.walletAddress,
        status: "pending",
        admin_note: "Deposit request - awaiting admin verification",
      })
      .select()
      .single();

    if (txError) return { success: false, error: txError.message };

    return { success: true, transaction };
  } catch (error: unknown) {
    console.error("Request deposit error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Deposit request failed" };
  }
}