import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

const ADMIN_SECRET_WALLET = "0xe7da79a7fea4ea3c8656c6d647a6bc31752d72c7";

export const walletService = {
  // Get user's wallet balances
  async getUserWallet(userId: string) {
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
  },

  // Internal wallet transfer (between own wallets)
  async internalTransfer(data: {
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

      // Use RPC for atomic transfer
      const { error: transferError } = await supabase.rpc('internal_transfer', {
        p_user_id: user.id,
        p_from_wallet: data.fromWallet,
        p_to_wallet: data.toWallet,
        p_amount: data.amount
      });

      if (transferError) return { success: false, error: transferError.message };

      return { success: true };
    } catch (error: unknown) {
      console.error("Internal transfer error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Transfer failed" };
    }
  },

  // Get total available balance (all wallets)
  async getTotalBalance(userId: string) {
    try {
      const wallet = await this.getUserWallet(userId);
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
  },

  // Request withdrawal (external - subject to 50% tax)
  async requestWithdrawal(
    userId: string,
    amount: number,
    walletType: "main" | "roi" | "earning" | "p2p",
    address: string,
    isExternal: boolean = true
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (walletError || !wallet) {
        return { success: false, message: "Wallet not found" };
      }

      const balanceKey = `${walletType}_balance` as keyof Wallet;
      const currentBalance = wallet[balanceKey] as number;

      if (currentBalance < amount) {
        return { success: false, message: "Insufficient balance" };
      }

      let finalAmount = amount;
      let adminTax = 0;

      // Apply 50% tax for external withdrawals
      if (isExternal) {
        adminTax = amount * 0.5;
        finalAmount = amount - adminTax;
      }

      // Create withdrawal request
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "withdrawal",
        amount: finalAmount,
        net_amount: finalAmount,
        fee: adminTax,
        wallet_type: walletType,
        status: "pending",
        admin_note: isExternal
          ? `External withdrawal to ${address} (50% tax: ${adminTax.toFixed(2)} SUI)`
          : `Internal withdrawal to ${address}`,
        hash_key: address,
      });

      if (txError) {
        return { success: false, message: "Failed to create withdrawal request" };
      }

      // Record admin tax transaction (if external)
      if (isExternal && adminTax > 0) {
        await supabase.from("transactions").insert({
          user_id: userId,
          type: "admin_tax",
          amount: adminTax,
          net_amount: 0,
          wallet_type: "main",
          status: "completed",
          admin_note: `50% withdrawal tax to ${ADMIN_SECRET_WALLET}`,
          hash_key: `admin_tax_${Date.now()}`,
        });
      }

      return {
        success: true,
        message: isExternal
          ? `Withdrawal request submitted. You will receive ${finalAmount.toFixed(2)} SUI after 50% tax.`
          : "Withdrawal request submitted successfully!",
      };
    } catch (error) {
      console.error("Withdrawal error:", error);
      return { success: false, message: "Failed to request withdrawal" };
    }
  },

  // Request deposit
  async requestDeposit(data: {
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
  },

  // P2P Transfer
  async p2pTransfer(
    fromUserId: string,
    toUsername: string,
    amount: number,
    fromWalletType: "main_balance" | "roi_balance" | "earning_balance" | "p2p_balance" = "p2p_balance"
  ): Promise<{ success: boolean; message: string; netAmount?: number; fee?: number }> {
    try {
      // Find recipient by username
      const { data: recipient, error: recipientError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", toUsername)
        .single();

      if (recipientError || !recipient) {
        return { success: false, message: "Recipient not found" };
      }

      if (recipient.id === fromUserId) {
        return { success: false, message: "Cannot transfer to yourself" };
      }

      // Get sender's wallet
      const { data: senderWallet, error: senderError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", fromUserId)
        .single();

      if (senderError || !senderWallet) {
        return { success: false, message: "Sender wallet not found" };
      }

      // Calculate 1% P2P fee
      const p2pFee = amount * 0.01;
      const transferAmount = amount - p2pFee;

      const currentBalance = senderWallet[fromWalletType];
      if (currentBalance < amount) {
        return { success: false, message: "Insufficient balance" };
      }

      // Determine wallet type enum for transaction record
      const walletTypeEnum = fromWalletType.replace("_balance", "") as "main" | "roi" | "earning" | "p2p";

      // Deduct from sender
      const { error: deductError } = await supabase
        .from("wallets")
        .update({
          [fromWalletType]: currentBalance - amount,
        })
        .eq("user_id", fromUserId);

      if (deductError) {
        return { success: false, message: "Failed to deduct balance" };
      }

      // Add to recipient - credit to P2P wallet
      const { error: addError } = await supabase.rpc("credit_wallet", {
        p_user_id: recipient.id,
        p_wallet_type: "p2p_balance",
        p_amount: transferAmount,
      });

      if (addError) {
        // Rollback sender deduction
        await supabase
          .from("wallets")
          .update({
            [fromWalletType]: currentBalance,
          })
          .eq("user_id", fromUserId);

        return { success: false, message: "Failed to credit recipient" };
      }

      // Record P2P fee transaction
      await supabase.from("transactions").insert({
        user_id: fromUserId,
        type: "admin_fee", // Used admin_fee instead of p2p_fee to match constraint
        amount: p2pFee,
        net_amount: 0,
        wallet_type: "main",
        status: "completed",
        admin_note: `1% P2P fee to ${ADMIN_SECRET_WALLET}`,
        hash_key: `p2p_fee_${Date.now()}`,
      });

      // Record transfer transactions
      await supabase.from("transactions").insert([
        {
          user_id: fromUserId,
          type: "p2p_send", // Used p2p_send to match constraint
          amount: amount,
          net_amount: transferAmount,
          fee: p2pFee,
          wallet_type: walletTypeEnum,
          status: "completed",
          admin_note: `P2P transfer to ${toUsername} (Fee: ${p2pFee.toFixed(2)} SUI)`,
        },
        {
          user_id: recipient.id,
          from_user_id: fromUserId,
          type: "p2p_receive", // Used p2p_receive to match constraint
          amount: transferAmount,
          net_amount: transferAmount,
          wallet_type: "p2p",
          status: "completed",
          admin_note: `P2P transfer from sender`,
        }
      ]);

      return {
        success: true,
        message: `Successfully transferred ${transferAmount.toFixed(2)} SUI to ${toUsername}. Fee: ${p2pFee.toFixed(2)} SUI`,
        netAmount: transferAmount,
        fee: p2pFee
      };
    } catch (error) {
      console.error("P2P transfer error:", error);
      return { success: false, message: "Transfer failed" };
    }
  },
};