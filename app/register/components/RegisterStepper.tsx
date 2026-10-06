import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { RegistrationStep } from "../types";

export interface RegisterStepperProps {
  currentStep: number;
  steps: RegistrationStep[];
  onStepClick: (stepId: number) => void;
}

export const RegisterStepper: React.FC<RegisterStepperProps> = ({
  currentStep,
  steps,
  onStepClick,
}) => {
  const activeStep = steps.find((s) => s.id === currentStep);

  return (
    <div className="w-full mb-6 sm:mb-12 px-0.5">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div
                onClick={() => {
                  if (isCompleted && currentStep !== 4) {
                    onStepClick(step.id);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-3 group select-none transition-all shrink-0",
                  isCompleted && currentStep !== 4
                    ? "cursor-pointer"
                    : "cursor-default",
                )}
              >
                {/* Circle Indicator */}
                <div
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-300",
                    isCompleted
                      ? "bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                      : isActive
                        ? "bg-transparent border-2 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                        : "bg-white/5 border border-white/20 text-neutral-500",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium tracking-tight hidden sm:inline-block transition-colors",
                    isActive
                      ? "text-white font-semibold"
                      : isCompleted
                        ? "text-neutral-300 group-hover:text-white"
                        : "text-neutral-500",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-1.5 sm:mx-4 h-[1.5px] bg-neutral-800 relative overflow-hidden rounded-full min-w-[8px]">
                  <div
                    className={cn(
                      "h-full bg-white transition-all duration-500",
                      currentStep > step.id ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Step Title */}
      <div className="sm:hidden text-center mt-3">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
          Step {currentStep} of {steps.length}:{" "}
          <span className="text-white font-medium">
            {activeStep?.label}
          </span>
        </span>
      </div>
    </div>
  );
};
