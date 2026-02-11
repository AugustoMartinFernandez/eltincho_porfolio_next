import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import MainLayout from "@/components/MainLayout"; // <--- Importamos el wrapper nuevo
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import RealtimeTracker from "@/components/RealtimeTracker";

// Configuración de fuentes
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Portfolio Ingeniería | TinchoDev",
  description: "Portfolio profesional de ingeniería de software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col min-h-screen">
        <RealtimeTracker />
        {/* Delegamos la lógica visual al MainLayout */}
        <Toaster richColors position="top-right" />
        <MainLayout
          navbar={<Navbar />}
          footer={<Footer />}
        >
          {children}
        </MainLayout>
        <Script 
          src="https://cloud.umami.is/script.js" 
          data-website-id="86e54cb8-ec95-4a27-b256-a8a19324d9c2" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}