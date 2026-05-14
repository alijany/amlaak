import { cn } from "@/libs/style/style.util.helpers";
import { ReactNode } from "react";

interface LabelProps {
    children: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function Label({ children, icon, className }: LabelProps) {
    return (
        <div
            className={cn(
                "inline-flex justify-center items-center space-x-2 space-x-reverse bg-white/40 backdrop-blur-sm rounded-full px-3 py-2.5 shadow-rose-500/5 shadow-lg",
                className
            )}
        >
            {icon && icon}
            <div className="text-xs text-slate-700">{children}</div>
        </div>
    );
}
