import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Bebas_Neue } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./SmoothScroll";
import CustomCursor from "./CustomCursor";

const inter = Inter({
  variable: "--font-inter-next",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-next",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas-next",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F5F2EB",
};

export const metadata: Metadata = {
  title: "Arsarena Arts Club",
  description: "Art Spirit of St. Peter's Engineering College.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
