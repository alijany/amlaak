export enum Role {
  ADMIN = 'admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
  USER = 'user',
  GUEST = 'guest',
}

export const RoleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'ادمین',
  [Role.OWNER]: 'سازمان',
  [Role.MANAGER]: 'مدیر',
  [Role.MEMBER]: 'عضو',
  [Role.USER]: 'کاربر',
  [Role.GUEST]: 'مهمان',
};

// Role hierarchy for permission checks
export const RoleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 5,
  [Role.OWNER]: 4,
  [Role.MANAGER]: 3,
  [Role.MEMBER]: 2,
  [Role.USER]: 1,
  [Role.GUEST]: 0,
};

export const Roles = Object.values(Role);
