import { cn } from "@/libs/style/style.util.helpers";
import Link from "next/link";

interface MenuItemsProps {
  className?: string;
  itemClassName?: string;
  onClose?: () => void;
}

const navLinks = [
  { href: '/#services',   label: 'خدمات' },
  { href: '/#education',  label: 'آموزش' },
  { href: '/#why',        label: 'چرا ما' },
  { href: '/#team',      label: 'تیم متخصصان' },
  { href: '/#trust',     label: 'مشتریان' },
  { href: '/blog',       label: 'مقالات' },
  { href: '/#faq',       label: 'سوالات' },
];

const defaultItemClass =
  "relative w-fit block text-[var(--slate-600)] font-medium hover:text-[var(--rose-500)] transition-colors duration-200" +
  " after:block after:content-[''] after:absolute after:h-[2px] after:bg-[var(--rose-500)] after:-translate-x-1/2 after:translate-y-1 after:left-1/2 after:w-5 after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center";

export function MenuItems({ className, itemClassName, onClose }: MenuItemsProps) {
  return (
    <nav className={cn(className, 'text-sm')}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          onClick={onClose}
          href={href}
          className={itemClassName ?? defaultItemClass}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
