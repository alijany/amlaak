import { Link } from "@/i18n/i18n.navigation";
import { cn } from "@/libs/style/style.util.helpers";
import { useTranslations } from "next-intl";

interface MenuItemsProps {
  className?: string;
  itemClassName?: string;
  onClose?: () => void;
}

/**
 * Landing-page navigation. `label` is a message key under `nav` rather than
 * text: the route table is structure, the wording is content, and they live in
 * different files.
 */
const items = [
  { href: '/', label: 'home' },
  { href: '/#how-it-works', label: 'howItWorks' },
  { href: '/#features', label: 'features' },
  { href: '/#sample-output', label: 'sampleOutput' },
  { href: '/#faq', label: 'faq' },
  { href: '/#early-access', label: 'earlyAccess' },
] as const;

const underline =
  "relative w-fit block after:block after:content-[''] after:absolute after:h-[3px] after:bg-primary  after:-translate-x-1/2 after:translate-y-1 after:left-1/2 after:w-5 after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center";

export function MenuItems({ className, itemClassName, onClose }: MenuItemsProps) {
  const t = useTranslations('nav');

  return (
    <nav className={cn(className, 'text-sm')}>
      {items.map((item) => (
        <Link
          key={item.href}
          onClick={onClose}
          href={item.href}
          className={itemClassName ?? underline}
        >
          {t(item.label)}
        </Link>
      ))}
    </nav>
  );
}
