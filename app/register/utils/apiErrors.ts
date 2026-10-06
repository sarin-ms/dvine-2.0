import { ApiErrorResponse } from "../types";

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CODE: "Invalid OTP code. Please check and re-enter.",
  CODE_EXPIRED: "Verification code has expired. Request a new one.",
  BAD_SIGNATURE: "Payment security verification failed. Please contact support.",
  EMAIL_NOT_VERIFIED: "Please verify Member 1's email before registering.",
  SOLD_OUT: "Registrations are now full. No seats remaining.",
  TEAM_NAME_TAKEN: "This team name is already taken. Please choose a different name.",
  EMAIL_TAKEN: "One of the provided email addresses is already registered.",
  LOCK_EXPIRED: "Your 15-minute seat reservation expired. Deducted payment will be automatically refunded.",
  COOLDOWN: "Please wait 60 seconds before requesting another verification code.",
  TOO_MANY_ATTEMPTS: "Maximum OTP attempts exceeded. Please request a new code.",
  EMAIL_FAILED: "Unable to send verification email. Please check the address or try again.",
  PAYMENT_INIT_FAILED: "Could not connect to payment gateway. Please try again.",
};

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Resolves a human-friendly user notification from an API error response or status code.
 * Adheres to Open/Closed Principle.
 */
export function getFriendlyErrorMessage(
  status: number,
  errorData?: ApiErrorResponse | null,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  if (errorData?.error && ERROR_MESSAGES[errorData.error]) {
    return ERROR_MESSAGES[errorData.error];
  }
  if (errorData?.message) {
    return errorData.message;
  }

  switch (status) {
    case 400:
      return "Invalid request. Please verify your details.";
    case 403:
      return "Please verify your email before proceeding.";
    case 409:
      return "There was a conflict with existing registration records.";
    case 410:
      return "Your temporary reservation has expired.";
    case 429:
      return "Too many requests. Please wait a moment and retry.";
    case 502:
    case 503:
      return "Service temporarily unavailable. Please retry shortly.";
    default:
      return fallbackMessage;
  }
}
