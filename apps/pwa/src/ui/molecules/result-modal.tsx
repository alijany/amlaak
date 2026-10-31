'use client';

import React from 'react';
import { Button } from '@/ui/atoms/ui.button';
import { Modal } from '@/ui/atoms/ui.modal';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/libs/style/style.util.helpers';

export interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    status: 'success' | 'error';
    successTitle?: string;
    successMessage?: string;
    errorTitle?: string;
    errorMessage?: string;
    closeButtonText?: string;
    className?: string;
}

export function ResultModal({
    isOpen,
    onClose,
    title,
    status,
    successTitle,
    successMessage,
    errorTitle,
    errorMessage,
    closeButtonText,
    className,
}: ResultModalProps): React.ReactElement {
    const t = useTranslations('common.result');
    const closeLabel = closeButtonText ?? t('close');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={cn("w-full bg-white p-6 flex flex-col gap-8 lg:min-w-[600px]", className)}
        >
            <div className='flex justify-between items-center pb-4'>
                <div className='font-bold text-lg lg:text-xl text-slate-700'>
                    {title ?? t('title')}
                </div>

                <Button variant='outline' className='!px-2' aria-label={closeLabel} onClick={onClose}>
                    <IconX className='size-5' />
                </Button>
            </div>

            {status === 'success' && (
                <div className="space-y-8 flex flex-col items-center">
                    <div className="bg-emerald-400/10 text-emerald-500 rounded-full p-5">
                        <IconCheck size={48} />
                    </div>

                    <div className="space-y-3 text-center">
                        <div className="text-2xl font-bold">{successTitle ?? t('successTitle')}</div>
                        <div>{successMessage ?? t('successMessage')}</div>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-8 flex flex-col items-center">
                    <div className="bg-red-400/10 text-red-500 rounded-full p-5">
                        <IconX size={48} />
                    </div>

                    <div className="space-y-3 text-center">
                        <div className="text-2xl font-bold">{errorTitle ?? t('errorTitle')}</div>
                        <div>{errorMessage ?? t('errorMessage')}</div>
                    </div>
                </div>
            )}

            <Button variant='ghost' className="bg-slate-100 w-full" onClick={onClose}>
                {closeLabel}
            </Button>
        </Modal>
    );
}