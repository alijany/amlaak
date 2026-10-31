'use client';

import {
  uploadProfilePicture,
  useRequestOtpMutation,
  UserType,
  useUpdatePhoneMutation,
  useUpdateProfileMutation,
} from '@/components/auth/auth.api.client';
import ProtectedRoute from '@/components/auth/auth.component.protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { cn } from '@/libs/style/style.util.helpers';
import { Button, Input } from '@/ui/atoms';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBuilding, IconCamera, IconCheck, IconPhone, IconUser, IconUserFilled, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { PhoneChangeModal } from './profile.modal.phone-change';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('dashboard.profile');
  const tCommon = useTranslations('common');

  const { updateProfile, isLoading: isUpdating } = useUpdateProfileMutation();
  const { requestOtp } = useRequestOtpMutation();
  const { updatePhone } = useUpdatePhoneMutation();

  // ---------------------------------------------------------------------------
  // Form setup using react-hook-form + zod (validate simple requirements)
  // ---------------------------------------------------------------------------
  const profileSchema = z.object({
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    lastName: z.string().optional().or(z.literal('')),
    userType: z.nativeEnum(UserType),
    organizationName: z.string().optional().or(z.literal('')),
    organizationRegistrationNumber: z.string().optional().or(z.literal('')),
    organizationNationalId: z.string().optional().or(z.literal('')),
    organizationRepresentative: z.string().optional().or(z.literal('')),
  }).refine((data) => {
    if (data.userType === UserType.LEGAL) {
      return !!(data.organizationName && data.organizationRegistrationNumber);
    }
    return true;
  }, {
    message: t('validation.legalIncomplete'),
    path: ['organizationName'],
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userType: user?.userType || UserType.INDIVIDUAL,
      organizationName: user?.organizationName || '',
      organizationRegistrationNumber: user?.organizationRegistrationNumber || '',
      organizationNationalId: user?.organizationNationalId || '',
      organizationRepresentative: user?.organizationRepresentative || '',
    }
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userType: user?.userType || UserType.INDIVIDUAL,
      organizationName: user?.organizationName || '',
      organizationRegistrationNumber: user?.organizationRegistrationNumber || '',
      organizationNationalId: user?.organizationNationalId || '',
      organizationRepresentative: user?.organizationRepresentative || '',
    });
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        ...(data.userType === UserType.LEGAL ? {
          organizationName: data.organizationName,
          organizationRegistrationNumber: data.organizationRegistrationNumber,
          organizationNationalId: data.organizationNationalId,
          organizationRepresentative: data.organizationRepresentative,
        } : {}),
      });
      await refreshProfile();
      reset(data);
      toast.success(t('saved'));
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(t('saveFailed'));
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userType: user?.userType || UserType.INDIVIDUAL,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      await uploadProfilePicture(file);
      await refreshProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePhoneChange = async (phoneNumber: string, otp: string) => {
    await updatePhone({ phoneNumber, otp });
    await refreshProfile();
  };

  return (
    <ProtectedRoute>
      <DashbaordLayout>
        <div className="space-y-6 grow flex flex-col overflow-auto">
          {/* Main Card */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 lg:p-6 rounded-3xl bg-white shadow-sm border border-slate-100 grow flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 py-4 bg-white z-10 sticky top-0">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                <p className="text-slate-600 mt-1">{t('subtitle')}</p>
              </div>
              <div className="flex gap-2 items-center">
                {isDirty && <Button variant="outline" onClick={handleCancel} size="sm" disabled={isUpdating} type="button">
                  <IconX className="size-4" />
                  {tCommon('cancel')}
                </Button>}
                <Button type="submit" size="sm" disabled={!isDirty || isUpdating}>
                  <IconCheck className="size-4" />
                  {isUpdating ? t('saving') : t('save')}
                </Button>
              </div>
            </div>

            <input type="hidden" {...register('userType')} />

            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={t('pictureAlt')}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconUserFilled className="size-16 text-primary/60" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  aria-label={t('changePicture')}
                  className="absolute bottom-0 start-0 p-3 rounded-2xl bg-white shadow-lg border border-slate-200 hover:bg-slate-50 transition-all group-hover:scale-110"
                >
                  <IconCamera className="size-5 text-primary" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {isUploadingImage && (
                <p className="text-sm text-slate-600 mt-3">{t('uploading')}</p>
              )}
            </div>

            {/* User Type Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                {t('userType')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setValue('userType', UserType.INDIVIDUAL);
                    setValue('organizationName', '');
                    setValue('organizationRegistrationNumber', '');
                    setValue('organizationNationalId', '');
                    setValue('organizationRepresentative', '');
                  }}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2',
                    watch('userType') === UserType.INDIVIDUAL
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <IconUser
                    className={cn(
                      'size-6',
                      watch('userType') === UserType.INDIVIDUAL ? 'text-primary' : 'text-slate-400'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      watch('userType') === UserType.INDIVIDUAL ? 'text-primary' : 'text-slate-600'
                    )}
                  >
                    {t('individual')}
                  </span>
                </button>
                <button
                  onClick={() => setValue('userType', UserType.LEGAL)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2',
                    watch('userType') === UserType.LEGAL
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <IconBuilding
                    className={cn(
                      'size-6',
                      watch('userType') === UserType.LEGAL ? 'text-primary' : 'text-slate-400'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      watch('userType') === UserType.LEGAL ? 'text-primary' : 'text-slate-600'
                    )}
                  >
                    {t('legal')}
                  </span>
                </button>
              </div>
            </div>


            {/* Organization Details for LEGAL users */}
            {watch('userType') === UserType.LEGAL && (
              <div className="space-y-6 mb-8">
                <h2 className="text-lg font-bold text-slate-900">{t('legalInfo')}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('organizationName.label')}
                    </label>
                    <Input
                      placeholder={t('organizationName.placeholder')}
                      {...register('organizationName')}
                      error={errors.organizationName?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('organizationRegistrationNumber.label')}
                    </label>
                    <Input
                      placeholder={t('organizationRegistrationNumber.placeholder')}
                      {...register('organizationRegistrationNumber')}
                      error={errors.organizationRegistrationNumber?.message}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('organizationNationalId.label')}
                    </label>
                    <Input
                      placeholder={t('organizationNationalId.placeholder')}
                      {...register('organizationNationalId')}
                      error={errors.organizationNationalId?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('organizationRepresentative.label')}
                    </label>
                    <Input
                      placeholder={t('organizationRepresentative.placeholder')}
                      {...register('organizationRepresentative')}
                      error={errors.organizationRepresentative?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">{t('personalInfo')}</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('firstName.label')}
                  </label>
                  <Input
                    placeholder={t('firstName.placeholder')}
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('lastName.label')}
                  </label>
                  <Input
                    placeholder={t('lastName.placeholder')}
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('phone.label')}
                </label>
                <div className="flex gap-3">
                  <Input
                    disabled
                    placeholder={t('phone.placeholder')}
                    value={user?.phone || ''}
                    className="flex-1 font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="shrink-0"
                  >
                    <IconPhone className="size-4" />
                    {t('phone.change')}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Phone Change Modal */}
        <PhoneChangeModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          currentPhone={user?.phone || ''}
          onSubmit={handlePhoneChange}
          onSendOtp={async (phoneNumber) => {
            await requestOtp({ phoneNumber });
          }}
        />
      </DashbaordLayout>
    </ProtectedRoute>
  );
}

