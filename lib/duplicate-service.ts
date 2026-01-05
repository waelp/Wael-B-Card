import { BusinessCard } from '@/types/business-card';
import { storageService } from './storage';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingCard?: BusinessCard;
  matchedField?: 'mobile' | 'phone' | 'email';
  matchedValue?: string;
}

export interface DuplicateResolution {
  action: 'replace' | 'keep_old' | 'save_anyway';
}

/**
 * Service for detecting and handling duplicate business cards
 * Uses mobile number as the primary unique identifier
 */
export class DuplicateDetectionService {
  
  /**
   * Normalize phone number for comparison
   * Removes spaces, dashes, and country codes for consistent matching
   */
  static normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Remove leading + and country codes (common ones)
    normalized = normalized.replace(/^\+?966/, ''); // Saudi Arabia
    normalized = normalized.replace(/^\+?971/, ''); // UAE
    normalized = normalized.replace(/^\+?20/, '');  // Egypt
    normalized = normalized.replace(/^\+?1/, '');   // USA/Canada
    normalized = normalized.replace(/^\+?44/, '');  // UK
    
    // Remove leading zeros
    normalized = normalized.replace(/^0+/, '');
    
    return normalized;
  }

  /**
   * Check if a business card with the same mobile number already exists
   */
  static async checkForDuplicate(newCard: Partial<BusinessCard>): Promise<DuplicateCheckResult> {
    const existingCards = await storageService.getAllCards();
    
    // Check mobile number first (primary unique identifier)
    if (newCard.mobileNumber) {
      const normalizedNewMobile = this.normalizePhoneNumber(newCard.mobileNumber);
      
      for (const card of existingCards) {
        if (card.mobileNumber) {
          const normalizedExistingMobile = this.normalizePhoneNumber(card.mobileNumber);
          if (normalizedNewMobile === normalizedExistingMobile && normalizedNewMobile.length >= 7) {
            return {
              isDuplicate: true,
              existingCard: card,
              matchedField: 'mobile',
              matchedValue: card.mobileNumber,
            };
          }
        }
      }
    }

    // Check phone number as secondary
    if (newCard.phoneNumber) {
      const normalizedNewPhone = this.normalizePhoneNumber(newCard.phoneNumber);
      
      for (const card of existingCards) {
        if (card.phoneNumber) {
          const normalizedExistingPhone = this.normalizePhoneNumber(card.phoneNumber);
          if (normalizedNewPhone === normalizedExistingPhone && normalizedNewPhone.length >= 7) {
            return {
              isDuplicate: true,
              existingCard: card,
              matchedField: 'phone',
              matchedValue: card.phoneNumber,
            };
          }
        }
        // Also check if new phone matches existing mobile
        if (card.mobileNumber) {
          const normalizedExistingMobile = this.normalizePhoneNumber(card.mobileNumber);
          if (normalizedNewPhone === normalizedExistingMobile && normalizedNewPhone.length >= 7) {
            return {
              isDuplicate: true,
              existingCard: card,
              matchedField: 'mobile',
              matchedValue: card.mobileNumber,
            };
          }
        }
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Handle duplicate resolution based on user choice
   */
  static async resolveDuplicate(
    newCard: BusinessCard,
    existingCard: BusinessCard,
    resolution: DuplicateResolution
  ): Promise<{ success: boolean; message: string }> {
    switch (resolution.action) {
      case 'replace':
        // Delete old card and save new one
        await storageService.deleteCard(existingCard.id);
        await storageService.saveCard(newCard);
        return {
          success: true,
          message: 'تم حذف البطاقة القديمة وحفظ البطاقة الجديدة بنجاح',
        };

      case 'keep_old':
        // Don't save the new card
        return {
          success: true,
          message: 'تم الاحتفاظ بالبطاقة القديمة وإلغاء البطاقة الجديدة',
        };

      case 'save_anyway':
        // Save the new card without deleting the old one
        await storageService.saveCard(newCard);
        return {
          success: true,
          message: 'تم حفظ البطاقة الجديدة مع الاحتفاظ بالبطاقة القديمة',
        };

      default:
        return {
          success: false,
          message: 'خيار غير صالح',
        };
    }
  }
}
