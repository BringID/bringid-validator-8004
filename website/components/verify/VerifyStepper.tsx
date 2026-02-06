"use client";

const steps = [
  { id: 1, name: "Connect" },
  { id: 2, name: "Ownership" },
  { id: 3, name: "Approval" },
  { id: 4, name: "Verify" },
  { id: 5, name: "Submit" },
  { id: 6, name: "Success" },
];

interface VerifyStepperProps {
  currentStep: number;
}

export function VerifyStepper({ currentStep }: VerifyStepperProps) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 text-sm font-mono
                    ${
                      isCompleted
                        ? "bg-accent text-black"
                        : isCurrent
                        ? "bg-white text-black"
                        : "bg-surface-raised border border-surface-border text-neutral-600"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`ml-2 text-sm hidden md:inline ${
                    isCurrent ? "text-white" : "text-neutral-600"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 md:w-12 h-px mx-2 ${
                    currentStep > step.id ? "bg-accent" : "bg-surface-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
