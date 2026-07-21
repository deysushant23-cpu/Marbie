import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let config;
  try {
    config = await prisma.siteConfig.findFirst();
  } catch (error) {
    console.error("Failed to fetch site config for metadata", error);
  }

  const storefront = config?.storefront as any;
  const keywords = storefront?.seoKeywords || "jewelry, marbie jewels, heritage jewelry";

  return {
    title: "Marbie Jewels | Timeless Elegance",
    description: "Discover our exquisite collection of handcrafted heritage jewelry pieces. Sophistication begins here.",
    keywords: keywords,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
