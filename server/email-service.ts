/**
 * Email Service for BizCapture
 * Uses Gmail MCP for sending emails
 */

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

/**
 * Send verification code email
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const subject = "BizCapture - Email Verification Code";
  const body = `
Hello ${userName},

Welcome to BizCapture by DSOX!

Your verification code is: ${code}

This code will expire in 15 minutes.

If you did not create an account, please ignore this email.

Best regards,
BizCapture Team
DSOX - Simplifying the Business World
  `.trim();

  try {
    // In production, this would use Gmail MCP or another email service
    console.log(`[Email] Sending verification email to ${email}`);
    console.log(`[Email] Code: ${code}`);
    
    // For now, we'll simulate success
    // In production, integrate with Gmail MCP:
    // await gmailMCP.sendEmail({ to: email, subject, body });
    
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  // In a real app, this would be a proper URL
  const resetLink = `bizcapture://reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const subject = "BizCapture - Password Reset Request";
  const body = `
Hello ${userName || "User"},

You requested to reset your password for BizCapture.

Click the link below to reset your password:
${resetLink}

Or use this token in the app: ${resetToken.substring(0, 8)}...

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email.

Best regards,
BizCapture Team
DSOX - Simplifying the Business World
  `.trim();

  try {
    console.log(`[Email] Sending password reset email to ${email}`);
    console.log(`[Email] Reset token: ${resetToken.substring(0, 8)}...`);
    
    // For now, simulate success
    // In production, integrate with Gmail MCP
    
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const subject = "Welcome to BizCapture!";
  const body = `
Hello ${userName},

Welcome to BizCapture by DSOX!

Your account has been successfully verified. You can now:

✓ Capture business cards with AI-powered OCR
✓ Organize your contacts efficiently
✓ Search and filter your card collection
✓ Export data to CSV or Excel
✓ Import contacts from external files

Thank you for choosing BizCapture!

Best regards,
BizCapture Team
DSOX - Simplifying the Business World
  `.trim();

  try {
    console.log(`[Email] Sending welcome email to ${email}`);
    
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
