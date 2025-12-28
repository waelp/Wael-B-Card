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
          content: `You are an expert OCR system specialized in extracting information from business cards. 
Extract all visible information accurately. Return JSON with these exact fields:
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

Rules:
- Extract text exactly as it appears
- For fullName: combine first and last name if visible
- For firstName/lastName: split the full name intelligently
- For mobileNumber: prefer mobile/cell phone numbers
- For phoneNumber: prefer office/landline numbers
- If a field is not visible, use empty string ""
- Remove any special formatting from phone numbers (keep only digits and +)
- Ensure email is lowercase
- Be precise and accurate`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all information from this business card image. Return only valid JSON.",
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
