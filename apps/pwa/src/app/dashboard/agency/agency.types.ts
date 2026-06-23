import { InvitationStatus, Role } from '@/components/auth/auth.constants.roles';

export interface Agency {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  phone?: string;
  logo?: string;
  isActive: boolean;
  isPlatform?: boolean;
  created_at?: string;
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
}

export interface InviteAgencyMemberDto {
  phone: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}
