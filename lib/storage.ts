import AsyncStorage from "@react-native-async-storage/async-storage";
import { BusinessCard } from "@/types/business-card";

const STORAGE_KEY = "@business_cards";

export const storageService = {
  async getAllCards(): Promise<BusinessCard[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading cards:", error);
      return [];
    }
  },

  async saveCard(card: BusinessCard): Promise<void> {
    try {
      const cards = await this.getAllCards();
      
      // Check for duplicate mobile number
      const existingCard = cards.find(
        (c) => c.mobileNumber === card.mobileNumber
      );
      
      if (existingCard) {
        throw new Error("DUPLICATE_MOBILE");
      }
      
      cards.push(card);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      throw error;
    }
  },

  async updateCard(id: string, updatedCard: BusinessCard): Promise<void> {
    try {
      const cards = await this.getAllCards();
      const index = cards.findIndex((c) => c.id === id);
      
      if (index !== -1) {
        cards[index] = updatedCard;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      }
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  },

  async deleteCard(id: string): Promise<void> {
    try {
      const cards = await this.getAllCards();
      const filteredCards = cards.filter((c) => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
    } catch (error) {
      console.error("Error deleting card:", error);
      throw error;
    }
  },

  async searchCards(query: string): Promise<BusinessCard[]> {
    try {
      const cards = await this.getAllCards();
      const lowerQuery = query.toLowerCase();
      
      return cards.filter((card) => {
        return (
          card.companyName.toLowerCase().includes(lowerQuery) ||
          card.fullName.toLowerCase().includes(lowerQuery) ||
          card.firstName.toLowerCase().includes(lowerQuery) ||
          card.lastName.toLowerCase().includes(lowerQuery) ||
          card.jobTitle.toLowerCase().includes(lowerQuery) ||
          card.department.toLowerCase().includes(lowerQuery) ||
          card.mobileNumber.includes(lowerQuery) ||
          card.email.toLowerCase().includes(lowerQuery)
        );
      });
    } catch (error) {
      console.error("Error searching cards:", error);
      return [];
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },
};
