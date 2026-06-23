import { cn } from "@/libs/style/style.util.helpers";
import Link from "next/link";

interface MenuItemsProps {
  className?: string;
  itemClassName?: string;
  /** White text for use over the dark hero (transparent navbar). */
  light?: boolean;
  onClose?: () => void;
}

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "خانه" },
  { href: "/listings", label: "آگهی‌ها" },
  { href: "/listings?category=sale", label: "خرید" },
  { href: "/listings?category=rent", label: "رهن و اجاره" },
  { href: "/#faq", label: "سوالات متداول" },
];

export function MenuItems({ className, itemClassName, light, onClose }: MenuItemsProps) {
  const defaultItem = cn(
    "relative w-fit block after:block after:content-[''] after:absolute after:h-[3px] after:bg-primary after:-translate-x-1/2 after:translate-y-1 after:left-1/2 after:w-5 after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center",
    light ? "text-white/90 hover:text-white" : "text-slate-700 hover:text-slate-900",
  );

  return (
    <nav className={cn(className, 'text-sm')}>
      {LINKS.map((link) => (
        <Link
          key={link.label}
          onClick={onClose}
          href={link.href}
          className={itemClassName ?? defaultItem}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
