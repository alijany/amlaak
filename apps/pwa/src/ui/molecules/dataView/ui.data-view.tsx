import { HTMLAttributes } from 'react';
import { Loading } from './ui.loading';
import { Error } from './ui.error';
import { EmptyState } from './ui.empty-state';

interface DataViewProps<T> extends HTMLAttributes<HTMLDivElement> {
    data?: T;
    error?: unknown;
    isLoading: boolean;
    isEmpty?: (data: T) => boolean;
    errorTitle?: string;
    errorMessage?: string;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    onRetry?: () => void;
    variant?: "card" | "inline";
}

export function DataView<T>({
    data,
    error,
    isLoading,
    isEmpty,
    errorTitle = "اوه نه!",
    errorMessage = "مشکلی پیش آمد. لطفا دوباره تلاش کنید.",
    emptyMessage = "نتیجه ای یافت نشد",
    emptyIcon,
    onRetry,
    variant = "card",
    children,
    className,
    ...props
}: DataViewProps<T>) {
    if (isLoading) {
        return <Loading className={className} variant={variant} />;
    }

    if (error) {
        return (
            <Error
                className={className}
                title={errorTitle}
                message={errorMessage}
                onRetry={onRetry}
                variant={variant}
            />
        );
    }

    if (!data || (isEmpty && data && isEmpty(data))) {
        return (
            <EmptyState
                className={className}
                message={emptyMessage}
                icon={emptyIcon}
                variant={variant}
            />
        );
    }

    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
}