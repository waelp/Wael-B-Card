import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BusinessCard, CardTag } from "@/types/business-card";
import type { FilterState, SavedFilter, DateRange } from "@/types/filter";

const SAVED_FILTERS_KEY = "@saved_filters";
const ACTIVE_FILTER_KEY = "@active_filter";

/**
 * Filter service for business cards
 */
export const filterService = {
  /**
   * Apply filters to cards
   */
  applyFilters(cards: BusinessCard[], filters: FilterState): BusinessCard[] {
    let filtered = [...cards];

    // Filter by company
    if (filters.company) {
      filtered = filtered.filter((card) =>
        card.companyName?.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    // Filter by department
    if (filters.department) {
      filtered = filtered.filter((card) =>
        card.department?.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((card) =>
        filters.tags!.some((tag) => card.tags?.includes(tag as CardTag))
      );
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((card) => {
        if (!card.createdAt) return false;
        const cardDate = new Date(card.createdAt);

        switch (filters.dateRange) {
          case "today":
            return cardDate >= startOfDay;

          case "week": {
            const weekAgo = new Date(startOfDay);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return cardDate >= weekAgo;
          }

          case "month": {
            const monthAgo = new Date(startOfDay);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return cardDate >= monthAgo;
          }

          case "year": {
            const yearAgo = new Date(startOfDay);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return cardDate >= yearAgo;
          }

          case "custom":
            if (filters.customDateStart && filters.customDateEnd) {
              const start = new Date(filters.customDateStart);
              const end = new Date(filters.customDateEnd);
              end.setHours(23, 59, 59, 999);
              return cardDate >= start && cardDate <= end;
            }
            return true;

          default:
            return true;
        }
      });
    }

    return filtered;
  },

  /**
   * Get unique companies from cards
   */
  getUniqueCompanies(cards: BusinessCard[]): string[] {
    const companies = cards
      .map((card) => card.companyName)
      .filter((name): name is string => !!name);
    return Array.from(new Set(companies)).sort();
  },

  /**
   * Get unique departments from cards
   */
  getUniqueDepartments(cards: BusinessCard[]): string[] {
    const departments = cards
      .map((card) => card.department)
      .filter((dept): dept is string => !!dept);
    return Array.from(new Set(departments)).sort();
  },

  /**
   * Get unique tags from cards
   */
  getUniqueTags(cards: BusinessCard[]): string[] {
    const allTags = cards.flatMap((card) => card.tags || []);
    return Array.from(new Set(allTags)).sort();
  },

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filters: FilterState): boolean {
    return !!(
      filters.company ||
      filters.department ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.dateRange && filters.dateRange !== "all")
    );
  },

  /**
   * Clear all filters
   */
  clearFilters(): FilterState {
    return {
      company: undefined,
      department: undefined,
      dateRange: "all",
      tags: [],
    };
  },

  /**
   * Save a filter preset
   */
  async saveFilter(name: string, filters: FilterState): Promise<SavedFilter> {
    try {
      const savedFilter: SavedFilter = {
        id: Date.now().toString(),
        name,
        filters,
        createdAt: Date.now(),
      };

      const existing = await this.getSavedFilters();
      const updated = [...existing, savedFilter];

      await AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      return savedFilter;
    } catch (error) {
      console.error("Error saving filter:", error);
      throw error;
    }
  },

  /**
   * Get all saved filters
   */
  async getSavedFilters(): Promise<SavedFilter[]> {
    try {
      const data = await AsyncStorage.getItem(SAVED_FILTERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting saved filters:", error);
      return [];
    }
  },

  /**
   * Delete a saved filter
   */
  async deleteSavedFilter(id: string): Promise<void> {
    try {
      const existing = await this.getSavedFilters();
      const updated = existing.filter((f) => f.id !== id);
      await AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting saved filter:", error);
      throw error;
    }
  },

  /**
   * Save active filter state
   */
  async saveActiveFilter(filters: FilterState): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_FILTER_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving active filter:", error);
    }
  },

  /**
   * Get active filter state
   */
  async getActiveFilter(): Promise<FilterState> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_FILTER_KEY);
      return data ? JSON.parse(data) : this.clearFilters();
    } catch (error) {
      console.error("Error getting active filter:", error);
      return this.clearFilters();
    }
  },

  /**
   * Clear active filter
   */
  async clearActiveFilter(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_FILTER_KEY);
    } catch (error) {
      console.error("Error clearing active filter:", error);
    }
  },
};
