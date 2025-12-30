import * as fs from "fs";
import { extractBusinessCardData } from "./server/ocr-service";

async function testSimpleOCR() {
  console.log("=== Testing Simple OCR Flow ===\n");
  
  // Step 1: Read and encode image
  console.log("Step 1: Reading image...");
  const imagePath = "/home/ubuntu/upload/IMG_2324.png";
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
  console.log(`✓ Image size: ${(base64Image.length / 1024 / 1024).toFixed(2)} MB\n`);
  
  // Step 2: Upload image
  console.log("Step 2: Uploading image to S3...");
  const uploadResponse = await fetch("http://localhost:3000/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });
  
  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }
  
  const { imageUrl } = await uploadResponse.json();
  console.log(`✓ Image uploaded: ${imageUrl}\n`);
  
  // Step 3: Extract data using OCR (direct service call)
  console.log("Step 3: Extracting data with OCR...");
  const data = await extractBusinessCardData(imageUrl);
  
  console.log("\n=== Extracted Data ===");
  console.log(`Company: ${data.companyName}`);
  console.log(`Full Name: ${data.fullName}`);
  console.log(`First Name: ${data.firstName}`);
  console.log(`Last Name: ${data.lastName}`);
  console.log(`Job Title: ${data.jobTitle}`);
  console.log(`Department: ${data.department}`);
  console.log(`Mobile: ${data.mobileNumber}`);
  console.log(`Phone: ${data.phoneNumber}`);
  console.log(`Email: ${data.email}`);
  
  // Check if we got meaningful data
  const hasData = data.companyName || data.fullName || data.email || data.mobileNumber;
  if (hasData) {
    console.log("\n✅ SUCCESS: OCR extracted data successfully!");
  } else {
    console.log("\n⚠️  WARNING: No meaningful data was extracted");
  }
}

testSimpleOCR().catch(error => {
  console.error("\n❌ ERROR:", error);
  process.exit(1);
});
