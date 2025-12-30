import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Upload base64 image to S3 and return public URL
 */
export async function handleImageUpload(req: Request, res: Response) {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "Missing base64Image in request body" });
    }

    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `card-${Date.now()}.jpg`);

    // Write base64 to file
    fs.writeFileSync(tempFilePath, base64Data, "base64");

    // Upload to S3 using manus-upload-file
    console.log(`[upload] Uploading file: ${tempFilePath}`);
    const { stdout, stderr } = await execAsync(`manus-upload-file ${tempFilePath}`);
    console.log(`[upload] stdout:`, stdout);
    if (stderr) console.log(`[upload] stderr:`, stderr);
    
    // Extract URL from output (look for "CDN URL: " prefix or line starting with http)
    const lines = stdout.trim().split('\n');
    let imageUrl = '';
    
    // Try to find "CDN URL: " line
    const cdnLine = lines.find(line => line.includes('CDN URL:'));
    if (cdnLine) {
      imageUrl = cdnLine.split('CDN URL:')[1].trim();
    } else {
      // Fallback: find line starting with http
      imageUrl = lines.find(line => line.trim().startsWith('http')) || lines[lines.length - 1];
    }

    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.warn("Failed to delete temp file:", e);
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      throw new Error("Invalid URL returned from upload");
    }

    return res.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ 
      error: "Failed to upload image",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
