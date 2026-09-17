export const INTERVIEW_TYPES = [
  "Phone",
  "HR",
  "Technical",
  "Behavioral",
  "Managerial",
  "Onsite",
  "Other",
] as const;

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type ApplicationStatusOption = (typeof APPLICATION_STATUSES)[number];

export function isInterviewType(value: unknown): value is InterviewType {
  return (
    typeof value === "string" &&
    (INTERVIEW_TYPES as readonly string[]).includes(value)
  );
}

export function isApplicationStatus(
  value: unknown
): value is ApplicationStatusOption {
  return (
    typeof value === "string" &&
    (APPLICATION_STATUSES as readonly string[]).includes(value)
  );
}
