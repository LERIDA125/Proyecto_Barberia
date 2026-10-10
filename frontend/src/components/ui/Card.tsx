import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`rounded-none border border-border bg-surface p-5 shadow-none ${className}`}
    >
      {children}
    </div>
  );
}