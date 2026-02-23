import type { NextApiRequest, NextApiResponse } from "next";

// Environment variable validation
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@sui24.trade";

if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set in environment variables");
}

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
    name: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate API key
  if (!RESEND_API_KEY) {
    console.error("❌ Resend API key is missing");
    return res.status(500).json({ 
      error: "Email service not configured",
      details: "RESEND_API_KEY environment variable is not set"
    });
  }

  try {
    const { to, subject, html, from } = req.body as EmailRequest;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "to, subject, and html are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        error: "Invalid email address",
        details: `"${to}" is not a valid email address`
      });
    }

    console.log("📧 Sending email via Resend API...");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("From:", from || FROM_EMAIL);

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from || FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const data = (await response.json()) as ResendResponse;

    // Handle Resend API errors
    if (!response.ok) {
      console.error("❌ Resend API error:", data);
      return res.status(response.status).json({
        error: "Failed to send email",
        details: data.error?.message || "Unknown error from Resend API",
        resendError: data.error,
      });
    }

    console.log("✅ Email sent successfully!");
    console.log("Email ID:", data.id);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      emailId: data.id,
    });
  } catch (error) {
    console.error("❌ Email send error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}