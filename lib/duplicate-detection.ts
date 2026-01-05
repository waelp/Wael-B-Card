import { BusinessCard } from '@/types/business-card';

/**
 * Duplicate detection service for business cards
 * Uses mobile number as the primary unique identifier
 */
export const duplicateDetectionService = {
  /**
   * Normalize phone number for comparison
   * Removes spaces, dashes, and country codes for consistent matching
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Remove leading + and country codes (common ones)
    normalized = normalized.replace(/^\+?966/, ''); // Saudi Arabia
    normalized = normalized.replace(/^\+?971/, ''); // UAE
    normalized = normalized.replace(/^\+?20/, '');  // Egypt
    normalized = normalized.replace(/^\+?1/, '');   // USA/Canada
    normalized = normalized.replace(/^\+?44/, '');  // UK
    normalized = normalized.replace(/^00966/, '');  // Saudi Arabia with 00
    normalized = normalized.replace(/^00971/, '');  // UAE with 00
    
    // Remove leading zeros
    normalized = normalized.replace(/^0+/, '');
    
    return normalized;
  },

  /**
   * Find duplicate card by phone number
   */
  findDuplicate(
    newCard: Partial<BusinessCard>,
    existingCards: BusinessCard[]
  ): BusinessCard | null {
    // Check mobile number first (primary unique identifier)
    if (newCard.mobileNumber) {
      const normalizedNewMobile = this.normalizePhoneNumber(newCard.mobileNumber);
      
      for (const card of existingCards) {
        // Skip if same card
        if (card.id === newCard.id) continue;
        
        if (card.mobileNumber) {
          const normalizedExistingMobile = this.normalizePhoneNumber(card.mobileNumber);
          if (normalizedNewMobile === normalizedExistingMobile && normalizedNewMobile.length >= 7) {
            return card;
          }
        }
      }
    }

    // Check phone number as secondary
    if (newCard.phoneNumber) {
      const normalizedNewPhone = this.normalizePhoneNumber(newCard.phoneNumber);
      
      for (const card of existingCards) {
        // Skip if same card
        if (card.id === newCard.id) continue;
        
        if (card.phoneNumber) {
          const normalizedExistingPhone = this.normalizePhoneNumber(card.phoneNumber);
          if (normalizedNewPhone === normalizedExistingPhone && normalizedNewPhone.length >= 7) {
            return card;
          }
        }
        // Also check if new phone matches existing mobile
        if (card.mobileNumber) {
          const normalizedExistingMobile = this.normalizePhoneNumber(card.mobileNumber);
          if (normalizedNewPhone === normalizedExistingMobile && normalizedNewPhone.length >= 7) {
            return card;
          }
        }
      }
    }

    return null;
  },

  /**
   * Check if two cards are duplicates
   */
  areDuplicates(card1: BusinessCard, card2: BusinessCard): boolean {
    if (card1.mobileNumber && card2.mobileNumber) {
      const normalized1 = this.normalizePhoneNumber(card1.mobileNumber);
      const normalized2 = this.normalizePhoneNumber(card2.mobileNumber);
      if (normalized1 === normalized2 && normalized1.length >= 7) {
        return true;
      }
    }

    if (card1.phoneNumber && card2.phoneNumber) {
      const normalized1 = this.normalizePhoneNumber(card1.phoneNumber);
      const normalized2 = this.normalizePhoneNumber(card2.phoneNumber);
      if (normalized1 === normalized2 && normalized1.length >= 7) {
        return true;
      }
    }

    return false;
  },
};
