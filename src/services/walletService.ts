import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// type Transaction = Database['public']['Tables']['transactions']['Row'];
type Wallet = Database['public']['Tables']['wallets']['Row'];

const ADMIN_SECRET_WALLET = "0xe7da79a7fea4ea3c8656c6d647a6bc31752d72c7";

export const walletService = {
  // Get all wallets for a user
  async getUserWallets(userId: string) {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    
    // Transform to object format for easier access if needed by frontend
    const walletsMap = {
      main: data?.find(w => w.wallet_type === 'main') || null,
      roi: data?.find(w => w.wallet_type === 'roi') || null,
      earning: data?.find(w => w.wallet_type === 'earning') || null,
      p2p: data?.find(w => w.wallet_type === 'p2p') || null,
    };

    return {
      raw: data || [],
      map: walletsMap
    };
  },

  // Get specific wallet
  async getWallet(userId: string, type: 'main' | 'roi' | 'earning' | 'p2p') {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .eq("wallet_type", type)
      .single();

    if (error) throw error;
    return data;
  },

  // Create transaction
  async createTransaction(transaction: any) {
    // Map 'type' to 'transaction_type' if needed
    const dbTransaction = {
      ...transaction,
      transaction_type: transaction.type || transaction.transaction_type,
      type: undefined // Remove old field
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert(dbTransaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Internal wallet transfer (between own wallets)
  async internalTransfer(data: {
    fromWallet: "main" | "roi" | "earning" | "p2p";
    toWallet: "main" | "roi" | "earning" | "p2p";
    amount: number;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      if (data.fromWallet === data.toWallet) {
        return { success: false, error: "Cannot transfer to same wallet" };
      }

      // Check balance first
      const { data: sourceWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .eq("wallet_type", data.fromWallet)
        .single();

      if (!sourceWallet || (sourceWallet.balance || 0) < data.amount) {
        return { success: false, error: "Insufficient balance" };
      }

      // Perform transfer (simple version without RPC for now to avoid complexity)
      // Deduct
      await supabase
        .from("wallets")
        .update({ balance: (sourceWallet.balance || 0) - data.amount })
        .eq("user_id", user.id)
        .eq("wallet_type", data.fromWallet);

      // Add (fetch target first)
      const { data: targetWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .eq("wallet_type", data.toWallet)
        .single();

      await supabase
        .from("wallets")
        .update({ balance: (targetWallet?.balance || 0) + data.amount })
        .eq("user_id", user.id)
        .eq("wallet_type", data.toWallet);

      // Record transaction
      await this.createTransaction({
        user_id: user.id,
        type: 'internal_transfer', // Will be mapped to transaction_type
        from_wallet: data.fromWallet,
        to_wallet: data.toWallet,
        amount: data.amount,
        status: 'completed',
        admin_notes: `Transfer from ${data.fromWallet} to ${data.toWallet}`
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("Internal transfer error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Transfer failed" };
    }
  },

  // Request withdrawal
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
        .eq("wallet_type", walletType)
        .single();

      if (walletError || !wallet) {
        return { success: false, message: "Wallet not found" };
      }

      const currentBalance = wallet.balance || 0;

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
        transaction_type: "withdrawal",
        amount: finalAmount,
        fee: adminTax,
        from_wallet: walletType,
        status: "pending",
        admin_notes: isExternal
          ? `External withdrawal to ${address} (50% tax: ${adminTax.toFixed(2)} SUI)`
          : `Internal withdrawal to ${address}`,
        hash_key: address,
      } as any);

      if (txError) {
        return { success: false, message: "Failed to create withdrawal request" };
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

      // Create deposit transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "deposit",
          to_wallet: "main",
          amount: data.amount,
          hash_key: data.hashKey,
          wallet_address: data.walletAddress,
          status: "pending",
          admin_notes: "Deposit request - awaiting admin verification",
        } as any)
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
    fromWalletType: "main" | "roi" | "earning" | "p2p" = "p2p"
  ): Promise<{ success: boolean; message: string; netAmount?: number; fee?: number }> {
    try {
      // Find recipient
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
        .eq("wallet_type", fromWalletType)
        .single();

      if (senderError || !senderWallet) {
        return { success: false, message: "Sender wallet not found" };
      }

      const p2pFee = amount * 0.01;
      const transferAmount = amount - p2pFee;

      if ((senderWallet.balance || 0) < amount) {
        return { success: false, message: "Insufficient balance" };
      }

      // Deduct from sender
      await supabase
        .from("wallets")
        .update({
          balance: (senderWallet.balance || 0) - amount,
        })
        .eq("id", senderWallet.id);

      // Add to recipient P2P wallet
      const { data: recipientWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", recipient.id)
        .eq("wallet_type", "p2p")
        .single();

      if (recipientWallet) {
        await supabase
          .from("wallets")
          .update({
             balance: (recipientWallet.balance || 0) + transferAmount
          })
          .eq("id", recipientWallet.id);
      } else {
         // Create if doesn't exist (should exist by default but safety check)
         await supabase.from("wallets").insert({
            user_id: recipient.id,
            wallet_type: "p2p",
            balance: transferAmount
         });
      }

      // Record transactions
      await supabase.from("transactions").insert([
        {
          user_id: fromUserId,
          transaction_type: "p2p_transfer",
          amount: amount,
          fee: p2pFee,
          from_wallet: fromWalletType,
          status: "completed",
          admin_notes: `P2P transfer to ${toUsername}`,
          recipient_id: recipient.id
        } as any
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