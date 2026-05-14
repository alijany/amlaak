import { cn } from "@/libs/style/style.util.helpers";
import { IconBrandInstagram } from "@tabler/icons-react";
import Image from "next/image";
import React from "react";

export interface AvatarProps {
  profilePicUrl?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const Avatar: React.FC<AvatarProps> = ({
  profilePicUrl,
  name,
  className,
  iconClassName,
  icon: Icon = IconBrandInstagram,
}) => {
  if (profilePicUrl) {
    return (
      <Image
        src={profilePicUrl}
        alt={name || "Profile"}
        className={cn("rounded-full", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-slate-200 rounded-full flex items-center justify-center",
        className
      )}
    >
      <Icon className={cn("text-slate-500", iconClassName)} />
    </div>
  );
};
