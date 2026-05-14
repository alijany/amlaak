import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/libs/style/style.util.helpers";

type InputBaseProps = {
  icon?: ReactNode;
  id?: string;
  error?: string;
  label?: string;
  labelRight?: ReactNode; // Added prop for text next to label
  packageId?: string;
  className?: string;
  containerClassName?: string;
  variant?: 'light' | 'dark';
};

type TextareaInputProps = InputBaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & {
  textarea: true;
};

type StandardInputProps = InputBaseProps & InputHTMLAttributes<HTMLInputElement> & {
  textarea?: false;
};

type InputProps = TextareaInputProps | StandardInputProps;

export function Input({ className, icon, error, label, labelRight, packageId, textarea, variant = 'light', containerClassName, ...props }: InputProps) {
  const isDark = variant === 'dark';
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={packageId ?? label} className={cn("font-medium mb-2 gap-2 flex items-center", isDark ? "text-neutral-50" : "text-slate-700")}>
          <span>{label}</span>
          {labelRight && (
            <span>{labelRight}</span>
          )}
        </label>
      )}
      <div className={cn("flex items-center px-4 space-x-2 space-x-reverse rounded-xl border focus-within:ring-1", isDark ? "border-neutral-50 focus-within:border-neutral-100 focus-within:ring-neutral-100" : "border-slate-200 focus-within:border-slate-500 focus-within:ring-slate-500")}>
        {icon && (
          <span className="flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        )}
        {textarea ? (
          <textarea
            className={cn(
              "text-sm w-full py-2.5 bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
              isDark ? "text-white placeholder:text-slate-100" : "text-slate-700",
              className
            )}
            id={packageId ?? label}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={cn(
              "text-sm w-full py-2.5 bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50",
              isDark ? "text-white placeholder:text-slate-100" : "text-slate-700",
              className
            )}
            id={packageId ?? label}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500" role="alert">{error}</p>}
    </div>
  );
}