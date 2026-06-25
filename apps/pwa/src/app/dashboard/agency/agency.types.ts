import { InvitationStatus, Role } from '@/components/auth/auth.constants.roles';
import { City } from '@/libs/city/city.types';

/** How an agency receives a newly assigned lead (admin-configured). */
export type LeadDelivery = 'telegram' | 'sms' | 'disabled';

export interface Agency {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  phone?: string;
  logo?: string;
  banner?: string;
  website?: string;
  city?: City;
  address?: string;
  isActive: boolean;
  isPlatform?: boolean;
  isConfirmed?: boolean;
  /** Admin-only. Telegram group chat id (e.g. -1001234567890). */
  telegramGroupId?: number;
  /** Admin-only. Lead delivery channel. */
  leadDelivery?: LeadDelivery;
  created_at?: string;
}

export interface CreateAgencyDto {
  name: string;
  phone?: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  cityId?: number;
  address?: string;
}

export interface AgencyMember {
  id: number; // role id
  role: Role;
  invitationStatus: InvitationStatus;
  agency?: { id: number; name: string };
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface UpdateAgencyDto {
  name?: string;
  slug?: string;
  description?: string;
  phone?: string;
  logo?: string;
  banner?: string;
  website?: string;
  cityId?: number;
  address?: string;
  /** Admin-only. `null` clears the linked group. */
  telegramGroupId?: number | null;
  /** Admin-only. */
  leadDelivery?: LeadDelivery;
}

export interface InviteAgencyMemberDto {
  phone: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}
