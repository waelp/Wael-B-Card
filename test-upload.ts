import * as fs from "fs";
import * as path from "path";

async function testUpload() {
  console.log("Testing image upload endpoint...");
  
  // Read the test image
  const imagePath = "/home/ubuntu/upload/IMG_2324.png";
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
  
  console.log(`Image size: ${(base64Image.length / 1024 / 1024).toFixed(2)} MB`);
  
  try {
    const response = await fetch("http://localhost:3000/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Upload failed: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      process.exit(1);
    }
    
    const result = await response.json();
    console.log("\n✅ Upload successful!");
    console.log(`Image URL: ${result.imageUrl}`);
    
  } catch (error) {
    console.error("\n❌ Upload error:", error);
    process.exit(1);
  }
}

testUpload();
