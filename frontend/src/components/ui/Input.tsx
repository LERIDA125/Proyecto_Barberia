import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface CampoBase {
  label: string;
  error?: string;
}

type InputProps = CampoBase & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, id, className = "", ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground ">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        className={`rounded-none bg-surface border-none px-4 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-accent/30 ${
          error ? "border-red-500" : ""
        } ${className}`}
      />
      {error && <span className="text-xs text-red-400 ">{error}</span>}
    </div>
  );
}

type TextareaProps = CampoBase & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, id, className = "", ...rest }: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground ">
        {label}
      </label>
      <textarea
        {...rest}
        id={inputId}
        className={`rounded-none bg-surface border-none px-4 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-accent/30 ${
          error ? "border-red-500" : ""
        } ${className}`}
      />
      {error && <span className="text-xs text-red-400 ">{error}</span>}
    </div>
  );
}