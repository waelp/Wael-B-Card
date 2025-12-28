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
  address?: string;
  website?: string;
  imageUri?: string;
  dateAdded: string;
  notes?: string;
  tags?: CardTag[];
  createdAt?: number;
  updatedAt?: number;
}

export type CardTag = "VIP" | "Follow-up" | "Important" | "Partner" | "Client";

export type CardField = keyof BusinessCard;

export interface CardFilter {
  searchQuery?: string;
  company?: string;
  department?: string;
  tags?: CardTag[];
  dateFrom?: number;
  dateTo?: number;
}

export interface CardStats {
  totalCards: number;
  companiesCount: number;
  departmentsCount: number;
  vipCount: number;
  recentCount: number;
  topCompanies: { name: string; count: number }[];
  topDepartments: { name: string; count: number }[];
}
