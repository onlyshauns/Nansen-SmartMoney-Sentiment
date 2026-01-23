import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nansen SmartMoney Sentiment Tracker",
  description: "Track smart money sentiment on Nansen and Hyperliquid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
