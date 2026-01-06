import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { extractBusinessCardData } from "./ocr-service";
import * as authService from "./auth-service";
import * as emailService from "./email-service";

// Password validation schema
const passwordSchema = z.string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character");

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // BizCapture User Authentication
  appAuth: router({
    // Register new user
    register: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(2, "Name must be at least 2 characters"),
          email: z.string().email("Invalid email address"),
          phoneNumber: z.string().optional(),
          password: passwordSchema,
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.createUser({
          fullName: input.fullName,
          email: input.email,
          phoneNumber: input.phoneNumber,
          password: input.password,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Send verification email
        await emailService.sendVerificationEmail(
          input.email,
          result.verificationCode!,
          input.fullName
        );

        return {
          success: true,
          message: "Registration successful. Please check your email for verification code.",
          userId: result.userId,
        };
      }),

    // Verify email with code
    verifyEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          code: z.string().length(6, "Verification code must be 6 digits"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.verifyEmail(input.email, input.code);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Send welcome email
        const user = await authService.getUserByEmail(input.email);
        if (user) {
          await emailService.sendWelcomeEmail(input.email, user.fullName);
        }

        return {
          success: true,
          message: "Email verified successfully. You can now log in.",
        };
      }),

    // Resend verification code
    resendCode: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await authService.resendVerificationCode(input.email);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        const user = await authService.getUserByEmail(input.email);
        if (user && result.verificationCode) {
          await emailService.sendVerificationEmail(
            input.email,
            result.verificationCode,
            user.fullName
          );
        }

        return {
          success: true,
          message: "Verification code sent to your email.",
        };
      }),

    // Login
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.loginUser(input.email, input.password);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Return user data (excluding sensitive fields)
        const { passwordHash, verificationCode, resetToken, ...safeUser } = result.user!;

        return {
          success: true,
          user: safeUser,
        };
      }),

    // Request password reset
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await authService.requestPasswordReset(input.email);

        if (result.resetToken) {
          const user = await authService.getUserByEmail(input.email);
          await emailService.sendPasswordResetEmail(
            input.email,
            result.resetToken,
            user?.fullName || ""
          );
        }

        // Always return success to prevent email enumeration
        return {
          success: true,
          message: "If an account exists with this email, a reset link has been sent.",
        };
      }),

    // Reset password with token
    resetPassword: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          token: z.string(),
          newPassword: passwordSchema,
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.resetPassword(
          input.email,
          input.token,
          input.newPassword
        );

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          message: "Password reset successful. You can now log in with your new password.",
        };
      }),

    // Get user profile
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await authService.getUserById(input.userId);

        if (!user) {
          return { success: false, error: "User not found" };
        }

        const { passwordHash, verificationCode, resetToken, ...safeUser } = user;
        return { success: true, user: safeUser };
      }),
  }),

  // OCR endpoint for business card extraction
  ocr: router({
    extractCard: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url("Invalid image URL"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const data = await extractBusinessCardData(input.imageUrl);
          return {
            success: true,
            data,
          };
        } catch (error) {
          console.error("OCR extraction error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            data: null,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
