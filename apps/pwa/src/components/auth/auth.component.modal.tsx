'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { TermsModal } from '@/components/modals/modals.component.terms';
import { useRouter } from '@/i18n/i18n.navigation';
import { useApiErrorMessage } from '@/libs/api/api.hook.use-error-message';
import { Button, Input, Modal } from '@/ui/atoms';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function LoginModal(props: { onClose?: () => void, onLoginSuccess?: () => void, isOpen?: boolean, hasBackdrop?: boolean }) {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [termsModalOpen, setTermsModalOpen] = useState(false);
    const router = useRouter();
    const { sendOtp, verifyOtpAndLogin, isLoading: authLoading, isAuthenticated } = useAuth();
    const t = useTranslations('login');
    const tCommon = useTranslations('common');
    const errorMessage = useApiErrorMessage();

    // Built per render language so validation messages follow the locale.
    const phoneFormSchema = useMemo(() => z.object({
        phoneNumber: z
            .string()
            .min(11, { message: t('validation.phoneMin') })
            .regex(/^۰۹[۰-۹]{9}$|^09\d{9}$/, { message: t('validation.phoneFormat') }),
    }), [t]);

    const otpFormSchema = useMemo(() => z.object({
        otp: z
            .string()
            .min(4, { message: t('validation.otpMin') })
            .regex(/^[۰-۹\d]+$/, { message: t('validation.otpDigits') }),
    }), [t]);

    type PhoneFormData = z.infer<typeof phoneFormSchema>;
    type OtpFormData = z.infer<typeof otpFormSchema>;

    const {
        register: registerPhone,
        handleSubmit: handlePhoneSubmit,
        formState: { errors: phoneErrors },
    } = useForm<PhoneFormData>({
        resolver: zodResolver(phoneFormSchema),
    });

    // Form handling for OTP
    const {
        register: registerOtp,
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
    } = useForm<OtpFormData>({
        resolver: zodResolver(otpFormSchema),
    });

    // Handle successful verification
    useEffect(() => {
        if (isAuthenticated) {
            if (props.onLoginSuccess) {
                props.onLoginSuccess();
            } else {
                // Check URL for redirect parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirectPath = urlParams.get('redirect');

                if (redirectPath) {
                    // Decode and redirect to the saved route with all query params
                    router.push(decodeURIComponent(redirectPath));
                } else {
                    router.push('/dashboard');
                }
            }
        }
    }, [isAuthenticated, props, router]);

    // Handle phone form submission
    const onPhoneSubmit = async (data: PhoneFormData) => {
        setError(null);
        setPhoneNumber(data.phoneNumber);

        try {
            await sendOtp(data.phoneNumber);
            setSuccess(t('otp.sent'));
            setStep('otp');
        } catch (error) {
            setError(errorMessage(error));
        }
    };

    // Handle OTP form submission
    const onOtpSubmit = async (data: OtpFormData) => {
        setError(null);

        try {
            await verifyOtpAndLogin(
                phoneNumber,
                data.otp,
            );
            // Result handling is done in the useEffect above
        } catch (error) {
            setError(errorMessage(error));
        }
    };

    const handleBackToPhone = () => {
        setStep('phone');
        setSuccess(null);
        setError(null);
    };

    const openTermsModal = () => {
        setTermsModalOpen(true);
    };

    const closeTermsModal = () => {
        setTermsModalOpen(false);
    };

    const handleResendOtp = async () => {
        setError(null);
        try {
            await sendOtp(phoneNumber);
            setSuccess(t('otp.resent'));
        } catch (error) {
            setError(errorMessage(error));
        }
    };

    return (
        <>
            <Modal
                isOpen={props.isOpen ?? true}
                hasBackdrop={props.hasBackdrop ?? false}
                className='px-4 py-6 lg:px-6 bg-white lg:rounded-2xl flex flex-col gap-8 lg:min-w-[768px]'
                onClose={() => { }}
            >
                <div className='flex justify-between items-center'>
                    <div className='font-bold text-lg lg:text-xl text-slate-700'>
                        {t('title')}
                    </div>
                    <Button onClick={() => {
                        if (props.onClose) {
                            props.onClose();
                        } else {
                            router.push('/');
                        }
                    }} variant='outline' className='!px-2' aria-label={tCommon('close')}>
                        <IconX className='size-5' />
                    </Button>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {step === 'phone' ? (
                        <div className='lg:p-6 rounded-2xl lg:bg-white space-y-4'>
                            <div className='font-semibold text-lg text-slate-700'>{t('phone.heading')}</div>
                            <div className='text-sm text-slate-500'>
                                {t('phone.body')}
                            </div>
                            <br />
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            <Input
                                placeholder={t('phone.placeholder')}
                                className='text-left'
                                dir='ltr'
                                {...registerPhone('phoneNumber')}
                                error={phoneErrors.phoneNumber?.message}
                                disabled={authLoading}
                            />
                            <div className='flex items-center gap-2.5'>
                                <Button
                                    variant='secondary'
                                    onClick={() => {
                                        if (props.onClose) {
                                            props.onClose();
                                        } else {
                                            router.push('/')
                                        }
                                    }}
                                >
                                    {tCommon('back')}
                                </Button>
                                <Button
                                    variant='primary'
                                    type='button'
                                    className='grow'
                                    onClick={handlePhoneSubmit(onPhoneSubmit)}
                                    disabled={authLoading}
                                >
                                    {authLoading ? t('checking') : t('phone.submit')}
                                </Button>
                            </div>
                            <br />
                            <div className='text-xs text-blue-600 flex justify-between'>
                                <div className='opacity-20'>{t('phone.help')}</div>

                                <div
                                    className="cursor-pointer"
                                    onClick={openTermsModal}
                                >
                                    {t('phone.terms')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='lg:p-6 rounded-2xl lg:bg-white space-y-4'>
                            <div className='font-semibold text-lg text-slate-700'>{t('otp.heading')}</div>
                            <div className='text-sm text-slate-500'>
                                {t('otp.body', { phone: phoneNumber })}
                            </div>
                            <br />
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {success}
                                </div>
                            )}
                            <Input
                                placeholder={t('otp.placeholder')}
                                className='text-left'
                                dir='ltr'
                                {...registerOtp('otp')}
                                error={otpErrors.otp?.message}
                                disabled={authLoading}
                            />
                            <div className='flex items-center gap-2.5'>
                                <Button
                                    variant='ghost'
                                    onClick={handleBackToPhone}
                                    disabled={authLoading}
                                >
                                    {tCommon('back')}
                                </Button>
                                <Button
                                    variant='secondary'
                                    className='grow'
                                    onClick={handleOtpSubmit(onOtpSubmit)}
                                    disabled={authLoading}
                                >
                                    {authLoading ? t('checking') : t('otp.submit')}
                                </Button>
                            </div>
                            <br />
                            <div className='text-xs text-blue-600 flex justify-between'>
                                <div onClick={handleBackToPhone} className="cursor-pointer">{t('otp.editPhone')}</div>
                                <div
                                    onClick={handleResendOtp}
                                    className={`cursor-pointer ${authLoading ? 'opacity-50' : ''}`}
                                    style={{ pointerEvents: authLoading ? 'none' : 'auto' }}
                                >
                                    {t('otp.resend')}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='lg:flex items-center hidden'>
                        <img src="/images/Login.png" className='w-full h-auto max-h-72 object-contain' alt={t('imageAlt')} />
                    </div>
                </div>
            </Modal>

            <TermsModal
                isOpen={termsModalOpen}
                onClose={closeTermsModal}
            />
        </>
    );
}
