import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONOS: Record<Tone, string> = {
  neutral:
    "bg-surface text-foreground ",
  success:
    "bg-green-900/30 text-green-300 ",
  warning: "bg-accent/15 text-foreground ",
  danger: "bg-red-900/30 text-red-300 ",
  info: "bg-accent/15 text-foreground ",
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