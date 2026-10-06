"use client";

import { useCallback } from "react";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { useRegistrationStore } from "../store/useRegistrationStore";
import {
  registrationApi,
  checkEmailVerified,
} from "../services/registrationApi";
import { PaymentLifecycleStatus } from "../../components/register/PaymentStatus";
import { RegisterRequest } from "../types";
import { cleanPhoneNumber } from "../utils/validation";
import { ApiError } from "../utils/apiErrors";
import { loadRazorpayScript } from "../utils/loadRazorpay";

const VERIFICATION_EXPIRED_MSG =
  "Your verification expired, please verify again.";

/**
 * After any failure on the review/payment step:
 *  - release a held seat (cancel) when we have a teamId,
 *  - re-check the email verification window; if it is gone (or the backend said so),
 *    drop the local verified state so the OTP step is shown again.
 * A still-valid verification is left untouched so the user can simply retry.
 */
async function recoverFromError(
  message: string,
  opts: { teamId?: string | null; forceInvalidate?: boolean } = {},
) {
  const store = useRegistrationStore.getState();
  const email = store.formData.member1.email;

  const stillVerified = opts.forceInvalidate
    ? false
    : await checkEmailVerified(email);

  if (!stillVerified) {
    store.invalidateVerification();
  }

  // Remove any data held for this team (seat lock). Not-verified => also clean up the
  // last known team, if any. Cancel is a no-op on the backend for paid/unknown teams.
  const teamId =
    opts.teamId ?? (!stillVerified ? store.paymentState.teamId : null);
  if (teamId) {
    try {
      await registrationApi.cancelRegistration(teamId);
    } catch {
      // best effort
    }
  }

  store.setErrors((prev) => ({
    ...prev,
    terms: stillVerified ? message : message || VERIFICATION_EXPIRED_MSG,
  }));
}

export function usePaymentSimulation(onPaymentInitiated?: () => void) {
  const { error: rzpError, isLoading: isRzpLoading, Razorpay } = useRazorpay();
  const store = useRegistrationStore();

  const handleSlidePayment = useCallback(
    async (confirmAccuracy: boolean) => {
      if (!confirmAccuracy) {
        throw new Error("Confirmation required");
      }

      const { formData, otpState } = useRegistrationStore.getState();
      const leaderEmail = formData.member1.email.trim().toLowerCase();

      // Local check: must have verified this exact email in this session.
      if (
        !otpState.verifiedEmail ||
        otpState.verifiedEmail.toLowerCase() !== leaderEmail
      ) {
        throw new Error(
          "Please verify Team Leader's email via OTP before proceeding to payment.",
        );
      }

      // Server check: the 5-minute window may have lapsed.
      const stillVerified = await checkEmailVerified(leaderEmail);
      if (!stillVerified) {
        useRegistrationStore.getState().invalidateVerification();
        throw new Error(VERIFICATION_EXPIRED_MSG);
      }

      // 1. Submit Registration to backend
      const registerPayload: RegisterRequest = {
        teamName: formData.teamName.trim(),
        member1: {
          ...formData.member1,
          phone: cleanPhoneNumber(formData.member1.phone),
          email: leaderEmail,
        },
        member2: {
          ...formData.member2,
          phone: cleanPhoneNumber(formData.member2.phone),
          email: formData.member2.email.trim().toLowerCase(),
        },
      };

      let regResult;
      try {
        regResult = await registrationApi.registerTeam(registerPayload);
      } catch (err: any) {
        const notVerified =
          err instanceof ApiError &&
          (err.code === "EMAIL_NOT_VERIFIED" || err.status === 403);
        await recoverFromError(
          notVerified ? VERIFICATION_EXPIRED_MSG : err.message,
          { forceInvalidate: notVerified },
        );
        throw err;
      }

      // Save order details to store
      store.setOrderDetails(regResult);

      // Ensure Razorpay SDK is loaded dynamically or ready via window
      let isLoaded = typeof window !== "undefined" && Boolean(window.Razorpay);
      if (!isLoaded) {
        isLoaded = await loadRazorpayScript();
      }

      if (!isLoaded && (isRzpLoading || !Razorpay)) {
        const msg =
          rzpError ||
          "Unable to load payment gateway SDK. Please check your connection or disable ad-blockers.";
        await recoverFromError(msg, { teamId: regResult.teamId });
        throw new Error(msg);
      }

      // 2. Open Razorpay Checkout modal via react-razorpay
      return new Promise<void>((resolve, reject) => {
        const options: RazorpayOrderOptions = {
          key: regResult.keyId,
          order_id: regResult.orderId,
          amount: regResult.amount * 100, // In paise (e.g. 60000)
          currency: (regResult.currency as any) || "INR",
          name: "DVINE",
          description: `Registration for team: ${formData.teamName}`,
          prefill: {
            name: `${formData.member1.firstName} ${formData.member1.lastName}`.trim(),
            email: formData.member1.email.trim(),
            contact: cleanPhoneNumber(formData.member1.phone),
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: async function () {
              const s = useRegistrationStore.getState();
              try {
                const cancelRes = await registrationApi.cancelRegistration(
                  regResult.teamId,
                );

                if (cancelRes.reason === "PAYMENT_IN_PROGRESS") {
                  s.setCurrentStep(4);
                  if (onPaymentInitiated) onPaymentInitiated();
                  s.setPaymentStatePolling(true);
                  s.pollTeamPaymentStatus(regResult.teamId);
                  resolve();
                  return;
                }

                // Clean cancel: back to the review step. Verification is kept if it
                // is still valid; otherwise the OTP step reappears.
                s.setCurrentStep(3);
                s.setErrors((prev) => ({
                  ...prev,
                  terms:
                    "Payment cancelled. Your temporary seat reservation has been released.",
                }));
                s.recheckVerification(s.formData.member1.email);
                resolve();
              } catch (err) {
                console.error("Cancel call error:", err);
                resolve();
              }
            },
          },
          handler: async function (response) {
            const s = useRegistrationStore.getState();
            s.setCurrentStep(4);
            if (onPaymentInitiated) onPaymentInitiated();
            s.setPaymentVerifying(response.razorpay_payment_id);

            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }

            try {
              const verifyRes = await registrationApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.ok && verifyRes.status === "paid") {
                s.setPaymentSuccess(response.razorpay_payment_id, verifyRes.team);
                s.fetchSeats();
                resolve();
              }
            } catch (err: any) {
              s.setPaymentFailed(
                err.message ||
                  "Payment verification failed. Please contact support.",
              );
              reject(err);
            }
          },
        };

        try {
          const RazorpayConstructor = Razorpay || (typeof window !== "undefined" ? window.Razorpay : null);
          if (!RazorpayConstructor) {
            throw new Error("Razorpay SDK is not available.");
          }
          const rzp = new RazorpayConstructor(options);
          rzp.on("payment.failed", (response: any) => {
            const s = useRegistrationStore.getState();
            s.setCurrentStep(4);
            if (onPaymentInitiated) onPaymentInitiated();
            s.setPaymentFailed(
              response?.error?.description ||
                "Payment failed or was declined by bank.",
            );
          });
          rzp.open();
        } catch (err: any) {
          recoverFromError(
            err.message || "Failed to initialize Razorpay gateway.",
            { teamId: regResult.teamId },
          ).finally(() => reject(err));
        }
      });
    },
    [Razorpay, isRzpLoading, rzpError, store, onPaymentInitiated],
  );

  let currentStatus: PaymentLifecycleStatus = "processing";
  if (store.paymentState.errorMessage) {
    currentStatus = "failed";
  } else if (store.paymentState.isPolling) {
    currentStatus = "verifying";
  } else if (
    store.paymentState.txId &&
    store.paymentState.txId !== "tx_pending" &&
    !store.paymentState.errorMessage
  ) {
    currentStatus = "success";
  }

  return {
    paymentStatus: currentStatus,
    setPaymentStatus: store.setPaymentStatus,
    txId: store.paymentState.txId,
    paymentState: store.paymentState,
    handleSlidePayment,
    retryPayment: store.retryPayment,
  };
}

export { usePaymentSimulation as usePayment };
