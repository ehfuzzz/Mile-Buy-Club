"use client";

import { ReactNode } from "react";

interface OnboardingStepProps {
  title: string;
  description?: string;
  step: number;
  totalSteps: number;
  children: ReactNode;
  footer?: ReactNode;
}

export function OnboardingStep({
  title,
  description,
  step,
  totalSteps,
  children,
  footer
}: OnboardingStepProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-500">Step {step} of {totalSteps}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="text-sm text-slate-600">{description}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-6" aria-live="polite">
        {children}
      </div>
      {footer ? <div className="flex flex-col gap-3 pt-2">{footer}</div> : null}
    </div>
  );
}
