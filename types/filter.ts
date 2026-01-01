export type FilterType = "company" | "department" | "date" | "tags";

export type DateRange = "all" | "today" | "week" | "month" | "year" | "custom";

export interface CardFilter {
  type: FilterType;
  value: string | string[] | DateRange;
  label: string;
}

export interface FilterState {
  company?: string;
  department?: string;
  dateRange?: DateRange;
  customDateStart?: string;
  customDateEnd?: string;
  tags?: string[];
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
}
