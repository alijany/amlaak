'use client';

import React from 'react';
import { cn } from '@/libs/style/style.util.helpers';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-t-transparent border-blue-600',
                sizeClasses[size],
                className
            )}
        />
    );
}