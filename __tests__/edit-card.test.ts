import { describe, it, expect, beforeEach } from "vitest";
import { storageService } from "../lib/storage.js";
import { exportService } from "../lib/export-service.js";
import type { BusinessCard } from "../types/business-card.js";

describe("Edit Card Feature", () => {
  let testCard: BusinessCard;

  beforeEach(async () => {
    // Clear storage before each test
    await storageService.clearAll();

    // Create a test card
    testCard = {
      id: "test-card-1",
      fullName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Software Engineer",
      department: "Engineering",
      companyName: "Tech Corp",
      mobileNumber: "+1234567890",
      phoneNumber: "+0987654321",
      email: "john.doe@techcorp.com",
      website: "https://techcorp.com",
      address: "123 Tech Street",
      notes: "Test notes",
      imageUri: "",
      tags: [],
      createdAt: Date.now(),
      dateAdded: new Date().toISOString(),
    };

    await storageService.saveCard(testCard);
  });

  describe("Update Card", () => {
    it("should update card name", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        fullName: "Jane Smith",
        firstName: "Jane",
        lastName: "Smith",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === testCard.id);

      expect(card).toBeDefined();
      expect(card?.fullName).toBe("Jane Smith");
      expect(card?.firstName).toBe("Jane");
      expect(card?.lastName).toBe("Smith");
    });

    it("should update job title and department", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        jobTitle: "Senior Engineer",
        department: "R&D",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === testCard.id);

      expect(card?.jobTitle).toBe("Senior Engineer");
      expect(card?.department).toBe("R&D");
    });

    it("should update company name", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        companyName: "New Tech Inc",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === testCard.id);

      expect(card?.companyName).toBe("New Tech Inc");
    });

    it("should update contact information", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        mobileNumber: "+9999999999",
        phoneNumber: "+8888888888",
        email: "newemail@example.com",
        website: "https://newwebsite.com",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === testCard.id);

      expect(card?.mobileNumber).toBe("+9999999999");
      expect(card?.phoneNumber).toBe("+8888888888");
      expect(card?.email).toBe("newemail@example.com");
      expect(card?.website).toBe("https://newwebsite.com");
    });

    it("should update address and notes", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        address: "456 New Street, City",
        notes: "Updated notes with more information",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === testCard.id);

      expect(card?.address).toBe("456 New Street, City");
      expect(card?.notes).toBe("Updated notes with more information");
    });

    it("should update all fields at once", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        fullName: "Updated Name",
        firstName: "Updated",
        lastName: "Name",
        jobTitle: "Updated Title",
        department: "Updated Dept",
        companyName: "Updated Company",
        mobileNumber: "+1111111111",
        phoneNumber: "+2222222222",
        email: "updated@example.com",
        website: "https://updated.com",
        address: "Updated Address",
        notes: "Updated Notes",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      const card = cards.find((c) => c.id === testCard.id);

      expect(card?.fullName).toBe("Updated Name");
      expect(card?.jobTitle).toBe("Updated Title");
      expect(card?.companyName).toBe("Updated Company");
      expect(card?.mobileNumber).toBe("+1111111111");
      expect(card?.email).toBe("updated@example.com");
      expect(card?.address).toBe("Updated Address");
    });

    it("should not affect other cards when updating one card", async () => {
      // Add another card
      const secondCard: BusinessCard = {
        id: "test-card-2",
        fullName: "Alice Johnson",
        firstName: "Alice",
        lastName: "Johnson",
        jobTitle: "Designer",
        department: "Design",
        companyName: "Design Co",
        mobileNumber: "+5555555555",
        phoneNumber: "",
        email: "alice@designco.com",
        website: "",
        address: "",
        notes: "",
        imageUri: "",
        tags: [],
        createdAt: Date.now(),
        dateAdded: new Date().toISOString(),
      };

      await storageService.saveCard(secondCard);

      // Update first card
      const updatedCard: BusinessCard = {
        ...testCard,
        fullName: "Updated John",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      
      expect(cards).toHaveLength(2);
      
      const firstCard = cards.find((c) => c.id === testCard.id);
      const secondCardResult = cards.find((c) => c.id === secondCard.id);

      expect(firstCard?.fullName).toBe("Updated John");
      expect(secondCardResult?.fullName).toBe("Alice Johnson");
    });
  });

  describe("Excel Export After Update", () => {
    it("should export updated data to Excel", async () => {
      const updatedCard: BusinessCard = {
        ...testCard,
        fullName: "Updated for Excel",
        jobTitle: "Excel Test Title",
      };

      await storageService.updateCard(testCard.id, updatedCard);

      const cards = await storageService.getAllCards();
      
      // This should not throw an error
      await expect(exportService.exportToExcel(cards)).resolves.not.toThrow();
    });
  });
});
