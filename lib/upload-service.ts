/**
 * Upload image to S3 and return public URL
 * Uses the manus-upload-file CLI utility
 */
export async function uploadImageToS3(localPath: string): Promise<string> {
  try {
    // Use the manus-upload-file utility to upload to S3
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    const { stdout } = await execAsync(`manus-upload-file ${localPath}`);
    const url = stdout.trim();

    if (!url || !url.startsWith("http")) {
      throw new Error("Invalid URL returned from upload");
    }

    return url;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Convert base64 image to file and upload to S3
 */
export async function uploadBase64ImageToS3(base64Data: string): Promise<string> {
  try {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `card-${Date.now()}.jpg`);

    // Write base64 to file
    fs.writeFileSync(tempFilePath, base64Image, "base64");

    // Upload to S3
    const url = await uploadImageToS3(tempFilePath);

    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.warn("Failed to delete temp file:", e);
    }

    return url;
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    throw new Error("Failed to upload image");
  }
}
