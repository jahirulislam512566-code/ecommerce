import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "./client-layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Store - Premium E-commerce Store",
  description: "Your one-stop shop for quality products at unbeatable prices",
  keywords: ["ecommerce", "shop", "products", "online shopping"],
  authors: [{ name: "E-Store" }],
  robots: "index, follow",
  openGraph: {
    title: "E-Store - Premium E-commerce Store",
    description: "Your one-stop shop for quality products at unbeatable prices",
    type: "website",
    locale: "en_US",
    siteName: "E-Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Store - Premium E-commerce Store",
    description: "Your one-stop shop for quality products at unbeatable prices",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}