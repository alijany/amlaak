import { HTMLAttributes } from "react";
import { cn } from "@/libs/style/style.util.helpers";
import { Card, CardContent } from "../../atoms/ui.card";

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "card" | "inline";
}

export function Loading({
  children,
  className,
  variant = "card",
  ...props
}: LoadingProps) {
  const spinner = (
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-center py-6", className)} {...props}>
        {content}
      </div>
    );
  }

  return (
    <Card className={cn("bg-white", className)} {...props}>
      <CardContent className="flex min-h-[200px] items-center justify-center p-4">
        {content}
      </CardContent>
    </Card>
  );
}