import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: ButtonVariant;
  cargando?: boolean;
  children: ReactNode;
}

const ESTILOS: Record<ButtonVariant, string> = {
  primary:
    "rounded-none bg-black text-white hover:bg-gray-800 focus-visible:outline-black focus-visible:outline-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
  secondary:
    "rounded-none border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost:
    "rounded-none text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "rounded-none bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
};

export function Button({
  variante = "primary",
  cargando = false,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-none px-4 py-2 text-sm font-medium uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}>
      {cargando && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-none border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}