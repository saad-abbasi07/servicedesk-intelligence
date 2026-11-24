
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServiceDesk Intelligence",
  description: "AI-powered Customer Support & Operations Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
