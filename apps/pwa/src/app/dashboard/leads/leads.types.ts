export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CLOSED = 'closed',
}

export const LeadStatusLabels: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'جدید',
  [LeadStatus.CONTACTED]: 'تماس گرفته شد',
  [LeadStatus.CLOSED]: 'بسته شده',
};

export const LeadStatusColors: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-rose-100 text-rose-700 border-rose-200',
  [LeadStatus.CONTACTED]: 'bg-amber-100 text-amber-700 border-amber-200',
  [LeadStatus.CLOSED]: 'bg-green-100 text-green-700 border-green-200',
};

export interface Lead {
  id: number;
  name: string;
  phone: string;
  businessName?: string;
  businessType?: string;
  service?: string;
  businessSize?: string;
  message?: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export type GetLeadsResponse = {
  items: Lead[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};

export interface CreateLeadDto {
  name: string;
  phone: string;
  businessName?: string;
  businessType?: string;
  service?: string;
  businessSize?: string;
  message?: string;
}

export interface LeadFilterDto {
  page?: number;
  limit?: number;
  status?: LeadStatus;
}

export interface UpdateLeadDto {
  status?: LeadStatus;
}
