import { ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/style/style.util.helpers";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
        {
          "bg-primary text-slate-900 hover:bg-primary/90 text-white": variant === "primary",
          "bg-slate-200 text-slate-900 hover:bg-slate-300": variant === "secondary",
          "border border-input bg-transparent hover:bg-accent": variant === "outline",
          "bg-white/20 text-slate-900 hover:bg-white/30": variant === "ghost",
          "bg-white border border-white text-slate-700 hover:bg-white/80": variant === "white",
          "px-3 py-1.5 lg:px-3.5 lg:py-1.5": size === "sm",
          "px-4 py-2 lg:px-6 lg:py-2": size === "md",
          "px-5 py-2.5 lg:px-8 lg:py-3": size === "lg",
          "opacity-50 cursor-not-allowed": props.disabled,
        },
        className
      )}
      {...props}
    />
  );
}
