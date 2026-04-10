import type { ReactNode } from "react";

interface SectionHeadingProps {
  id?: string;
  children: ReactNode;
}

export function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className="mt-14 mb-5 scroll-mt-20 text-xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  );
}

export function SubsectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h3
      id={id}
      className="mt-10 mb-3 scroll-mt-20 text-base font-semibold"
    >
      {children}
    </h3>
  );
}
