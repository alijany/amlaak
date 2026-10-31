import { cn } from "@/libs/style/style.util.helpers";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { HTMLAttributes } from "react";
import { Button } from "../../atoms/ui.button";
import { Card, CardContent } from "../../atoms/ui.card";

interface ErrorProps extends HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    title?: string;
    message?: string;
    variant?: "card" | "inline";
    showBackButton?: boolean;
    onRetry?: () => void;
    retryText?: string;
}

export function Error({
    children,
    title,
    message,
    className,
    variant = "card",
    showBackButton = false,
    onRetry,
    retryText,
    ...props
}: ErrorProps) {
    const t = useTranslations('common.dataView');

    const content = (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <IconAlertTriangle className="text-destructive" size={36} />

            <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                    {title ?? t('errorTitle')}
                </h3>
                <p className="text-muted-foreground">{message ?? t('errorMessage')}</p>
            </div>

            <div className="flex gap-2">
                {showBackButton && (
                    <Button variant="outline" onClick={() => { }}>
                        {t('back')}
                    </Button>
                )}

                {onRetry && (
                    <Button size="sm" onClick={onRetry}>
                        {retryText ?? t('retry')}
                    </Button>
                )}
            </div>

            {children}
        </div>
    );

    if (variant === "inline") {
        return (
            <div
                className={cn("flex items-center justify-center py-8", className)}
                {...props}
            >
                {content}
            </div>
        );
    }

    return (
        <Card className={cn("bg-white", className)} {...props}>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                {content}
            </CardContent>
        </Card>
    );
}