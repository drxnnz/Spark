export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "fake", label: "Fake profile" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
export const MAX_NOTE = 300;
