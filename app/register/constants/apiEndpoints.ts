export const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export const API_ENDPOINTS = {
  // Seat Availability
  getAvailableSeats: `${BASE_URL}/register/get-av-seats`,

  // OTP Flow
  sendOtp: `${BASE_URL}/register/otp/send`,
  verifyOtp: `${BASE_URL}/register/otp/verify`,

  // Dynamic: returns `${BASE_URL}/register/is-email-verified?email=...`
  isEmailVerified: (email: string) =>
    `${BASE_URL}/register/is-email-verified?email=${encodeURIComponent(email)}`,

  // Team Registration & Seat Lock
  register: `${BASE_URL}/register`,

  // Payment Verification
  verifyPayment: `${BASE_URL}/payment/verify`,

  // Registration & Temporary Reservation Cancellation
  cancelRegistration: `${BASE_URL}/register/cancel`,

  // Dynamic status endpoint: returns `${BASE_URL}/register/status/${teamId}`
  getTeamStatus: (teamId: string) => `${BASE_URL}/register/status/${teamId}`,

  // Dynamic ticket endpoint: returns `${BASE_URL}/ticket/${hash}`
  getTicket: (hash: string) => `${BASE_URL}/ticket/${encodeURIComponent(hash)}`,
} as const;

export const API = API_ENDPOINTS;
