import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "TrustLink — 价值互联",
  description: "找到真正对的人。投资人、创作者、人才、品牌方——发布你的 profile，精准对接，直接沟通。",
  keywords: "TrustLink, 价值互联, 投资人, 合伙人, 创作者, 人才对接, 品牌营销, 产品试用",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
