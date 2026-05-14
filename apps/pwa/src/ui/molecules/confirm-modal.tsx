'use client';

import React from 'react';
import { Button } from '@/ui/atoms/ui.button';
import { Modal } from '@/ui/atoms/ui.modal';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/libs/style/style.util.helpers';

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    className?: string;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'تایید عملیات',
    message = 'آیا از انجام این عملیات اطمینان دارید؟',
    confirmButtonText = 'تایید',
    cancelButtonText = 'بازگشت',
    className,
}: ConfirmModalProps): React.ReactElement {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={cn("w-full bg-white p-6 flex flex-col gap-8 lg:min-w-[600px]", className)}
        >
            <div className='flex justify-between items-center pb-4'>
                <div className='font-bold text-lg lg:text-xl text-slate-700'>
                    {title}
                </div>
                <Button variant='outline' className='!px-2' onClick={onClose}>
                    <IconX className='size-5' />
                </Button>
            </div>
            <div className="flex flex-col items-center space-y-4">
                <div className="bg-orange-200/60 text-orange-500 rounded-full p-5">
                    {/* You can use a warning icon here if desired */}
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.48 21h17.04a2 2 0 0 0 1.66-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="text-center text-lg font-medium">{message}</div>
            </div>
            <div className="flex gap-4">
                <Button className="flex-1 bg-red-500 text-white" onClick={onConfirm}>
                    {confirmButtonText}
                </Button>
                <Button variant='ghost' className="flex-1 bg-slate-100" onClick={onClose}>
                    {cancelButtonText}
                </Button>
            </div>
        </Modal>
    );
}
