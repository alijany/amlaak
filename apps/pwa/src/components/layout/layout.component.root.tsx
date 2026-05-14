import { Footer } from "@/components/layout/layout.component.footer";
import { Navbar } from "@/components/layout/layout.component.navbar";

interface RootLayoutProps {
  children: React.ReactNode;
  navbarTransparent?: boolean;
}

export function RootLayout({ children, navbarTransparent }: RootLayoutProps) {
  return (
    <div className="overflow-x-hidden">
      <Navbar transparent={navbarTransparent} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
