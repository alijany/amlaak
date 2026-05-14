'use client';

import React from 'react';
import { brand } from '@/config/brand.config';
import { Button } from '@/ui/atoms/ui.button';
import { Modal } from '@/ui/atoms/ui.modal';
import { IconSparkles, IconX, IconGift } from '@tabler/icons-react';
import { cn } from '@/libs/style/style.util.helpers';

export interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

const { welcomeModal } = brand;

export function WelcomeModal({
    isOpen,
    onClose,
    className,
}: WelcomeModalProps): React.ReactElement {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={cn("w-full bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex flex-col gap-6 lg:min-w-[600px] !overflow-auto", className)}
        >
            <div className='flex justify-between items-center pb-2'>
                <div className='flex items-center gap-3'>
                    <div className='bg-purple-500 text-white rounded-full p-2'>
                        <IconSparkles className='size-6' />
                    </div>
                    <div className='font-bold text-xl lg:text-2xl text-slate-800'>
                        {welcomeModal.title}
                    </div>
                </div>

                <Button variant='ghost' className='!px-2' onClick={onClose}>
                    <IconX className='size-5' />
                </Button>
            </div>

            <div className="space-y-6">
                {/* Welcome message */}
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full p-3 flex-shrink-0">
                            <IconGift className='size-8' />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold text-slate-800">
                                {welcomeModal.giftHeading}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {welcomeModal.giftBody}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features list */}
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <ul className="space-y-3">
                        {welcomeModal.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                                <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-slate-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Notice */}
                <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-4">
                    <div className="flex gap-3">
                        <div className="text-amber-600 flex-shrink-0">
                            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-sm text-amber-800 leading-relaxed">
                            {welcomeModal.notice}
                        </div>
                    </div>
                </div>

                {/* Action button */}
                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg"
                    >
                        {welcomeModal.ctaLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
