'use client';

import { useSwrHelper, useSwrMutationHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher, postFetcher, patchFetcher, uploadFileFetcher } from '@/libs/api/api.util.fetcher';
import { useLocale } from 'next-intl';
import { useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { RoleType } from './auth.constants.roles';

export enum UserType {
  INDIVIDUAL = 'individual', // حقیقی
  LEGAL = 'legal', // حقوقی
}

export interface OtpRequest {
  phoneNumber: string;
  /**
   * The locale the edge already negotiated for this visit. The OTP is the one
   * message the backend writes itself, and it has no request to read a language
   * from later — so it is reported here, on the call that triggers it. Not sent
   * as a global header: that would make every response vary by language
   * (`docs/engine/localization.md`).
   */
  locale?: string;
}

export interface OtpVerify {
  phoneNumber: string;
  otp: string;
  deviceId?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
  deviceId?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  isNewUser?: boolean;
  user: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    nationalId: string;
    organizationName?: string;
    organizationRegistrationNumber?: string;
    organizationNationalId?: string;
    organizationRepresentative?: string;
    phone: string;
    profilePicture?: string;
    userType: UserType;
    roles: RoleType[];
    createdAt: string;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  userType?: UserType;
  organizationName?: string;
  organizationRegistrationNumber?: string;
  organizationNationalId?: string;
  organizationRepresentative?: string;
}

export interface UpdatePhoneRequest {
  phoneNumber: string;
  otp: string;
}

export interface OtpSendResponse {
  message: string;
}

export class AuthError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export function useRequestOtpMutation() {
  const locale = useLocale();
  const { submit, data, error, isLoading, reset } = useSwrMutationHelper<
    OtpSendResponse, 
    Error, 
    OtpRequest
  >(useSWRMutation('/auth/otp/send', postFetcher<OtpRequest,OtpSendResponse>));

  // Attached here rather than at each screen: every caller of this hook sends
  // an SMS, and none of them should have to remember what language it is in.
  const requestOtp = useCallback(
    (arg: { phoneNumber: string }) => submit({ ...arg, locale }),
    [submit, locale],
  );
  
  return {
    requestOtp,
    data,
    error,
    isLoading,
    reset
  };
}

export function useVerifyOtpMutation() {
  const { submit, data, error, isLoading, reset } = useSwrMutationHelper<
    AuthResponse, 
    Error, 
    { phoneNumber: string, otp: string, deviceId?: string }
  >(useSWRMutation('/auth/otp/verify', postFetcher<OtpVerify, AuthResponse>));
  
  return {
    verifyOtp: submit,
    data,
    error,
    isLoading,
    reset
  };
}

export function useRefreshTokenMutation() {
  const { submit, data, error, isLoading, reset } = useSwrMutationHelper<
    AuthResponse, 
    Error, 
    { refresh_token: string; deviceId?: string }
  >(useSWRMutation('/auth/refresh', postFetcher<RefreshTokenRequest, AuthResponse>));
  
  return {
    refreshToken: submit,
    data,
    error,
    isLoading,
    reset
  };
}

export function useProfile() {
  const { data, error, isLoading, reset, mutate } = useSwrHelper(
    useSWR<AuthResponse['user'], Error>(
      '/auth/profile',
      fetcher,
      {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }
    )
  );
  
  return {
    data,
    error,
    isLoading,
    mutate,
    reset
  };
}

export function useUpdateProfileMutation() {
  const { submit, data, error, isLoading, reset } = useSwrMutationHelper<
    AuthResponse['user'],
    Error,
    UpdateProfileRequest
  >(useSWRMutation('/users/profile', patchFetcher<UpdateProfileRequest, AuthResponse['user']>));

  return {
    updateProfile: submit,
    data,
    error,
    isLoading,
    reset
  };
}

export function useUpdatePhoneMutation() {
  const { submit, data, error, isLoading, reset } = useSwrMutationHelper<
    AuthResponse['user'],
    Error,
    UpdatePhoneRequest
  >(useSWRMutation('/auth/profile/phone', patchFetcher<UpdatePhoneRequest, AuthResponse['user']>));

  return {
    updatePhone: submit,
    data,
    error,
    isLoading,
    reset
  };
}

export async function uploadProfilePicture(file: File): Promise<{ profilePicture: string }> {
  return uploadFileFetcher<{ profilePicture: string }>('/users/profile/picture', file);
}