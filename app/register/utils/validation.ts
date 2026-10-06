import { FormErrors, TeamRegistrationData } from "../types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Strips formatting, leading country code (+91), or leading zeros from Indian phone numbers.
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return INDIAN_PHONE_REGEX.test(cleaned);
}

/**
 * Validates Step 1: Team Name and basic personal contact details of both members.
 * Pure function adhering to the Single Responsibility Principle.
 */
export function validateStep1(
  formData: TeamRegistrationData,
  isMember1EmailVerified?: boolean
): FormErrors {
  const errors: FormErrors = {};

  // Team Name
  const trimmedTeam = formData.teamName.trim();
  if (!trimmedTeam) {
    errors.teamName = "Team name is required";
  } else if (trimmedTeam.length > 80) {
    errors.teamName = "Team name cannot exceed 80 characters";
  }

  // Member 1 (Leader)
  const fn1 = formData.member1.firstName.trim();
  if (!fn1) {
    errors["member1.firstName"] = "First name is required";
  } else if (fn1.length > 100) {
    errors["member1.firstName"] = "First name cannot exceed 100 characters";
  }

  const ln1 = formData.member1.lastName.trim();
  if (!ln1) {
    errors["member1.lastName"] = "Last name is required";
  } else if (ln1.length > 100) {
    errors["member1.lastName"] = "Last name cannot exceed 100 characters";
  }

  if (!formData.member1.gender) {
    errors["member1.gender"] = "Please select gender";
  }

  const em1 = formData.member1.email.trim();
  if (!em1) {
    errors["member1.email"] = "Email address is required";
  } else if (!isValidEmail(em1)) {
    errors["member1.email"] = "Please enter a valid email address";
  }

  const rawPhone1 = formData.member1.phone.trim();
  const cleanPhone1 = cleanPhoneNumber(rawPhone1);
  if (!rawPhone1) {
    errors["member1.phone"] = "Phone number is required";
  } else if (!INDIAN_PHONE_REGEX.test(cleanPhone1)) {
    errors["member1.phone"] = "Enter a valid 10-digit phone number (starts with 6-9)";
  }

  // Member 2 (Teammate)
  const fn2 = formData.member2.firstName.trim();
  if (!fn2) {
    errors["member2.firstName"] = "First name is required";
  } else if (fn2.length > 100) {
    errors["member2.firstName"] = "First name cannot exceed 100 characters";
  }

  const ln2 = formData.member2.lastName.trim();
  if (!ln2) {
    errors["member2.lastName"] = "Last name is required";
  } else if (ln2.length > 100) {
    errors["member2.lastName"] = "Last name cannot exceed 100 characters";
  }

  if (!formData.member2.gender) {
    errors["member2.gender"] = "Please select gender";
  }

  const em2 = formData.member2.email.trim();
  if (!em2) {
    errors["member2.email"] = "Email address is required";
  } else if (!isValidEmail(em2)) {
    errors["member2.email"] = "Please enter a valid email address";
  } else if (em1 && em2.toLowerCase() === em1.toLowerCase()) {
    errors["member2.email"] = "Teammate must have a different email";
  }

  const rawPhone2 = formData.member2.phone.trim();
  const cleanPhone2 = cleanPhoneNumber(rawPhone2);
  if (!rawPhone2) {
    errors["member2.phone"] = "Phone number is required";
  } else if (!INDIAN_PHONE_REGEX.test(cleanPhone2)) {
    errors["member2.phone"] = "Enter a valid 10-digit phone number (starts with 6-9)";
  } else if (cleanPhone1 && cleanPhone2 === cleanPhone1) {
    errors["member2.phone"] = "Teammate must have a different phone number";
  }

  return errors;
}

/**
 * Validates Step 2: Academic & College credentials of both members.
 * Pure function adhering to the Single Responsibility Principle.
 */
export function validateStep2(formData: TeamRegistrationData): FormErrors {
  const errors: FormErrors = {};

  // Member 1
  const col1 = formData.member1.collegeName.trim();
  if (!col1) {
    errors["member1.collegeName"] = "College name is required";
  } else if (col1.length > 150) {
    errors["member1.collegeName"] = "College name cannot exceed 150 characters";
  }

  if (!formData.member1.yearOfStudy) {
    errors["member1.yearOfStudy"] = "Year of study is required";
  }

  const dept1 = formData.member1.department.trim();
  if (!dept1) {
    errors["member1.department"] = "Department is required";
  } else if (dept1.length > 100) {
    errors["member1.department"] = "Department cannot exceed 100 characters";
  }

  // Member 2
  const col2 = formData.member2.collegeName.trim();
  if (!col2) {
    errors["member2.collegeName"] = "College name is required";
  } else if (col2.length > 150) {
    errors["member2.collegeName"] = "College name cannot exceed 150 characters";
  }

  if (!formData.member2.yearOfStudy) {
    errors["member2.yearOfStudy"] = "Year of study is required";
  }

  const dept2 = formData.member2.department.trim();
  if (!dept2) {
    errors["member2.department"] = "Department is required";
  } else if (dept2.length > 100) {
    errors["member2.department"] = "Department cannot exceed 100 characters";
  }

  return errors;
}
