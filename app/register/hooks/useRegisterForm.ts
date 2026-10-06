import { useEffect } from "react";
import { useRegistrationStore } from "../store/useRegistrationStore";

export function useRegisterForm() {
  const store = useRegistrationStore();

  // Load live seat availability on initial mount
  useEffect(() => {
    store.fetchSeats();
  }, []);

  return {
    // Stepper & Navigation
    currentStep: store.currentStep,
    setCurrentStep: store.setCurrentStep,
    handleNext: store.handleNext,
    handlePrev: store.handlePrev,
    goToStep: store.goToStep,

    // Form Data & Validation Errors
    formData: store.formData,
    errors: store.errors,
    setErrors: store.setErrors,
    updateMember: store.updateMember,
    updateField: store.updateField,

    // Autocomplete for Colleges
    activeCollegeTarget: store.activeCollegeTarget,
    setActiveCollegeTarget: store.setActiveCollegeTarget,
    collegeSuggestions: store.collegeSuggestions,
    handleCollegeInputChange: store.handleCollegeInputChange,
    selectCollegeSuggestion: store.selectCollegeSuggestion,

    // OTP Verification
    otpState: store.otpState,
    sendOtp: store.sendOtp,
    verifyOtp: store.verifyOtp,
    resetOtp: store.resetOtp,
    recheckVerification: store.recheckVerification,

    // Seat Availability
    seatStatus: store.seatStatus,
    isSeatsLoading: store.isSeatsLoading,
    seatError: store.seatError,
    fetchSeats: store.fetchSeats,
  };
}
