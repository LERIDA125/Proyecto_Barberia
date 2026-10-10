import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONOS: Record<Tone, string> = {
  neutral: "border-neutral-800 bg-black text-neutral-400",
  success: "border-green-900 bg-black text-green-400",
  warning: "border-amber-900 bg-black text-amber-400",
  danger: "border-red-900 bg-black text-red-400",
  info: "border-sky-900 bg-black text-sky-400",
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
      className={`inline-flex items-center rounded-none border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${TONOS[tone]}`}
    >
      {children}
    </span>
  );
}