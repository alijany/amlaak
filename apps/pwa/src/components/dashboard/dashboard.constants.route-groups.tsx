'use client';

import { IconBuildingCommunity, IconDashboard, IconHomePlus, IconList, IconNotification, IconPhoneCall, IconSpider, IconUser, IconUsers } from "@tabler/icons-react";
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
  leads: {
    href: "/dashboard/leads",
    label: "مشتری‌ها",
    roles: [Role.MEMBER, Role.MANAGER, Role.OWNER, Role.ADMIN],
    icon: <IconPhoneCall className="size-5" />
  },
  agency: {
    href: "/dashboard/agency",
    label: "آژانس من",
    roles: [Role.USER, Role.MEMBER, Role.MANAGER, Role.OWNER],
    icon: <IconBuildingCommunity className="size-5" />
  },
  myListings: {
    href: "/dashboard/listings",
    label: "آگهی‌های من",
    roles: [Role.MEMBER, Role.MANAGER, Role.OWNER],
    icon: <IconHomePlus className="size-5" />
  },
  crawler: {
    href: "/dashboard/crawler",
    label: "مدیریت مرورگرها",
    roles: [Role.ADMIN],
    icon: <IconSpider className="size-5" />
  },
  crawlerAds: {
    href: "/dashboard/crawler/ads",
    label: "آگهی‌های",
    roles: [Role.ADMIN],
    icon: <IconList className="size-5" />
  },
  agencies: {
    href: "/dashboard/agencies",
    label: "تأیید آژانس‌ها",
    roles: [Role.ADMIN],
    icon: <IconBuildingCommunity className="size-5" />
  }
};

// Define routes with role requirements
export const routeGroups: RouteGroup[] = [
  {
    label: "پیشخوان",
    routes: [
      RouteItems.crawlerAds,
      RouteItems.myListings,
      RouteItems.leads,
      RouteItems.agency,
      RouteItems.agencies,
      RouteItems.crawler,
      RouteItems.users,
      RouteItems.profile,
      RouteItems.notifications,
    ]
  }
];
