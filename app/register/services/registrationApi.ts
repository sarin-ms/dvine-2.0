import { API_ENDPOINTS } from "../constants/apiEndpoints";
import {
  CancelRequest,
  CancelResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  RegisterRequest,
  RegisterSuccessResponse,
  SeatStatusResponse,
  SendOtpRequest,
  TeamStatusResponse,
  TicketDetailsResponse,
  VerifyOtpRequest,
} from "../types";
import { ApiError, getFriendlyErrorMessage } from "../utils/apiErrors";

async function parseResponse<T>(res: Response): Promise<T> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Body is empty or not JSON
  }

  if (!res.ok) {
    const friendlyMsg = getFriendlyErrorMessage(res.status, data);
    throw new ApiError(res.status, friendlyMsg, data?.error);
  }

  return data as T;
}

/**
 * Returns whether the email is still within its OTP-verified window.
 * Any network/HTTP error is treated as "not verified".
 */
export async function checkEmailVerified(email: string): Promise<boolean> {
  try {
    const res = await registrationApi.isEmailVerified(email);
    return res.verified === true;
  } catch {
    return false;
  }
}

export const registrationApi = {
  /**
   * Checks whether an email is currently verified (5-minute window after OTP).
   * GET /register/is-email-verified?email=...
   */
  async isEmailVerified(email: string): Promise<{ verified: boolean }> {
    const res = await fetch(
      API_ENDPOINTS.isEmailVerified(email.trim().toLowerCase()),
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    return parseResponse<{ verified: boolean }>(res);
  },

  /**
   * Fetches the current live seat availability.
   * GET /register/get-av-seats
   */
  async getSeatStatus(): Promise<SeatStatusResponse> {
    try {
      const res = await fetch(API_ENDPOINTS.getAvailableSeats, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      return await parseResponse<SeatStatusResponse>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        0,
        "Unable to check seat availability. Please check your network connection."
      );
    }
  },

  /**
   * Sends a 6-digit OTP code to Member 1's email.
   * POST /register/otp/send
   */
  async sendOtp(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const payload: SendOtpRequest = { email: email.trim().toLowerCase() };
      const res = await fetch(API_ENDPOINTS.sendOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await parseResponse<{ success: boolean; message?: string }>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        0,
        "Unable to send verification OTP. Please try again."
      );
    }
  },

  /**
   * Verifies the 6-digit code for Member 1's email.
   * POST /register/otp/verify
   */
  async verifyOtp(
    email: string,
    code: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const payload: VerifyOtpRequest = {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      };
      const res = await fetch(API_ENDPOINTS.verifyOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await parseResponse<{ success: boolean; message?: string }>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(0, "Unable to verify OTP. Please try again.");
    }
  },

  /**
   * Registers the team and reserves seats for 15 minutes.
   * Returns Razorpay order details.
   * POST /register
   */
  async registerTeam(data: RegisterRequest): Promise<RegisterSuccessResponse> {
    try {
      const res = await fetch(API_ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await parseResponse<RegisterSuccessResponse>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        0,
        "Failed to submit registration. Please check your connection and retry."
      );
    }
  },

  /**
   * Verifies Razorpay payment signature after successful checkout.
   * POST /payment/verify
   */
  async verifyPayment(
    data: PaymentVerifyRequest
  ): Promise<PaymentVerifyResponse> {
    try {
      const res = await fetch(API_ENDPOINTS.verifyPayment, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await parseResponse<PaymentVerifyResponse>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        0,
        "Network error verifying payment. Our system will confirm your payment."
      );
    }
  },

  /**
   * Notifies backend that Razorpay checkout was cancelled or dismissed.
   * POST /register/cancel
   */
  async cancelRegistration(teamId: string): Promise<CancelResponse> {
    try {
      const payload: CancelRequest = { teamId };
      const res = await fetch(API_ENDPOINTS.cancelRegistration, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await parseResponse<CancelResponse>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      return { cancelled: false };
    }
  },

  /**
   * Polls payment confirmation status for in-flight / processing payments.
   * GET /register/status/:teamId
   */
  async getTeamStatus(teamId: string): Promise<TeamStatusResponse> {
    try {
      const res = await fetch(API_ENDPOINTS.getTeamStatus(teamId), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      return await parseResponse<TeamStatusResponse>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(0, "Status check request failed.");
    }
  },

  /**
   * Fetches attendee ticket by 32-character hash.
   * GET /ticket/:hash
   */
  async getTicket(hash: string): Promise<TicketDetailsResponse> {
    const res = await fetch(API_ENDPOINTS.getTicket(hash), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return parseResponse<TicketDetailsResponse>(res);
  },
};
