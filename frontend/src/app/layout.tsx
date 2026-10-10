import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { ChatWidget } from "@/components/chat/ChatWidget"; // <-- 1. Importación agregada
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
  title: "Barbería | Gestión y Reservas",
  description: "Sistema integral de gestión y reservas para barbería.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>

        {/* <-- 2. Widget inyectado flotando sobre toda la app */}
        <ChatWidget />
      </body>
    </html>
  );
}
