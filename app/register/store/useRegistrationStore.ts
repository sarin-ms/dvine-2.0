import { create } from "zustand";
import {
  FormErrors,
  MemberData,
  MemberKey,
  OtpState,
  PaidTeamDetails,
  PaymentState,
  SeatStatusResponse,
  TeamRegistrationData,
} from "../types";
import { COMMON_COLLEGES, INITIAL_DATA } from "../constants";
import { validateStep1, validateStep2 } from "../utils/validation";
import { registrationApi, checkEmailVerified } from "../services/registrationApi";
import { PaymentLifecycleStatus } from "../../components/register/PaymentStatus";

interface RegistrationStore {
  // Seats
  seatStatus: SeatStatusResponse | null;
  isSeatsLoading: boolean;
  seatError: string | null;
  fetchSeats: () => Promise<void>;

  // Form State
  currentStep: number;
  formData: TeamRegistrationData;
  errors: FormErrors;
  activeCollegeTarget: MemberKey | null;
  collegeSuggestions: string[];
  setErrors: (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void;
  updateField: (field: "teamName" | "confirmAccuracy", value: string | boolean) => void;
  updateMember: (memberKey: MemberKey, field: keyof MemberData, value: string) => void;
  setActiveCollegeTarget: (target: MemberKey | null) => void;
  handleCollegeInputChange: (memberKey: MemberKey, val: string) => void;
  selectCollegeSuggestion: (memberKey: MemberKey, college: string) => void;
  setCurrentStep: (step: number) => void;
  goToStep: (step: number) => void;
  handleNext: () => boolean;
  handlePrev: () => void;

  // OTP State
  otpState: OtpState;
  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  resetOtp: () => void;
  /** Drops local verification so the OTP step is shown again. */
  invalidateVerification: () => void;
  /** Asks the backend if the email is still verified; invalidates locally if not. */
  recheckVerification: (email: string) => Promise<boolean>;

  // Payment State
  paymentState: PaymentState;
  setPaymentStatus: (status: PaymentLifecycleStatus) => void;
  setOrderDetails: (details: {
    teamId: string;
    orderId: string;
    keyId: string;
    amount: number;
    currency: string;
    lockExpiresAt: number;
  }) => void;
  setPaymentVerifying: (txId: string) => void;
  setPaymentSuccess: (txId: string, paidTeam?: PaidTeamDetails) => void;
  setPaymentFailed: (errorMessage: string) => void;
  setPaymentStatePolling: (isPolling: boolean) => void;
  pollTeamPaymentStatus: (teamId: string) => void;
  retryPayment: () => void;
}

let otpCountdownInterval: NodeJS.Timeout | null = null;
let paymentPollingInterval: NodeJS.Timeout | null = null;

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  // --- Seats State ---
  seatStatus: null,
  isSeatsLoading: false,
  seatError: null,

  fetchSeats: async () => {
    set({ isSeatsLoading: true, seatError: null });
    try {
      const data = await registrationApi.getSeatStatus();
      set({ seatStatus: data, isSeatsLoading: false });
    } catch (err: any) {
      set({
        seatError: err.message || "Failed to fetch seat availability.",
        isSeatsLoading: false,
      });
    }
  },

  // --- Form Wizard State ---
  currentStep: 1,
  formData: INITIAL_DATA,
  errors: {},
  activeCollegeTarget: null,
  collegeSuggestions: [],

  setErrors: (errorsOrUpdater) => {
    set((state) => ({
      errors:
        typeof errorsOrUpdater === "function"
          ? errorsOrUpdater(state.errors)
          : errorsOrUpdater,
    }));
  },

  updateField: (field, value) => {
    set((state) => {
      const nextErrors = { ...state.errors };
      delete nextErrors[field];
      if (field === "confirmAccuracy") {
        delete nextErrors.terms;
      }
      return {
        formData: { ...state.formData, [field]: value },
        errors: nextErrors,
      };
    });
  },

  updateMember: (memberKey, field, value) => {
    set((state) => {
      const nextErrors = { ...state.errors };
      delete nextErrors[`${memberKey}.${field}`];

      // If member1 email changes and was previously verified with a different email, reset verification
      let otpState = state.otpState;
      if (
        memberKey === "member1" &&
        field === "email" &&
        otpState.verifiedEmail &&
        value.trim().toLowerCase() !== otpState.verifiedEmail.toLowerCase()
      ) {
        otpState = {
          ...otpState,
          verifiedEmail: null,
          verifiedAt: null,
          otpSent: false,
        };
      }

      return {
        formData: {
          ...state.formData,
          [memberKey]: {
            ...state.formData[memberKey],
            [field]: value,
          },
        },
        errors: nextErrors,
        otpState,
      };
    });
  },

  setActiveCollegeTarget: (target) => {
    set({ activeCollegeTarget: target });
  },

  handleCollegeInputChange: (memberKey, val) => {
    get().updateMember(memberKey, "collegeName", val);
    if (val.trim().length > 1) {
      const filtered = COMMON_COLLEGES.filter((col) =>
        col.toLowerCase().includes(val.toLowerCase())
      );
      set({ collegeSuggestions: filtered, activeCollegeTarget: memberKey });
    } else {
      set({ collegeSuggestions: [], activeCollegeTarget: null });
    }
  },

  selectCollegeSuggestion: (memberKey, college) => {
    get().updateMember(memberKey, "collegeName", college);
    set({ collegeSuggestions: [], activeCollegeTarget: null });
  },

  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  goToStep: (step) => {
    if (step >= 1 && step <= 4) {
      set({ currentStep: step });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  },

  handleNext: () => {
    const { currentStep, formData } = get();

    if (currentStep === 1) {
      const stepErrors = validateStep1(formData);
      set({ errors: stepErrors });

      if (Object.keys(stepErrors).length === 0) {
        set({ currentStep: 2 });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return true;
      }
      return false;
    } else if (currentStep === 2) {
      const stepErrors = validateStep2(formData);
      set({ errors: stepErrors });

      if (Object.keys(stepErrors).length === 0) {
        set({ currentStep: 3 });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return true;
      }
      return false;
    }

    return true;
  },

  handlePrev: () => {
    const { currentStep } = get();
    if (currentStep > 1 && currentStep < 4) {
      set({ currentStep: currentStep - 1 });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  },

  // --- OTP Flow ---
  otpState: {
    isSending: false,
    isVerifying: false,
    otpSent: false,
    cooldownSeconds: 0,
    error: null,
    verifiedEmail: null,
    verifiedAt: null,
  },

  sendOtp: async (email: string) => {
    if (!email || !email.includes("@")) {
      set((state) => ({
        otpState: { ...state.otpState, error: "Please enter a valid email address." },
      }));
      return false;
    }

    set((state) => ({
      otpState: { ...state.otpState, isSending: true, error: null },
    }));

    try {
      await registrationApi.sendOtp(email);

      // Start 60-second cooldown timer
      if (otpCountdownInterval) {
        clearInterval(otpCountdownInterval);
      }

      set((state) => ({
        otpState: {
          ...state.otpState,
          isSending: false,
          otpSent: true,
          cooldownSeconds: 60,
          error: null,
        },
      }));

      otpCountdownInterval = setInterval(() => {
        const currentSeconds = get().otpState.cooldownSeconds;
        if (currentSeconds <= 1) {
          if (otpCountdownInterval) clearInterval(otpCountdownInterval);
          set((state) => ({
            otpState: { ...state.otpState, cooldownSeconds: 0 },
          }));
        } else {
          set((state) => ({
            otpState: { ...state.otpState, cooldownSeconds: currentSeconds - 1 },
          }));
        }
      }, 1000);

      return true;
    } catch (err: any) {
      set((state) => ({
        otpState: {
          ...state.otpState,
          isSending: false,
          error: err.message || "Failed to send verification email.",
        },
      }));
      return false;
    }
  },

  verifyOtp: async (email: string, code: string) => {
    if (!code || code.trim().length !== 6) {
      set((state) => ({
        otpState: { ...state.otpState, error: "Please enter a valid 6-digit OTP code." },
      }));
      return false;
    }

    set((state) => ({
      otpState: { ...state.otpState, isVerifying: true, error: null },
    }));

    try {
      await registrationApi.verifyOtp(email, code);

      set((state) => {
        const nextErrors = { ...state.errors };
        delete nextErrors["member1.email"];
        delete nextErrors.terms;

        return {
          otpState: {
            ...state.otpState,
            isVerifying: false,
            verifiedEmail: email.trim().toLowerCase(),
            verifiedAt: Date.now(),
            error: null,
          },
          errors: nextErrors,
        };
      });

      return true;
    } catch (err: any) {
      set((state) => ({
        otpState: {
          ...state.otpState,
          isVerifying: false,
          error: err.message || "Invalid or expired OTP code.",
        },
      }));
      return false;
    }
  },

  resetOtp: () => {
    if (otpCountdownInterval) {
      clearInterval(otpCountdownInterval);
    }
    set({
      otpState: {
        isSending: false,
        isVerifying: false,
        otpSent: false,
        cooldownSeconds: 0,
        error: null,
        verifiedEmail: null,
        verifiedAt: null,
      },
    });
  },

  invalidateVerification: () => {
    get().resetOtp();
  },

  recheckVerification: async (email: string) => {
    const verified = await checkEmailVerified(email);
    if (!verified) {
      get().invalidateVerification();
    }
    return verified;
  },

  // --- Payment State ---
  paymentState: {
    teamId: null,
    orderId: null,
    keyId: null,
    amount: 600,
    currency: "INR",
    lockExpiresAt: null,
    txId: "tx_pending",
    errorMessage: null,
    isPolling: false,
    paidTeam: null,
  },

  setPaymentStatus: (status: PaymentLifecycleStatus) => {
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        errorMessage: status === "failed" ? state.paymentState.errorMessage : null,
      },
    }));
  },

  setOrderDetails: (details) => {
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        teamId: details.teamId,
        orderId: details.orderId,
        keyId: details.keyId,
        amount: details.amount,
        currency: details.currency,
        lockExpiresAt: details.lockExpiresAt,
        errorMessage: null,
      },
    }));
  },

  setPaymentVerifying: (txId: string) => {
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        txId,
        isPolling: false,
        errorMessage: null,
      },
    }));
  },

  setPaymentSuccess: (txId: string, paidTeam?: PaidTeamDetails) => {
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        txId,
        isPolling: false,
        errorMessage: null,
        paidTeam: paidTeam || state.paymentState.paidTeam,
      },
    }));
  },

  setPaymentFailed: (errorMessage: string) => {
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        isPolling: false,
        errorMessage,
      },
    }));
  },

  setPaymentStatePolling: (isPolling: boolean) => {
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        isPolling,
        errorMessage: null,
      },
    }));
  },

  pollTeamPaymentStatus: (teamId: string) => {
    if (paymentPollingInterval) {
      clearInterval(paymentPollingInterval);
    }

    const maxAttempts = 30; // 30 * 3s = 90s
    let attempts = 0;

    paymentPollingInterval = setInterval(async () => {
      attempts++;
      try {
        const data = await registrationApi.getTeamStatus(teamId);

        if (data.status === "paid") {
          if (paymentPollingInterval) clearInterval(paymentPollingInterval);
          set((state) => ({
            paymentState: {
              ...state.paymentState,
              isPolling: false,
              errorMessage: null,
              paidTeam: data.team || state.paymentState.paidTeam,
            },
          }));
          get().fetchSeats();
        } else if (data.status === "expired" || attempts >= maxAttempts) {
          if (paymentPollingInterval) clearInterval(paymentPollingInterval);
          set((state) => ({
            paymentState: {
              ...state.paymentState,
              isPolling: false,
              errorMessage:
                "Payment timed out or failed. If money was debited, it will be refunded automatically.",
            },
          }));
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
  },

  retryPayment: () => {
    get().goToStep(3);
  },
}));
