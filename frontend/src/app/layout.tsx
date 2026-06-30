import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "CogniMirror | AI Multilingual Voice Journaling Platform",
  description:
    "An AI Cognitive Companion to help you understand your emotions, detect recurring behavioral patterns, and receive personalized cognitive insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#09090B] text-[#FAFAFA] min-h-screen">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
