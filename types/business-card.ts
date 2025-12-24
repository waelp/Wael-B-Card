export interface BusinessCard {
  id: string;
  companyName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  mobileNumber: string;
  phoneNumber: string;
  email: string;
  imageUri?: string;
  dateAdded: string;
  notes?: string;
  tags?: string[];
}

export type CardField = keyof BusinessCard;
