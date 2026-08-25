import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "vIS — Smarketers Infographic Submitter",
  description: "Inspect, prepare, and organize infographic submissions for off-page distribution.",
  openGraph: {
    title: "vIS — Smarketers Infographic Submitter",
    description: "One infographic. Every right place.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "vIS — Smarketers Infographic Submitter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "vIS — Smarketers Infographic Submitter",
    description: "One infographic. Every right place.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" theme="light" richColors closeButton />
      </body>
    </html>
  );
}
