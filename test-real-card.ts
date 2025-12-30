import { extractBusinessCardData } from "./server/ocr-service";

async function testRealCard() {
  console.log("Testing OCR with real business card...");
  
  const imageUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663178700715/dmbMrKFcdOPBUBKL.png";
  
  try {
    const result = await extractBusinessCardData(imageUrl);
    
    console.log("\n=== OCR RESULT ===");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n=== FIELDS ===");
    console.log(`Company: ${result.companyName}`);
    console.log(`Full Name: ${result.fullName}`);
    console.log(`First Name: ${result.firstName}`);
    console.log(`Last Name: ${result.lastName}`);
    console.log(`Job Title: ${result.jobTitle}`);
    console.log(`Department: ${result.department}`);
    console.log(`Mobile: ${result.mobileNumber}`);
    console.log(`Phone: ${result.phoneNumber}`);
    console.log(`Email: ${result.email}`);
    
    // Verify we got some data
    const hasData = result.companyName || result.fullName || result.email;
    if (hasData) {
      console.log("\n✅ SUCCESS: OCR extracted data successfully!");
    } else {
      console.log("\n❌ FAILED: No data was extracted");
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

testRealCard();
