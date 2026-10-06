"use client";

import { AnimatePresence } from "framer-motion";
import { useRegisterForm } from "./hooks/useRegisterForm";
import { usePaymentSimulation } from "./hooks/usePayment";
import { STEPS } from "./constants";
import {
  BackgroundGradients,
  RegisterHeader,
  RegisterStepper,
  Step1TeamDetails,
  Step2AcademicDetails,
  Step3ReviewSummary,
  Step4Confirmation,
} from "./components";

// Re-export domain types for backward compatibility
export type { MemberData, TeamRegistrationData } from "./types";

export default function RegisterPage() {
  const {
    currentStep,
    setCurrentStep,
    formData,
    errors,
    setErrors,
    updateMember,
    updateField,
    activeCollegeTarget,
    setActiveCollegeTarget,
    collegeSuggestions,
    handleCollegeInputChange,
    selectCollegeSuggestion,
    handleNext,
    handlePrev,
    goToStep,
    otpState,
    sendOtp,
    verifyOtp,
    recheckVerification,
    seatStatus,
    isSeatsLoading,
  } = useRegisterForm();

  const {
    paymentStatus,
    setPaymentStatus,
    txId,
    handleSlidePayment,
    retryPayment,
    paymentState,
  } = usePaymentSimulation(() => setCurrentStep(4));

  const isLeaderEmailVerified =
    Boolean(otpState.verifiedEmail) &&
    otpState.verifiedEmail?.toLowerCase() ===
      formData.member1.email.trim().toLowerCase();

  const isSoldOut = Boolean(seatStatus && seatStatus.available === 0);

  const onSlidePayment = async () => {
    try {
      await handleSlidePayment(formData.confirmAccuracy);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        terms:
          err?.message ||
          "Please verify your details and ensure lead email is verified.",
      }));
      throw err;
    }
  };

  const handleSetTermsError = (msg: string) => {
    setErrors((prev) => ({ ...prev, terms: msg }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#020817] text-[#FAFAFA] antialiased selection:bg-cyan-500/30 selection:text-white flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {/* Background Decorative Gradients & Radial Grid */}
      <BackgroundGradients />

      {/* Top Header / Navigation Bar with Live Seat Indicator */}
      <RegisterHeader seatStatus={seatStatus} isLoading={isSeatsLoading} />

      {/* Main Registration Experience */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Stepper Progress Bar */}
        <RegisterStepper
          currentStep={currentStep}
          steps={STEPS}
          onStepClick={goToStep}
        />

        {/* Step Transition Views */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1TeamDetails
              formData={formData}
              errors={errors}
              onUpdateField={updateField}
              onUpdateMember={updateMember}
              onNext={handleNext}
              isSoldOut={isSoldOut}
            />
          )}

          {currentStep === 2 && (
            <Step2AcademicDetails
              formData={formData}
              errors={errors}
              activeCollegeTarget={activeCollegeTarget}
              collegeSuggestions={collegeSuggestions}
              onCollegeChange={handleCollegeInputChange}
              onCollegeSelect={selectCollegeSuggestion}
              onCollegeFocus={setActiveCollegeTarget}
              onUpdateMember={updateMember}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && (
            <Step3ReviewSummary
              formData={formData}
              errors={errors}
              onEditStep={goToStep}
              onUpdateField={updateField}
              onSlidePayment={onSlidePayment}
              onSetTermsError={handleSetTermsError}
              amount={paymentState.amount}
              isLeaderEmailVerified={isLeaderEmailVerified}
              otpState={otpState}
              onSendOtp={sendOtp}
              onVerifyOtp={verifyOtp}
              onVerificationExpired={() =>
                recheckVerification(formData.member1.email)
              }
            />
          )}

          {currentStep === 4 && (
            <Step4Confirmation
              formData={formData}
              paymentStatus={paymentStatus}
              txId={txId}
              onSetPaymentStatus={setPaymentStatus}
              onRetryPayment={retryPayment}
              onChangePaymentMethod={() => goToStep(3)}
              amount={paymentState.amount}
              errorMessage={paymentState.errorMessage}
              isPolling={paymentState.isPolling}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
