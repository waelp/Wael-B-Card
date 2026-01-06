import { BusinessCard } from '@/types/business-card';
import { storageService } from './storage';
import { DuplicateDetectionService } from './duplicate-service';

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: number;
  message: string;
  details?: {
    importedCards: string[];
    duplicateCards: string[];
    errorCards: string[];
  };
}

export interface CSVRow {
  companyName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  email?: string;
  [key: string]: string | undefined;
}

/**
 * Service for importing business cards from CSV/Excel files
 */
export class ImportService {
  
  /**
   * Parse CSV content into rows
   */
  static parseCSV(content: string): CSVRow[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header row
    const headers = this.parseCSVLine(lines[0]).map(h => this.normalizeHeader(h));
    
    // Parse data rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === 0 || values.every(v => !v.trim())) continue;
      
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        if (header && values[index]) {
          row[header] = values[index].trim();
        }
      });
      rows.push(row);
    }
    
    return rows;
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result;
  }

  /**
   * Normalize header names to match BusinessCard fields
   */
  private static normalizeHeader(header: string): string {
    const normalized = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    const mappings: Record<string, string> = {
      'company': 'companyName',
      'companyname': 'companyName',
      'organization': 'companyName',
      'org': 'companyName',
      'name': 'fullName',
      'fullname': 'fullName',
      'full': 'fullName',
      'firstname': 'firstName',
      'first': 'firstName',
      'lastname': 'lastName',
      'last': 'lastName',
      'title': 'jobTitle',
      'jobtitle': 'jobTitle',
      'position': 'jobTitle',
      'role': 'jobTitle',
      'department': 'department',
      'dept': 'department',
      'division': 'department',
      'mobile': 'mobileNumber',
      'mobilenumber': 'mobileNumber',
      'cell': 'mobileNumber',
      'cellphone': 'mobileNumber',
      'phone': 'phoneNumber',
      'phonenumber': 'phoneNumber',
      'telephone': 'phoneNumber',
      'tel': 'phoneNumber',
      'email': 'email',
      'emailaddress': 'email',
      'mail': 'email',
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Convert CSV row to BusinessCard
   */
  private static rowToCard(row: CSVRow): Partial<BusinessCard> {
    // Build full name if not provided
    let fullName = row.fullName || '';
    if (!fullName && (row.firstName || row.lastName)) {
      fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
    }

    return {
      companyName: row.companyName || '',
      fullName,
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      jobTitle: row.jobTitle || '',
      department: row.department || '',
      mobileNumber: row.mobileNumber || '',
      phoneNumber: row.phoneNumber || '',
      email: row.email || '',
    };
  }

  /**
   * Import cards from CSV content
   */
  static async importFromCSV(
    content: string,
    options: {
      skipDuplicates?: boolean;
      replaceDuplicates?: boolean;
    } = {}
  ): Promise<ImportResult> {
    const { skipDuplicates = true, replaceDuplicates = false } = options;
    
    const rows = this.parseCSV(content);
    if (rows.length === 0) {
      return {
        success: false,
        imported: 0,
        duplicates: 0,
        errors: 0,
        message: 'No valid data found in the file',
      };
    }

    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const details = {
      importedCards: [] as string[],
      duplicateCards: [] as string[],
      errorCards: [] as string[],
    };

    for (const row of rows) {
      try {
        const cardData = this.rowToCard(row);
        
        // Validate required fields
        if (!cardData.fullName && !cardData.mobileNumber) {
          errors++;
          details.errorCards.push(`Row missing name and mobile: ${JSON.stringify(row)}`);
          continue;
        }

        // Check for duplicates
        const duplicateCheck = await DuplicateDetectionService.checkForDuplicate(cardData);
        
        if (duplicateCheck.isDuplicate) {
          if (replaceDuplicates && duplicateCheck.existingCard) {
            // Delete old and save new
            await storageService.deleteCard(duplicateCheck.existingCard.id);
            const newCard: BusinessCard = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              ...cardData,
              companyName: cardData.companyName || '',
              fullName: cardData.fullName || '',
              firstName: cardData.firstName || '',
              lastName: cardData.lastName || '',
              jobTitle: cardData.jobTitle || '',
              department: cardData.department || '',
              mobileNumber: cardData.mobileNumber || '',
              phoneNumber: cardData.phoneNumber || '',
              email: cardData.email || '',
              dateAdded: new Date().toISOString(),
              createdAt: Date.now(),
            };
            await storageService.saveCard(newCard);
            imported++;
            details.importedCards.push(cardData.fullName || cardData.mobileNumber || 'Unknown');
          } else if (skipDuplicates) {
            duplicates++;
            details.duplicateCards.push(
              `${cardData.fullName || 'Unknown'} (${duplicateCheck.matchedField}: ${duplicateCheck.matchedValue})`
            );
          }
          continue;
        }

        // Save new card
        const newCard: BusinessCard = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...cardData,
          companyName: cardData.companyName || '',
          fullName: cardData.fullName || '',
          firstName: cardData.firstName || '',
          lastName: cardData.lastName || '',
          jobTitle: cardData.jobTitle || '',
          department: cardData.department || '',
          mobileNumber: cardData.mobileNumber || '',
          phoneNumber: cardData.phoneNumber || '',
          email: cardData.email || '',
          dateAdded: new Date().toISOString(),
          createdAt: Date.now(),
        };
        await storageService.saveCard(newCard);
        imported++;
        details.importedCards.push(cardData.fullName || cardData.mobileNumber || 'Unknown');
        
      } catch (error) {
        errors++;
        details.errorCards.push(`Error processing row: ${JSON.stringify(row)}`);
      }
    }

    return {
      success: imported > 0 || duplicates > 0,
      imported,
      duplicates,
      errors,
      message: this.buildResultMessage(imported, duplicates, errors),
      details,
    };
  }

  /**
   * Build human-readable result message
   */
  private static buildResultMessage(imported: number, duplicates: number, errors: number): string {
    const parts: string[] = [];
    
    if (imported > 0) {
      parts.push(`${imported} card${imported > 1 ? 's' : ''} imported successfully`);
    }
    if (duplicates > 0) {
      parts.push(`${duplicates} duplicate${duplicates > 1 ? 's' : ''} skipped`);
    }
    if (errors > 0) {
      parts.push(`${errors} error${errors > 1 ? 's' : ''}`);
    }
    
    if (parts.length === 0) {
      return 'No cards were imported';
    }
    
    return parts.join(', ');
  }

  /**
   * Get sample CSV template
   */
  static getCSVTemplate(): string {
    return `Company Name,Full Name,Job Title,Department,Mobile Number,Phone Number,Email
Example Corp,John Doe,Manager,Sales,+1234567890,+0987654321,john@example.com
Another Inc,Jane Smith,Director,Marketing,+1122334455,,jane@another.com`;
  }
}
