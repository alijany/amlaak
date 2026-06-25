import { City } from '@/libs/city/city.types';
import { LeadDelivery } from '../agency/agency.types';

export interface AdminAgency {
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
  isConfirmed: boolean;
  telegramGroupId?: number;
  leadDelivery?: LeadDelivery;
  owner?: {
    id: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  created_at?: string;
}

/** Backwards-compatible alias used by the confirm/reject flow. */
export type PendingAgency = AdminAgency;

export type AgencyStatusFilter = 'all' | 'pending' | 'active' | 'inactive';

export interface AgencyFilterDto {
  page?: number;
  limit?: number;
  status?: AgencyStatusFilter;
  search?: string;
}

export interface AgenciesListResponse {
  items: AdminAgency[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}
