import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DialDrill - AI Sales Call Simulator",
  description: "Practice objection handling with AI-powered sales call simulations. Train your team faster with realistic scenarios and instant feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased font-sans">
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
