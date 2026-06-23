import { Footer } from "@/components/layout/layout.component.footer";
import { Navbar } from "@/components/layout/layout.component.navbar";

interface RootLayoutProps {
  children: React.ReactNode;
  navbarTransparent?: boolean;
}

export function RootLayout({ children, navbarTransparent }: RootLayoutProps) {
  return (
    <div>
      <Navbar transparent={navbarTransparent} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
