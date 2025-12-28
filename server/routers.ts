import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { extractBusinessCardData } from "./ocr-service";

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
