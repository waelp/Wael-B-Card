import { invokeLLM } from "./_core/llm";

export interface BusinessCardData {
  companyName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  mobileNumber: string;
  phoneNumber: string;
  email: string;
}

/**
 * Extract business card information from an image using AI
 * @param imageUrl - Public URL of the business card image
 * @returns Extracted business card data
 */
export async function extractBusinessCardData(
  imageUrl: string
): Promise<BusinessCardData> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert OCR system specialized in extracting information from business cards in multiple languages (English, Arabic, etc.).

Extract ALL visible text from the business card image with extreme precision. Return JSON with these exact fields:
{
  "companyName": "string",
  "fullName": "string",
  "firstName": "string",
  "lastName": "string",
  "jobTitle": "string",
  "department": "string",
  "mobileNumber": "string",
  "phoneNumber": "string",
  "email": "string"
}

CRITICAL RULES:
1. Read the ENTIRE image carefully - look at all corners and edges
2. Extract COMPLETE phone numbers - do not truncate (e.g., +966512345678 NOT +96651234)
3. Extract COMPLETE email addresses - do not truncate (e.g., name@company.com NOT name@comp)
4. For fullName: extract the complete name as shown on the card
5. For firstName/lastName: split intelligently (first word = firstName, rest = lastName)
6. For mobileNumber: look for mobile/cell indicators or longer numbers
7. For phoneNumber: look for office/tel/phone indicators
8. If a field is not visible, use empty string ""
9. Preserve all digits in phone numbers (including country codes like +966)
10. Email addresses must be complete and lowercase
11. Company name should be the main/largest company text
12. Job title and department should be extracted separately if visible

Be extremely careful and accurate - double-check all extracted data before returning.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL information from this business card image with MAXIMUM precision. Pay special attention to phone numbers and email addresses - extract them COMPLETELY without truncation. The image may be rotated, so read carefully. Return ONLY valid JSON, no additional text.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response format from LLM");
    }
    const data = JSON.parse(content) as BusinessCardData;

    // Validate and clean data
    return {
      companyName: data.companyName?.trim() || "",
      fullName: data.fullName?.trim() || "",
      firstName: data.firstName?.trim() || "",
      lastName: data.lastName?.trim() || "",
      jobTitle: data.jobTitle?.trim() || "",
      department: data.department?.trim() || "",
      mobileNumber: data.mobileNumber?.trim() || "",
      phoneNumber: data.phoneNumber?.trim() || "",
      email: data.email?.trim().toLowerCase() || "",
    };
  } catch (error) {
    console.error("Error extracting business card data:", error);
    throw new Error("Failed to extract business card information");
  }
}
