'use client';

import { IconDashboard, IconNotification, IconUser, IconUsers } from "@tabler/icons-react";
import { Role } from "../auth/auth.constants.roles";

/**
 * Label keys are derived from the default catalog, so a route pointing at a
 * message that does not exist fails `pnpm lint` instead of rendering blank.
 */
type Catalog = typeof import('@/messages/fa.json');
export type RouteLabelKey = keyof Catalog['dashboard']['routes'];
export type GroupLabelKey = keyof Catalog['dashboard']['groups'];

export interface RouteItem {
  href: string;
  /** Key under the `dashboard.routes` namespace — resolved by the consumer. */
  labelKey: RouteLabelKey;
  icon?: React.ReactNode;
  roles: Role[] | false;
}

export interface RouteGroup {
  /** Key under the `dashboard.groups` namespace. */
  labelKey: GroupLabelKey;
  routes: RouteItem[];
}

export const RouteItems = {
  users: {
    href: "/dashboard/users",
    labelKey: "users",
    roles: [Role.ADMIN],
    icon: <IconUsers className="size-5" />
  },
  notifications: {
    href: "/dashboard/notifications",
    labelKey: "notifications",
    roles: false as const,
    icon: <IconNotification className="size-5" />
  },
  profile: {
    href: "/dashboard/profile",
    labelKey: "profile",
    roles: false as const,
    icon: <IconUser className="size-5" />
  },
  dashboard: {
    href: "/dashboard",
    labelKey: "dashboard",
    roles: false as const,
    icon: <IconDashboard className="size-5" />
  }
} satisfies Record<string, RouteItem>;

// Define routes with role requirements
export const routeGroups: RouteGroup[] = [
  {
    labelKey: "dashboard",
    routes: [
      RouteItems.users,
      RouteItems.profile,
      RouteItems.notifications,
    ]
  }
];
