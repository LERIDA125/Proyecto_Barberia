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
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        className={`rounded-none bg-gray-100 border-none px-4 py-4 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-100 dark:text-slate-100 dark:focus:ring-blue-200 ${
          error ? "border-red-500" : ""
        } ${className}`}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}

type TextareaProps = CampoBase & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, id, className = "", ...rest }: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <textarea
        {...rest}
        id={inputId}
        className={`rounded-none bg-gray-100 border-none px-4 py-4 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-100 dark:text-slate-100 dark:focus:ring-blue-200 ${
          error ? "border-red-500" : ""
        } ${className}`}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}