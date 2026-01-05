import { describe, it, expect, vi } from "vitest";
import type { BusinessCard, CardTag } from "../types/business-card";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getAllKeys: vi.fn(),
    multiGet: vi.fn(),
    multiRemove: vi.fn(),
  },
}));

// Test data
const mockCard: BusinessCard = {
  id: "test-123",
  companyName: "شركة التقنية",
  fullName: "أحمد محمد",
  firstName: "أحمد",
  lastName: "محمد",
  jobTitle: "مدير المالية",
  department: "الإدارة المالية",
  mobileNumber: "+966501234567",
  phoneNumber: "+96612345678",
  email: "ahmed@tech.com",
  dateAdded: new Date().toISOString(),
  tags: ["VIP"],
};

const mockCard2: BusinessCard = {
  id: "test-456",
  companyName: "مؤسسة الأعمال",
  fullName: "سارة علي",
  firstName: "سارة",
  lastName: "علي",
  jobTitle: "مديرة التسويق",
  department: "التسويق",
  mobileNumber: "+966509876543",
  phoneNumber: "",
  email: "sara@business.com",
  dateAdded: new Date().toISOString(),
  tags: ["Important"],
};

// Import services using relative paths
import { searchService } from "../lib/search-service";
import { duplicateDetectionService } from "../lib/duplicate-detection";
import { filterService } from "../lib/filter-service";

describe("Search Service", () => {
  const cards = [mockCard, mockCard2];

  it("should search by name", () => {
    const results = searchService.search(cards, "أحمد");
    expect(results.length).toBe(1);
    expect(results[0].fullName).toBe("أحمد محمد");
  });

  it("should search by company", () => {
    const results = searchService.search(cards, "التقنية");
    expect(results.length).toBe(1);
    expect(results[0].companyName).toBe("شركة التقنية");
  });

  it("should search by position/job title", () => {
    const results = searchService.search(cards, "مدير");
    expect(results.length).toBe(2); // Both have "مدير" in job title
  });

  it("should search by department", () => {
    const results = searchService.search(cards, "المالية");
    expect(results.length).toBe(1);
    expect(results[0].department).toBe("الإدارة المالية");
  });

  it("should search by phone number", () => {
    const results = searchService.search(cards, "501234567");
    expect(results.length).toBe(1);
    expect(results[0].mobileNumber).toBe("+966501234567");
  });

  it("should search by email", () => {
    const results = searchService.search(cards, "ahmed@tech");
    expect(results.length).toBe(1);
    expect(results[0].email).toBe("ahmed@tech.com");
  });

  it("should return all cards for empty query", () => {
    const results = searchService.search(cards, "");
    expect(results.length).toBe(2);
  });

  it("should search by specific field only", () => {
    const results = searchService.searchByField(cards, "department", "التسويق");
    expect(results.length).toBe(1);
    expect(results[0].department).toBe("التسويق");
  });

  it("should get unique values for a field", () => {
    const companies = searchService.getUniqueValues(cards, "company");
    expect(companies.length).toBe(2);
    expect(companies).toContain("شركة التقنية");
    expect(companies).toContain("مؤسسة الأعمال");
  });

  it("should get search suggestions", () => {
    const suggestions = searchService.getSuggestions(cards, "أح");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).toContain("أحمد محمد");
  });
});

describe("Duplicate Detection Service", () => {
  const existingCards = [mockCard, mockCard2];

  it("should detect duplicate by phone number", () => {
    const newCard: BusinessCard = {
      ...mockCard,
      id: "new-123",
      fullName: "شخص آخر",
    };

    const duplicate = duplicateDetectionService.findDuplicate(
      newCard,
      existingCards
    );

    expect(duplicate).not.toBeNull();
    expect(duplicate?.id).toBe(mockCard.id);
  });

  it("should not find duplicate for new phone number", () => {
    const newCard: BusinessCard = {
      ...mockCard,
      id: "new-123",
      mobileNumber: "+966555555555",
      phoneNumber: "+966111111111", // Also change phone number
    };

    const duplicate = duplicateDetectionService.findDuplicate(
      newCard,
      existingCards
    );

    expect(duplicate).toBeNull();
  });

  it("should normalize phone numbers for comparison", () => {
    const newCard: BusinessCard = {
      ...mockCard,
      id: "new-123",
      mobileNumber: "00966501234567", // Different format
    };

    const duplicate = duplicateDetectionService.findDuplicate(
      newCard,
      existingCards
    );

    expect(duplicate).not.toBeNull();
  });
});

describe("Filter Service", () => {
  const cards = [mockCard, mockCard2];

  it("should filter by company", () => {
    const filters = {
      company: "شركة التقنية",
      dateRange: "all" as const,
      tags: [] as CardTag[],
    };

    const results = filterService.applyFilters(cards, filters);
    expect(results.length).toBe(1);
    expect(results[0].companyName).toBe("شركة التقنية");
  });

  it("should filter by department", () => {
    const filters = {
      department: "التسويق",
      dateRange: "all" as const,
      tags: [] as CardTag[],
    };

    const results = filterService.applyFilters(cards, filters);
    expect(results.length).toBe(1);
    expect(results[0].department).toBe("التسويق");
  });

  it("should filter by tags", () => {
    const filters = {
      dateRange: "all" as const,
      tags: ["VIP"] as CardTag[],
    };

    const results = filterService.applyFilters(cards, filters);
    expect(results.length).toBe(1);
    expect(results[0].tags).toContain("VIP");
  });

  it("should return all cards when no filters applied", () => {
    const filters = {
      dateRange: "all" as const,
      tags: [] as CardTag[],
    };

    const results = filterService.applyFilters(cards, filters);
    expect(results.length).toBe(2);
  });

  it("should get unique companies", () => {
    const companies = filterService.getUniqueCompanies(cards);
    expect(companies.length).toBe(2);
  });

  it("should get unique departments", () => {
    const departments = filterService.getUniqueDepartments(cards);
    expect(departments.length).toBe(2);
  });

  it("should check if filters are active", () => {
    const noFilters = {
      dateRange: "all" as const,
      tags: [] as CardTag[],
    };

    const withFilters = {
      company: "شركة",
      dateRange: "all" as const,
      tags: [] as CardTag[],
    };

    expect(filterService.hasActiveFilters(noFilters)).toBe(false);
    expect(filterService.hasActiveFilters(withFilters)).toBe(true);
  });
});
