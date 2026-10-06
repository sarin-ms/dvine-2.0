// Domain Types
export interface MemberData {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  collegeName: string;
  yearOfStudy: string;
  department: string;
}

export interface TeamRegistrationData {
  teamName: string;
  member1: MemberData;
  member2: MemberData;
  confirmAccuracy: boolean;
}

export type MemberKey = "member1" | "member2";

export type FormErrors = Record<string, string>;

export interface RegistrationStep {
  id: number;
  label: string;
  shortLabel: string;
}

// --- API Common ---
export interface ApiErrorResponse {
  error: string;
  message: string;
}

// --- Seat Availability ---
export interface SeatStatusResponse {
  total: number;
  registered: number;
  locked: number;
  available: number;
}

// --- OTP Flow ---
export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string; // Exactly 6 digits
}

// --- Registration ---
export interface RegisterRequest {
  teamName: string;
  member1: MemberData;
  member2: MemberData;
}

export interface RegisterSuccessResponse {
  teamId: string;
  amount: number; // e.g. 600
  currency: string; // "INR"
  orderId: string; // Razorpay order ID (e.g. "order_xyz123")
  keyId: string; // Razorpay public key ID
  lockExpiresAt: number; // Unix timestamp in seconds
}

// --- Paid Team & Ticket Details ---
export interface PaidTeamMember {
  id?: string;
  slot: number;
  role?: "lead" | "member" | string;
  firstName: string;
  lastName: string;
  gender?: string;
  email: string;
  phone?: string;
  collegeName?: string;
  yearOfStudy?: string;
  department?: string;
  ticketHash: string;
  checkedInAt?: string | null;
}

export interface PaidTeamDetails {
  id: string;
  teamName: string;
  status: "paid" | string;
  amountInr?: number;
  paidAt: number;
  members: PaidTeamMember[];
}

export interface TicketDetailsResponse {
  ticketHash: string;
  status: "valid" | "checked_in" | string;
  checkedIn: boolean;
  checkedInAt: string | null;
  member: {
    slot: number;
    role: "lead" | "member" | string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phone: string;
    collegeName: string;
    yearOfStudy: string;
    department: string;
  };
  team: {
    id: string;
    teamName: string;
    paidAt: number;
  };
  event: {
    name: string;
    venue: string;
  };
}

// --- Payment Verification ---
export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerifyResponse {
  ok: true;
  status: "paid";
  team?: PaidTeamDetails;
}

// --- Cancellation & Status Polling ---
export interface CancelRequest {
  teamId: string;
}

export interface CancelResponse {
  cancelled: boolean;
  reason?: "ALREADY_PAID" | "PAYMENT_IN_PROGRESS" | "CHECK_FAILED";
}

export interface TeamStatusResponse {
  status: "pending" | "paid" | "expired";
  lockExpiresAt?: number;
  team?: PaidTeamDetails;
}

// --- UI / Store Types ---
export interface OtpState {
  isSending: boolean;
  isVerifying: boolean;
  otpSent: boolean;
  cooldownSeconds: number;
  error: string | null;
  verifiedEmail: string | null;
  verifiedAt: number | null; // ms timestamp of the successful OTP verify
}

export interface PaymentState {
  teamId: string | null;
  orderId: string | null;
  keyId: string | null;
  amount: number;
  currency: string;
  lockExpiresAt: number | null;
  txId: string;
  errorMessage: string | null;
  isPolling: boolean;
  paidTeam: PaidTeamDetails | null;
}
