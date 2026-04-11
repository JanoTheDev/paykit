import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
