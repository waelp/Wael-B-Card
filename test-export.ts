import { exportService } from "./lib/export-service";
import type { BusinessCard } from "./types/business-card";

async function testExport() {
  console.log("=== Testing Export Feature ===\n");

  // Create test cards
  const testCards: BusinessCard[] = [
    {
      id: "1",
      companyName: "Tech Corp",
      fullName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Software Engineer",
      department: "Engineering",
      mobileNumber: "+1234567890",
      phoneNumber: "+0987654321",
      email: "john@techcorp.com",
      address: "123 Main St",
      website: "https://techcorp.com",
      dateAdded: new Date().toISOString(),
      tags: ["VIP", "Client"],
      createdAt: Date.now(),
    },
    {
      id: "2",
      companyName: "Business Inc",
      fullName: "Jane Smith",
      firstName: "Jane",
      lastName: "Smith",
      jobTitle: "Marketing Manager",
      department: "Marketing",
      mobileNumber: "+1122334455",
      phoneNumber: "+5544332211",
      email: "jane@business.com",
      address: "456 Oak Ave",
      website: "https://business.com",
      dateAdded: new Date().toISOString(),
      tags: ["Partner"],
      createdAt: Date.now(),
    },
    {
      id: "3",
      companyName: "alnafitha",
      fullName: "el Allam",
      firstName: "el",
      lastName: "Allam",
      jobTitle: "Manager",
      department: "Operations",
      mobileNumber: "(+966) 56 667",
      phoneNumber: "(+966) 12 234",
      email: "wallam@alnaf",
      dateAdded: new Date().toISOString(),
      tags: ["VIP"],
      createdAt: Date.now(),
    },
  ];

  console.log(`Test data: ${testCards.length} cards\n`);

  // Test CSV Export
  console.log("1. Testing CSV Export...");
  try {
    await exportService.exportToCSV(testCards);
    console.log("✅ CSV Export: SUCCESS\n");
  } catch (error) {
    console.error("❌ CSV Export: FAILED");
    console.error("Error:", error);
    console.log();
  }

  // Test Excel Export
  console.log("2. Testing Excel Export...");
  try {
    await exportService.exportToExcel(testCards);
    console.log("✅ Excel Export: SUCCESS\n");
  } catch (error) {
    console.error("❌ Excel Export: FAILED");
    console.error("Error:", error);
    console.log();
  }

  console.log("=== Export Test Complete ===");
}

testExport().catch((error) => {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
});
