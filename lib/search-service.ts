import { BusinessCard } from "@/types/business-card";

export interface SearchOptions {
  searchName?: boolean;
  searchCompany?: boolean;
  searchPosition?: boolean;
  searchDepartment?: boolean;
  searchPhone?: boolean;
  searchEmail?: boolean;
  caseSensitive?: boolean;
}

const defaultOptions: SearchOptions = {
  searchName: true,
  searchCompany: true,
  searchPosition: true,
  searchDepartment: true,
  searchPhone: true,
  searchEmail: true,
  caseSensitive: false,
};

/**
 * Advanced search service for business cards
 * Supports searching by multiple fields with various options
 */
export const searchService = {
  /**
   * Search cards with advanced options
   */
  search(
    cards: BusinessCard[],
    query: string,
    options: SearchOptions = defaultOptions
  ): BusinessCard[] {
    if (!query || query.trim() === "") {
      return cards;
    }

    const searchTerm = options.caseSensitive
      ? query.trim()
      : query.trim().toLowerCase();

    return cards.filter((card) => {
      const matches: boolean[] = [];

      // Search by name (fullName, firstName, lastName)
      if (options.searchName) {
        const fullName = card.fullName || `${card.firstName} ${card.lastName}`;
        const nameMatch = options.caseSensitive
          ? fullName.includes(searchTerm)
          : fullName.toLowerCase().includes(searchTerm);
        matches.push(nameMatch);
      }

      // Search by company
      if (options.searchCompany && card.companyName) {
        const companyMatch = options.caseSensitive
          ? card.companyName.includes(searchTerm)
          : card.companyName.toLowerCase().includes(searchTerm);
        matches.push(companyMatch);
      }

      // Search by position/job title
      if (options.searchPosition && card.jobTitle) {
        const positionMatch = options.caseSensitive
          ? card.jobTitle.includes(searchTerm)
          : card.jobTitle.toLowerCase().includes(searchTerm);
        matches.push(positionMatch);
      }

      // Search by department
      if (options.searchDepartment && card.department) {
        const departmentMatch = options.caseSensitive
          ? card.department.includes(searchTerm)
          : card.department.toLowerCase().includes(searchTerm);
        matches.push(departmentMatch);
      }

      // Search by phone
      if (options.searchPhone) {
        const phoneMatch =
          card.mobileNumber?.includes(searchTerm) ||
          card.phoneNumber?.includes(searchTerm);
        matches.push(phoneMatch);
      }

      // Search by email
      if (options.searchEmail && card.email) {
        const emailMatch = options.caseSensitive
          ? card.email.includes(searchTerm)
          : card.email.toLowerCase().includes(searchTerm);
        matches.push(emailMatch);
      }

      // Return true if any field matches
      return matches.some((match) => match === true);
    });
  },

  /**
   * Search cards by specific field
   */
  searchByField(
    cards: BusinessCard[],
    field: "name" | "company" | "position" | "department" | "phone" | "email",
    query: string
  ): BusinessCard[] {
    const options: SearchOptions = {
      searchName: field === "name",
      searchCompany: field === "company",
      searchPosition: field === "position",
      searchDepartment: field === "department",
      searchPhone: field === "phone",
      searchEmail: field === "email",
      caseSensitive: false,
    };

    return this.search(cards, query, options);
  },

  /**
   * Get search suggestions based on existing data
   */
  getSuggestions(
    cards: BusinessCard[],
    query: string,
    maxSuggestions: number = 5
  ): string[] {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const suggestions = new Set<string>();

    cards.forEach((card) => {
      // Add matching names
      const fullName = card.fullName || `${card.firstName} ${card.lastName}`;
      if (fullName.toLowerCase().includes(searchTerm)) {
        suggestions.add(fullName);
      }

      // Add matching companies
      if (card.companyName?.toLowerCase().includes(searchTerm)) {
        suggestions.add(card.companyName);
      }

      // Add matching positions
      if (card.jobTitle?.toLowerCase().includes(searchTerm)) {
        suggestions.add(card.jobTitle);
      }

      // Add matching departments
      if (card.department?.toLowerCase().includes(searchTerm)) {
        suggestions.add(card.department);
      }
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  },

  /**
   * Highlight matching text in search results
   */
  highlightMatch(text: string, query: string): { text: string; isMatch: boolean }[] {
    if (!query || !text) {
      return [{ text, isMatch: false }];
    }

    const searchTerm = query.toLowerCase();
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(searchTerm);

    if (index === -1) {
      return [{ text, isMatch: false }];
    }

    const result: { text: string; isMatch: boolean }[] = [];

    if (index > 0) {
      result.push({ text: text.substring(0, index), isMatch: false });
    }

    result.push({
      text: text.substring(index, index + query.length),
      isMatch: true,
    });

    if (index + query.length < text.length) {
      result.push({
        text: text.substring(index + query.length),
        isMatch: false,
      });
    }

    return result;
  },

  /**
   * Get unique values for a specific field
   */
  getUniqueValues(
    cards: BusinessCard[],
    field: "company" | "department" | "position"
  ): string[] {
    const values = new Set<string>();

    cards.forEach((card) => {
      let value: string | undefined;

      switch (field) {
        case "company":
          value = card.companyName;
          break;
        case "department":
          value = card.department;
          break;
        case "position":
          value = card.jobTitle;
          break;
      }

      if (value && value.trim()) {
        values.add(value.trim());
      }
    });

    return Array.from(values).sort();
  },
};
