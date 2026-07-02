import { RootLayout } from '@/components/layout/layout.component.root';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
