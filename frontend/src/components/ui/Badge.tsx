import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONOS: Record<Tone, string> = {
  neutral:
    "bg-gray-100 text-slate-800 dark:bg-gray-800 dark:text-slate-100",
  success:
    "bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-300",
  warning: "bg-blue-100 text-slate-900 dark:bg-blue-800/40 dark:text-slate-100",
  danger: "bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300",
  info: "bg-blue-100 text-slate-900 dark:bg-blue-800/40 dark:text-slate-100",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-medium ${TONOS[tone]}`}
    >
      {children}
    </span>
  );
}