import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUDREYTAILOR — 고객 예약현황 캘린더",
  description: "예약은 자동으로, 담당은 버튼 하나로",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
