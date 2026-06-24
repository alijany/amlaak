import { Role } from "@/components/auth/auth.constants.roles";

export enum InvitationStatus {
  PENDING = 'pending',
  AWAITING_PROFILE_COMPLETION = 'awaiting_profile_completion',
  ACCEPTED = 'accepted',
}

export interface User {
  id: number;
  name: string;
  phone: string;
  roles: Role[];
}

export type GetUsersResponse = {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};


export interface AddUserDto {
  // name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  role?: Role;
}

export interface UserFilterDto {
  page?: number;
  limit?: number;
}

export interface InviteAgencyDto {
  agencyName: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  agencyPhone?: string;
}
