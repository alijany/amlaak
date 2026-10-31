import { User } from "@/app/[locale]/dashboard/users/users.types";

export enum Role {
  ADMIN = 'admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
  USER = 'user',
  GUEST = 'guest',
}

export enum InvitationStatus {
  PENDING = 'pending',
  AWAITING_PROFILE_COMPLETION = 'awaiting_profile_completion',
  ACCEPTED = 'accepted',
}

export type Organization = {
  id: number;
  name: string;
  description?: string;
  owner: User;
  members: RoleType[];
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type UserSummary = {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

export type RoleType = {
  id: number;
  role: Role;
  invitationStatus: InvitationStatus;
  user?: UserSummary; // Optional populated user summary
  organization?: number;
  description?: string;
};

export const RoleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 5,
  [Role.OWNER]: 4,
  [Role.MANAGER]: 3,
  [Role.MEMBER]: 2,
  [Role.USER]: 1,
  [Role.GUEST]: 0,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

export const Roles = Object.values(Role);