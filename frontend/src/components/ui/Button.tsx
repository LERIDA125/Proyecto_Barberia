import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: ButtonVariant;
  cargando?: boolean;
  children: ReactNode;
}

const ESTILOS: Record<ButtonVariant, string> = {
  primary:
    "rounded-none bg-white text-black hover:bg-neutral-300 focus-visible:outline-white focus-visible:outline-offset-2 ",
  secondary:
    "rounded-none border border-neutral-800 bg-transparent text-neutral-300 hover:border-neutral-300 hover:text-white focus-visible:outline-white ",
  ghost:
    "rounded-none text-neutral-300 hover:bg-white/5 hover:text-white focus-visible:outline-white ",
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
      className={`inline-flex items-center justify-center gap-2 rounded-none px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}>
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