import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { appUsers, InsertAppUser, AppUser } from "../drizzle/schema";
import * as crypto from "crypto";

/**
 * Password validation rules:
 * - Minimum 6 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  return { valid: true, message: "Password is valid" };
}

/**
 * Hash password using SHA-256 with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}

/**
 * Generate 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create new user
 */
export async function createUser(data: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}): Promise<{ success: boolean; userId?: number; error?: string; verificationCode?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.message };
  }

  // Check if email already exists
  const existingUser = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, data.email.toLowerCase()))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "Email already registered" };
  }

  // Generate verification code
  const verificationCode = generateVerificationCode();
  const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Hash password
  const passwordHash = hashPassword(data.password);

  // Create user
  const result = await db.insert(appUsers).values({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    phoneNumber: data.phoneNumber || null,
    passwordHash,
    isEmailVerified: false,
    verificationCode,
    verificationCodeExpiry,
  });

  // Get the inserted ID from the result
  const insertedId = (result as any)[0]?.insertId || (result as any).insertId || 0;

  return {
    success: true,
    userId: insertedId,
    verificationCode,
  };
}

/**
 * Verify email with code
 */
export async function verifyEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.toLowerCase()))
    .limit(1);

  if (users.length === 0) {
    return { success: false, error: "User not found" };
  }

  const user = users[0];

  if (user.isEmailVerified) {
    return { success: false, error: "Email already verified" };
  }

  if (user.verificationCode !== code) {
    return { success: false, error: "Invalid verification code" };
  }

  if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
    return { success: false, error: "Verification code expired" };
  }

  // Update user as verified
  await db
    .update(appUsers)
    .set({
      isEmailVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null,
    })
    .where(eq(appUsers.id, user.id));

  return { success: true };
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.toLowerCase()))
    .limit(1);

  if (users.length === 0) {
    return { success: false, error: "Invalid email or password" };
  }

  const user = users[0];

  if (!user.isEmailVerified) {
    return { success: false, error: "Please verify your email first" };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: "Invalid email or password" };
  }

  // Update last login
  await db
    .update(appUsers)
    .set({ lastLogin: new Date() })
    .where(eq(appUsers.id, user.id));

  return { success: true, user };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; resetToken?: string; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.toLowerCase()))
    .limit(1);

  if (users.length === 0) {
    // Don't reveal if email exists
    return { success: true };
  }

  const user = users[0];
  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(appUsers)
    .set({ resetToken, resetTokenExpiry })
    .where(eq(appUsers.id, user.id));

  return { success: true, resetToken };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.message };
  }

  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.toLowerCase()))
    .limit(1);

  if (users.length === 0) {
    return { success: false, error: "Invalid reset request" };
  }

  const user = users[0];

  if (user.resetToken !== token) {
    return { success: false, error: "Invalid reset token" };
  }

  if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
    return { success: false, error: "Reset token expired" };
  }

  // Update password
  const passwordHash = hashPassword(newPassword);
  await db
    .update(appUsers)
    .set({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    })
    .where(eq(appUsers.id, user.id));

  return { success: true };
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<AppUser | null> {
  const db = await getDb();
  if (!db) return null;

  const users = await db.select().from(appUsers).where(eq(appUsers.id, id)).limit(1);
  return users[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const db = await getDb();
  if (!db) return null;

  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.toLowerCase()))
    .limit(1);
  return users[0] || null;
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(
  email: string
): Promise<{ success: boolean; verificationCode?: string; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email.toLowerCase()))
    .limit(1);

  if (users.length === 0) {
    return { success: false, error: "User not found" };
  }

  const user = users[0];

  if (user.isEmailVerified) {
    return { success: false, error: "Email already verified" };
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await db
    .update(appUsers)
    .set({ verificationCode, verificationCodeExpiry })
    .where(eq(appUsers.id, user.id));

  return { success: true, verificationCode };
}
