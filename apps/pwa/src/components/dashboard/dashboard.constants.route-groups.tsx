'use client';

import { IconDashboard, IconList, IconNotification, IconSpider, IconUser, IconUsers } from "@tabler/icons-react";
import { Role } from "../auth/auth.constants.roles";

export interface RouteItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles: Role[] | false;
}

export interface RouteGroup {
  label: string;
  routes: RouteItem[];
}

export const RouteItems = {
  users: {
    href: "/dashboard/users",
    label: "کاربران",
    roles: [Role.ADMIN],
    icon: <IconUsers className="size-5" />
  },
  notifications: {
    href: "/dashboard/notifications",
    label: "اعلان ها",
    roles: false as const,
    icon: <IconNotification className="size-5" />
  },
  profile: {
    href: "/dashboard/profile",
    label: "حساب کاربری",
    roles: false as const,
    icon: <IconUser className="size-5" />
  },
  dashboard: {
    href: "/dashboard",
    label: "پیشخوان",
    roles: false as const,
    icon: <IconDashboard className="size-5" />
  },
  crawler: {
    href: "/dashboard/crawler",
    label: "مدیریت مرورگرها",
    roles: [Role.ADMIN],
    icon: <IconSpider className="size-5" />
  },
  crawlerAds: {
    href: "/dashboard/crawler/ads",
    label: "آگهی‌های گردآوری‌شده",
    roles: [Role.ADMIN],
    icon: <IconList className="size-5" />
  }
};

// Define routes with role requirements
export const routeGroups: RouteGroup[] = [
  {
    label: "پیشخوان",
    routes: [
      RouteItems.crawler,
      RouteItems.crawlerAds,
      RouteItems.users,
      RouteItems.profile,
      RouteItems.notifications,
    ]
  }
];
