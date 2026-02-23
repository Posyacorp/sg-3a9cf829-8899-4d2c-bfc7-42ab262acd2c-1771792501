import { supabase } from "@/integrations/supabase/client";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  referralCode: string;
}

export interface DepositEmailData {
  userName: string;
  userEmail: string;
  amount: number;
  txHash: string;
  status: "pending" | "confirmed";
}

export interface WithdrawalEmailData {
  userName: string;
  userEmail: string;
  amount: number;
  walletAddress: string;
  status: "pending" | "approved" | "rejected";
  fees?: number;
}

export interface ROIEmailData {
  userName: string;
  userEmail: string;
  amount: number;
  packageName: string;
  totalEarned: number;
}

export interface ReferralCommissionEmailData {
  userName: string;
  userEmail: string;
  amount: number;
  fromUser: string;
  level: number;
}

/**
 * Send a custom email via API endpoint
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Email send failed:", result);
      return {
        success: false,
        message: "Failed to send email",
        error: result.error || "Unknown error",
      };
    }

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message: "Email service error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .code { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Sui24.trade!</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName}! 👋</h2>
          <p>Welcome to the future of crypto trading and earning! Your account has been successfully created.</p>
          
          <div class="code">
            <strong>Your Referral Code:</strong> ${data.referralCode}
          </div>
          
          <p>Share your referral code with friends and earn commission on 24 levels!</p>
          
          <h3>🚀 Get Started:</h3>
          <ul>
            <li>Deposit minimum 30 SUI to activate your account</li>
            <li>Choose a package and start earning ROI</li>
            <li>Click task buttons every 3 hours to claim rewards</li>
            <li>Trade with 1000x leverage on crypto futures</li>
            <li>Build your team and earn MLM commissions</li>
          </ul>
          
          <a href="https://sui24.trade/dashboard" class="button">Go to Dashboard</a>
          
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2026 Sui24.trade - All rights reserved</p>
          <p>This email was sent to ${data.userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: "Welcome to Sui24.trade - Your Account is Ready! 🎉",
    html,
  });
}

/**
 * Send deposit notification email
 */
export async function sendDepositEmail(data: DepositEmailData) {
  const statusColor = data.status === "confirmed" ? "#10b981" : "#f59e0b";
  const statusText = data.status === "confirmed" ? "Confirmed ✅" : "Pending ⏳";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { background: ${statusColor}; color: white; padding: 15px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
        .details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Deposit Notification</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName}!</h2>
          
          <div class="status">${statusText}</div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Amount:</strong></span>
              <span>${data.amount} SUI</span>
            </div>
            <div class="detail-row">
              <span><strong>Transaction Hash:</strong></span>
              <span style="word-break: break-all; font-size: 12px;">${data.txHash}</span>
            </div>
            <div class="detail-row">
              <span><strong>Status:</strong></span>
              <span>${statusText}</span>
            </div>
          </div>
          
          ${
            data.status === "pending"
              ? "<p>⏳ Your deposit is being processed. Admin will verify and confirm within 24 hours.</p>"
              : "<p>✅ Your deposit has been confirmed! The funds are now available in your main wallet.</p>"
          }
          
          <p>You can now purchase packages and start earning ROI!</p>
        </div>
        <div class="footer">
          <p>© 2026 Sui24.trade - All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `Deposit ${statusText} - ${data.amount} SUI`,
    html,
  });
}

/**
 * Send withdrawal notification email
 */
export async function sendWithdrawalEmail(data: WithdrawalEmailData) {
  const statusMap = {
    pending: { color: "#f59e0b", text: "Pending ⏳" },
    approved: { color: "#10b981", text: "Approved ✅" },
    rejected: { color: "#ef4444", text: "Rejected ❌" },
  };

  const status = statusMap[data.status];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { background: ${status.color}; color: white; padding: 15px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
        .details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💸 Withdrawal Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.userName}!</h2>
          
          <div class="status">${status.text}</div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Amount:</strong></span>
              <span>${data.amount} SUI</span>
            </div>
            ${
              data.fees
                ? `
            <div class="detail-row">
              <span><strong>Fees (50% Tax):</strong></span>
              <span>${data.fees} SUI</span>
            </div>
            <div class="detail-row">
              <span><strong>You Receive:</strong></span>
              <span>${data.amount - data.fees} SUI</span>
            </div>
            `
                : ""
            }
            <div class="detail-row">
              <span><strong>Wallet Address:</strong></span>
              <span style="word-break: break-all; font-size: 12px;">${data.walletAddress}</span>
            </div>
            <div class="detail-row">
              <span><strong>Status:</strong></span>
              <span>${status.text}</span>
            </div>
          </div>
          
          ${
            data.status === "pending"
              ? '<p>⏳ Your withdrawal request is being processed. Admin will review and process within 24 hours.</p><div class="warning">⚠️ <strong>Note:</strong> External withdrawals incur a 50% platform tax. The remaining 50% will be transferred to your wallet.</div>'
              : data.status === "approved"
                ? "<p>✅ Your withdrawal has been approved and processed! Check your wallet for the transaction.</p>"
                : "<p>❌ Your withdrawal request was rejected. Please contact support for more details.</p>"
          }
        </div>
        <div class="footer">
          <p>© 2026 Sui24.trade - All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `Withdrawal ${status.text} - ${data.amount} SUI`,
    html,
  });
}

/**
 * Send ROI earned notification email
 */
export async function sendROIEmail(data: ROIEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { background: #10b981; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .amount h1 { margin: 0; font-size: 36px; }
        .details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ROI Reward Earned!</h1>
        </div>
        <div class="content">
          <h2>Congratulations ${data.userName}!</h2>
          
          <div class="amount">
            <p style="margin: 0; font-size: 16px;">You've Earned</p>
            <h1>+${data.amount} SUI</h1>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Package:</strong></span>
              <span>${data.packageName}</span>
            </div>
            <div class="detail-row">
              <span><strong>This Reward:</strong></span>
              <span>${data.amount} SUI</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Earned:</strong></span>
              <span>${data.totalEarned} SUI</span>
            </div>
          </div>
          
          <p>✅ Your ROI reward has been credited to your ROI Wallet!</p>
          
          <p><strong>Remember:</strong> Click the task button every 3 hours to continue earning rewards. Don't miss the 30-minute window!</p>
          
          <a href="https://sui24.trade/dashboard" class="button">View Dashboard</a>
        </div>
        <div class="footer">
          <p>© 2026 Sui24.trade - All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `🎉 ROI Reward Earned - ${data.amount} SUI!`,
    html,
  });
}

/**
 * Send referral commission notification email
 */
export async function sendReferralCommissionEmail(data: ReferralCommissionEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { background: #f59e0b; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .amount h1 { margin: 0; font-size: 36px; }
        .details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .level-badge { background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Referral Commission!</h1>
        </div>
        <div class="content">
          <h2>Great News ${data.userName}!</h2>
          
          <div class="amount">
            <p style="margin: 0; font-size: 16px;">Commission Earned</p>
            <h1>+${data.amount} SUI</h1>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>From User:</strong></span>
              <span>${data.fromUser}</span>
            </div>
            <div class="detail-row">
              <span><strong>Level:</strong></span>
              <span><span class="level-badge">Level ${data.level}</span></span>
            </div>
            <div class="detail-row">
              <span><strong>Commission:</strong></span>
              <span>${data.amount} SUI</span>
            </div>
          </div>
          
          <p>✅ Your commission has been credited to your Earning Wallet!</p>
          
          <p><strong>Keep Building!</strong> Share your referral link and earn from 24 levels of your network!</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>💡 Pro Tip:</strong> The bigger your team, the more you earn! Keep sharing and building your network.
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Sui24.trade - All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `💰 Level ${data.level} Commission - ${data.amount} SUI!`,
    html,
  });
}