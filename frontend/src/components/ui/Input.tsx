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
      <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-widest text-neutral-500 ">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        className={`rounded-none border border-neutral-800 bg-neutral-900 px-4 py-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-0 ${
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
      <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-widest text-neutral-500 ">
        {label}
      </label>
      <textarea
        {...rest}
        id={inputId}
        className={`rounded-none border border-neutral-800 bg-neutral-900 px-4 py-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-0 ${
          error ? "border-red-500" : ""
        } ${className}`}
      />
      {error && <span className="text-xs text-red-400 ">{error}</span>}
    </div>
  );
}