import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: ButtonVariant;
  cargando?: boolean;
  children: ReactNode;
}

const ESTILOS: Record<ButtonVariant, string> = {
  primary:
    "rounded-none bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-accent focus-visible:outline-offset-2 ",
  secondary:
    "rounded-none border border-border bg-surface text-foreground hover:bg-foreground/5 focus-visible:outline-accent ",
  ghost:
    "rounded-none text-foreground hover:bg-foreground/5 focus-visible:outline-accent ",
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