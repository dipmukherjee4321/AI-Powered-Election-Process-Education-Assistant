import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";
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
  title: "ElectAI - Smart Election Assistant",
  description: "Learn about the election process with AI-driven interactive modules.",
};

import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
          Skip to main content
        </a>
        <AuthProvider>
          <ErrorBoundary>
            <Toaster position="top-center" />
            <Navbar />
            <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
