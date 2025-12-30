import * as fs from "fs";

async function testFullFlow() {
  console.log("=== Testing Full OCR Flow ===\n");
  
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
  
  // Step 3: Extract data using OCR
  console.log("Step 3: Extracting data with OCR...");
  const ocrResponse = await fetch("http://localhost:3000/api/trpc/ocr.extractCard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "0": { json: { imageUrl } } }),
  });
  
  if (!ocrResponse.ok) {
    const errorText = await ocrResponse.text();
    throw new Error(`OCR failed: ${ocrResponse.status} - ${errorText}`);
  }
  
  const ocrResult = await ocrResponse.json();
  console.log("✓ OCR Result:", JSON.stringify(ocrResult, null, 2));
  
  if (ocrResult.result?.data) {
    const data = ocrResult.result.data;
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
    
    console.log("\n✅ SUCCESS: Full flow completed!");
  } else {
    console.log("\n❌ FAILED: No data extracted");
  }
}

testFullFlow().catch(error => {
  console.error("\n❌ ERROR:", error);
  process.exit(1);
});
