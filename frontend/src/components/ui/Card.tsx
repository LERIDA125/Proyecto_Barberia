import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`rounded-none border border-gray-100 bg-white p-5 shadow-none dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {children}
    </div>
  );
}