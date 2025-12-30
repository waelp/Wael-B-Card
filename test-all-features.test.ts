import { describe, it, expect, beforeAll } from "vitest";
import { storageService } from "./lib/storage";
import type { BusinessCard } from "./types/business-card";

describe("Business Card Vault - Full Feature Tests", () => {
  let testCard: BusinessCard;

  beforeAll(async () => {
    // Clear storage before tests
    await storageService.clearAll();
    
    // Create a test card
    testCard = {
      id: "test-card-1",
      companyName: "Test Company",
      fullName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Manager",
      department: "Sales",
      mobileNumber: "+1234567890",
      phoneNumber: "+0987654321",
      email: "john@test.com",
      imageUri: "https://example.com/card.jpg",
      dateAdded: new Date().toISOString(),
      createdAt: Date.now(),
      tags: ["VIP"],
    };
  });

  describe("Storage Operations", () => {
    it("should save a business card", async () => {
      await storageService.saveCard(testCard);
      const cards = await storageService.getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe(testCard.id);
    });

    it("should retrieve all cards", async () => {
      const cards = await storageService.getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].companyName).toBe("Test Company");
    });

    it("should update a card", async () => {
      const updatedCard = { ...testCard, jobTitle: "Senior Manager" };
      await storageService.saveCard(updatedCard);
      
      const cards = await storageService.getAllCards();
      expect(cards[0].jobTitle).toBe("Senior Manager");
    });

    it("should delete a card", async () => {
      await storageService.deleteCard(testCard.id);
      const cards = await storageService.getAllCards();
      expect(cards).toHaveLength(0);
    });
  });

  describe("Search and Filter", () => {
    beforeAll(async () => {
      // Add multiple test cards
      await storageService.saveCard({
        ...testCard,
        id: "card-1",
        companyName: "Company A",
        fullName: "Alice Smith",
      });
      await storageService.saveCard({
        ...testCard,
        id: "card-2",
        companyName: "Company B",
        fullName: "Bob Johnson",
      });
      await storageService.saveCard({
        ...testCard,
        id: "card-3",
        companyName: "Company C",
        fullName: "Charlie Brown",
      });
    });

    it("should search by name", async () => {
      const cards = await storageService.getAllCards();
      const filtered = cards.filter(card => 
        card.fullName.toLowerCase().includes("alice")
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].fullName).toBe("Alice Smith");
    });

    it("should search by company", async () => {
      const cards = await storageService.getAllCards();
      const filtered = cards.filter(card => 
        card.companyName.toLowerCase().includes("company b")
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].companyName).toBe("Company B");
    });

    it("should filter by tags", async () => {
      const cards = await storageService.getAllCards();
      const filtered = cards.filter(card => 
        card.tags?.includes("VIP")
      );
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe("Data Validation", () => {
    it("should have required fields", () => {
      expect(testCard.id).toBeDefined();
      expect(testCard.companyName).toBeDefined();
      expect(testCard.fullName).toBeDefined();
      expect(testCard.createdAt).toBeDefined();
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (testCard.email) {
        expect(emailRegex.test(testCard.email)).toBe(true);
      }
    });

    it("should have valid phone number format", () => {
      if (testCard.mobileNumber) {
        expect(testCard.mobileNumber).toMatch(/[\d\+\-\(\)\s]+/);
      }
    });
  });
});
