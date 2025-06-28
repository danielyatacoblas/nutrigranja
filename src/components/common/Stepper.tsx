import React from "react";
export default function Stepper({
  steps,
  activeStep,
}: {
  steps: string[];
  activeStep: number;
}) {
  return (
    <div>
      {steps.map((step, i) => (
        <span key={step} className={i === activeStep ? "step-active" : ""}>
          {step}
        </span>
      ))}
    </div>
  );
}
