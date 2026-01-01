import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { BusinessCard } from "@/types/business-card";

/**
 * Export service for business cards
 * Supports CSV and Excel formats
 */
export const exportService = {
  /**
   * Export cards to CSV format
   */
  async exportToCSV(cards: BusinessCard[]): Promise<void> {
    try {
      // Prepare CSV data
      const headers = [
        "Company Name",
        "Full Name",
        "First Name",
        "Last Name",
        "Job Title",
        "Department",
        "Mobile Number",
        "Phone Number",
        "Email",
        "Address",
        "Website",
        "Notes",
        "Tags",
        "Date Added",
      ];

      const rows = cards.map((card) => [
        card.companyName || "",
        card.fullName || "",
        card.firstName || "",
        card.lastName || "",
        card.jobTitle || "",
        card.department || "",
        card.mobileNumber || "",
        card.phoneNumber || "",
        card.email || "",
        card.address || "",
        card.website || "",
        card.notes || "",
        card.tags?.join(", ") || "",
        card.dateAdded || "",
      ]);

      // Convert to CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Save and share file
      await this.saveAndShareFile(csvContent, "business-cards.csv", "text/csv");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw new Error("Failed to export to CSV");
    }
  },

  /**
   * Export cards to Excel format
   */
  async exportToExcel(cards: BusinessCard[]): Promise<void> {
    try {
      // Prepare Excel data
      const data = cards.map((card) => ({
        "Company Name": card.companyName || "",
        "Full Name": card.fullName || "",
        "First Name": card.firstName || "",
        "Last Name": card.lastName || "",
        "Job Title": card.jobTitle || "",
        Department: card.department || "",
        "Mobile Number": card.mobileNumber || "",
        "Phone Number": card.phoneNumber || "",
        Email: card.email || "",
        Address: card.address || "",
        Website: card.website || "",
        Notes: card.notes || "",
        Tags: card.tags?.join(", ") || "",
        "Date Added": card.dateAdded || "",
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Business Cards");

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Company Name
        { wch: 20 }, // Full Name
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 20 }, // Job Title
        { wch: 15 }, // Department
        { wch: 15 }, // Mobile Number
        { wch: 15 }, // Phone Number
        { wch: 25 }, // Email
        { wch: 30 }, // Address
        { wch: 25 }, // Website
        { wch: 30 }, // Notes
        { wch: 15 }, // Tags
        { wch: 20 }, // Date Added
      ];
      worksheet["!cols"] = columnWidths;

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      // Save and share file
      await this.saveAndShareFile(
        excelBuffer,
        "business-cards.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        true
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw new Error("Failed to export to Excel");
    }
  },

  /**
   * Save file and share it
   */
  async saveAndShareFile(
    content: string,
    filename: string,
    mimeType: string,
    isBase64: boolean = false
  ): Promise<void> {
    if (Platform.OS === "web") {
      // Web: Download file directly
      this.downloadFileWeb(content, filename, mimeType, isBase64);
    } else {
      // Mobile: Save to file system and share
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      if (isBase64) {
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: "Export Business Cards",
          UTI: mimeType,
        });
      } else {
        throw new Error("Sharing is not available on this device");
      }
    }
  },

  /**
   * Download file on web platform
   */
  downloadFileWeb(
    content: string,
    filename: string,
    mimeType: string,
    isBase64: boolean = false
  ): void {
    let blob: Blob;

    if (isBase64) {
      // Convert base64 to blob
      const byteCharacters = atob(content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: mimeType });
    } else {
      blob = new Blob([content], { type: mimeType });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
