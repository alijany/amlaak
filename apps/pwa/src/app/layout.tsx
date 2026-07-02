import { AuthProvider } from "@/components/auth/auth.context.provider";
import { ClarityAnalytics } from "@/components/clarity/clarity.component.analytics";
import { ThemeColorPicker } from "@/components/theme/theme.component.color-picker";
import { ThemeProvider } from "@/components/theme/theme.context.provider";
import { brand } from "@/config/brand.config";
import type { Metadata } from "next";
import localFont from 'next/font/local';
import { ToastContainer } from "react-toastify";
import "./globals.css";

const dana = localFont({
  src: [
    {
      path: '../assets/fonts/DanaFaNum-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/DanaFaNum-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/DanaFaNum-DemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/DanaFaNum-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/DanaFaNum-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../assets/fonts/DanaFaNum-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../assets/fonts/DanaFaNum-ExtraBlack.woff2',
      weight: '950',
      style: 'normal',
    }
  ],
  variable: '--font-dana',
});

export const metadata: Metadata = {
  title: brand.meta.title,
  description: brand.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className={`${dana.variable} font-dana text-xs lg:text-base antialiased bg-slate-50`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastContainer position="bottom-center" />
            <ClarityAnalytics />
            <ThemeColorPicker />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
