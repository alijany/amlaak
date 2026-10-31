import { HTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
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
    retryText?: string;
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
    errorTitle,
    errorMessage,
    retryText,
    emptyMessage,
    emptyIcon,
    onRetry,
    variant = "card",
    children,
    className,
    ...props
}: DataViewProps<T>) {
    // Callers may still pass explicit copy; the catalog supplies the default so
    // a caller that omits it renders in the reader's language.
    const t = useTranslations('common.dataView');

    if (isLoading) {
        return <Loading className={className} variant={variant} />;
    }

    if (error) {
        return (
            <Error
                className={className}
                title={errorTitle ?? t('errorTitle')}
                message={errorMessage ?? t('errorMessage')}
                retryText={retryText ?? t('retry')}
                onRetry={onRetry}
                variant={variant}
            />
        );
    }

    if (!data || (isEmpty && data && isEmpty(data))) {
        return (
            <EmptyState
                className={className}
                message={emptyMessage ?? t('empty')}
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