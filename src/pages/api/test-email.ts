import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Test endpoint to verify Resend email integration
 * Usage: POST /api/test-email with JSON body: { "email": "test@example.com" }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    // Test email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #10b981; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .code { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Test Successful!</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2 style="margin: 0;">🎉 Resend Integration Works!</h2>
            </div>
            
            <p>Congratulations! Your Sui24.trade email system is properly configured and working.</p>
            
            <h3>✅ Verified:</h3>
            <ul>
              <li>Resend API connection successful</li>
              <li>DNS records properly configured</li>
              <li>Email delivery working</li>
              <li>HTML rendering functional</li>
            </ul>
            
            <div class="code">
              <strong>Test Details:</strong><br>
              Sent: ${new Date().toLocaleString()}<br>
              From: noreply@sui24.trade<br>
              To: ${email}
            </div>
            
            <h3>🚀 Ready to use:</h3>
            <ul>
              <li>Welcome emails for new signups</li>
              <li>Deposit confirmations</li>
              <li>Withdrawal notifications</li>
              <li>ROI reward alerts</li>
              <li>Referral commission emails</li>
            </ul>
            
            <p><strong>Next steps:</strong> Your email system is ready to send automated notifications to users!</p>
          </div>
          <div class="footer">
            <p>© 2026 Sui24.trade - All rights reserved</p>
            <p>This is a test email sent at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send test email
    const response = await fetch(`${req.headers.origin}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "✅ Sui24.trade Email Test - Success!",
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Test email failed",
        details: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      emailId: result.emailId,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}