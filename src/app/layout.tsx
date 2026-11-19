import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "تشريحي | Tashreehi — اكتشف التشريح",
    template: "%s | تشريحي",
  },
  description:
    "منصة عربية مجانية لتعلّم التشريح بنماذج ثلاثية الأبعاد مرخّصة ومحتوى تعليمي موثق.",
  manifest: "/manifest.webmanifest",
  applicationName: "Tashreehi",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "تشريحي" },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b2538",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
