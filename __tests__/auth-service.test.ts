import { describe, it, expect } from "vitest";
import {
  validatePassword,
  hashPassword,
  verifyPassword,
  generateVerificationCode,
  generateResetToken,
} from "../server/auth-service";

describe("Auth Service", () => {
  describe("validatePassword", () => {
    it("should reject passwords shorter than 6 characters", () => {
      const result = validatePassword("Ab1@");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("at least 6 characters");
    });

    it("should reject passwords without uppercase letters", () => {
      const result = validatePassword("abc123@#");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("uppercase");
    });

    it("should reject passwords without lowercase letters", () => {
      const result = validatePassword("ABC123@#");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("lowercase");
    });

    it("should reject passwords without numbers", () => {
      const result = validatePassword("Abcdef@#");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("number");
    });

    it("should reject passwords without special characters", () => {
      const result = validatePassword("Abcdef123");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("special character");
    });

    it("should accept valid passwords", () => {
      const result = validatePassword("Abc123@#");
      expect(result.valid).toBe(true);
    });

    it("should accept complex valid passwords", () => {
      const result = validatePassword("MyP@ssw0rd!");
      expect(result.valid).toBe(true);
    });
  });

  describe("hashPassword and verifyPassword", () => {
    it("should hash and verify passwords correctly", () => {
      const password = "TestPassword123!";
      const hash = hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toContain(":");
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject incorrect passwords", () => {
      const password = "TestPassword123!";
      const hash = hashPassword(password);
      
      expect(verifyPassword("WrongPassword123!", hash)).toBe(false);
    });

    it("should generate different hashes for same password (due to salt)", () => {
      const password = "TestPassword123!";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      // But both should verify correctly
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe("generateVerificationCode", () => {
    it("should generate 6-digit codes", () => {
      const code = generateVerificationCode();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it("should generate different codes each time", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateVerificationCode());
      }
      // Should have at least 90 unique codes out of 100
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe("generateResetToken", () => {
    it("should generate 64-character hex tokens", () => {
      const token = generateResetToken();
      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate unique tokens", () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateResetToken());
      }
      expect(tokens.size).toBe(100);
    });
  });
});
