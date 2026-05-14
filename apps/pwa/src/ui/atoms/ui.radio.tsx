import { ButtonHTMLAttributes } from "react";
import { cn } from "@/libs/style/style.util.helpers";

interface RadioChooseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    options: { value: string; label: string }[];
    value: string;
    containerClassName?: string;
    onChange: (value: string) => void;
    error?: string;
}

export function RadioChoose({
    options,
    value,
    onChange,
    className,
    containerClassName,
    error,
    ...props
}: RadioChooseProps) {
    return (
        <div className="w-full">
            <div className={cn("flex items-center gap-2", containerClassName)}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "p-3 rounded-lg border text-sm font-medium transition-all focus:outline-none flex items-center gap-2",
                            value === option.value
                                ? "border-rose-500 bg-rose-50 text-rose-500"
                                : error
                                    ? "border-rose-500 bg-rose-50/50 text-slate-700 hover:bg-rose-50"
                                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                            , className
                        )}
                        {...props}
                    >
                        <svg className="text-rose-500 size-4" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="6" r="5" className={value === option.value ? "stroke-rose-500" : "stroke-slate-300"} strokeWidth="1" fill="none" />
                            {value === option.value && <circle cx="6" cy="6" r="3" className="fill-rose-500" />}
                        </svg>
                        {option.label}
                    </button>
                ))}
            </div>
            {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
