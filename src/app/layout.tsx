import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "色彩空间转换程序",
  description: "RGB ↔ CIE 1931 XYZ 双向转换，支持多种色彩空间与白点",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-900">{children}</body>
    </html>
  );
}
