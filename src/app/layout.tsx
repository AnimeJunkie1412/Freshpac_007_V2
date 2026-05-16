import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freshpac B2B Operations Platform",
  description: "Public website, ordering portal, sales portal and engineering portal framework for Freshpac."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
