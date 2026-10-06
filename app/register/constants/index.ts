import { MemberData, RegistrationStep, TeamRegistrationData } from "../types";
import { colleges } from "./data";

export * from "./apiEndpoints";

export const INITIAL_MEMBER: MemberData = {
  firstName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  collegeName: "",
  yearOfStudy: "",
  department: "",
};

export const INITIAL_DATA: TeamRegistrationData = {
  teamName: "",
  member1: { ...INITIAL_MEMBER },
  member2: { ...INITIAL_MEMBER },
  confirmAccuracy: true,
};

export const STEPS: RegistrationStep[] = [
  { id: 1, label: "Team & Members", shortLabel: "Team" },
  { id: 2, label: "Academic Details", shortLabel: "College" },
  { id: 3, label: "Review & Summary", shortLabel: "Review" },
  { id: 4, label: "Confirmation", shortLabel: "Receipt" },
];

export const GENDER_OPTIONS = ["Male", "Female"] as const;

export const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
  "Other",
] as const;

export const PRICING_CONFIG = {
  feePerMember: 300,
  totalAmount: 600,
  currencySymbol: "₹",
  currencyCode: "INR",
} as const;

export const COMMON_COLLEGES = colleges;
export { colleges };
