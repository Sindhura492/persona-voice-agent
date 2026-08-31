import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <p
      className={`text-caption uppercase tracking-[0.18em] text-slate ${className}`.trim()}
    >
      {children}
    </p>
  );
}
