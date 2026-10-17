export const DEFAULT_CAMPAIGN = "GDG_NASHIK_DEVFEST_2026";
export const DEFAULT_SOURCE = "direct";

export const AVAILABILITY_OPTIONS = [
  "Weekday mornings (9am-12pm)",
  "Weekday afternoons (12pm-4pm)",
  "Weekday evenings (4pm-8pm)",
  "Weekends",
  "Any time",
] as const;

/** Staff contact details printed on materials such as the roadmap PDF. */
export const CONTACT = {
  email: "inquiry@gmail.com",
  phone: "+91 8263830296",
  address: "Third Floor, Roongta Mall, Uttam Nagar, Cidco, Nashik",
} as const;
export const COMPANY = { name: "Deboistech IT Solutions LLP", website: "www.deboistech.in" } as const;

export const SOCIAL_LINKS = {
  website: "https://www.deboistech.in/",
  instagram: "https://www.instagram.com/deboistech.in",
  linkedin: "https://www.linkedin.com/company/deboistech",
  x: "https://x.com/deboistech",
} as const;

export const STATUS_LABELS = {
  college_student: "College student",
  graduate: "Graduate",
  working_professional: "Working professional",
  other: "Other",
} as const;

export const FORMAT_LABELS = {
  phone_call: "Phone call",
  office_visit: "Office visit",
} as const;

export const LEAD_STATUSES = ["New", "Contacted", "Scheduled", "Completed", "Closed"] as const;
