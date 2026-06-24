import { Advertisement } from '../crawler/crawler.types';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadSource {
  PHONE_CALL = 'phone_call',
  TELEGRAM = 'telegram',
  INSTAGRAM = 'instagram',
  WEBSITE = 'website',
  REFERRAL = 'referral',
  OTHER = 'other',
}

export interface LeadAgent {
  id: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LeadPool {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Lead {
  id: number;
  advertisement: Advertisement;
  assignedAgent?: LeadAgent;
  pool?: LeadPool;
  status: LeadStatus;
  source: LeadSource;
  trackingCode?: string;
  contactName?: string;
  contactPhone?: string;
  note?: string;
  lastContactedAt?: string;
  closedAt?: string;
  created_at: string;
}

export interface LeadsResponse {
  items: Lead[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: LeadSource;
  poolId?: number;
  assignedAgentId?: number;
  advertisementId?: number;
  q?: string;
}

export interface LeadStats {
  total: number;
  mine: number;
  byStatus: Record<LeadStatus, number>;
}

export interface LookupResponse {
  advertisement: Advertisement;
  trackingCode: string;
}

export interface CreateLeadDto {
  advertisementId: number;
  source?: LeadSource;
  contactName?: string;
  contactPhone?: string;
  note?: string;
  trackingCode?: string;
  poolId?: number;
  assignedAgentId?: number;
}

export interface UpdateLeadDto {
  status?: LeadStatus;
  source?: LeadSource;
  contactName?: string;
  contactPhone?: string;
  note?: string;
  poolId?: number;
}

export interface CreateLeadPoolDto {
  name: string;
  description?: string;
}
