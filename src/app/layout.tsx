import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import MainLayout from "@/components/MainLayout";
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
  
  // Template de títulos: las páginas hijas solo pasan su nombre y se autocompleta
  title: {
    template: "%s | TinchoDev",
    default: "TinchoDev | Software Developer",
  },
  
  description: "Portfolio profesional de Martin Fernandez (TinchoDev). Software Developer enfocado en crear aplicaciones web modernas, funcionales y de alto rendimiento.",
  
  keywords: [
    "Software Developer", 
    "Programador", 
    "Desarrollador Fullstack", 
    "React Developer", 
    "Next.js", 
    "JavaScript",
    "TypeScript",
    "TinchoDev", 
  ],
  
  authors: [{ name: "Martin Fernandez", url: "https://tinchodev.com" }],
  creator: "Martin Fernandez",

  // Configuración de Iconos (Favicon SVG)
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    title: "TinchoDev | Software Developer",
    description: "Explorá mis proyectos, mi stack tecnológico y cómo puedo ayudar a construir tu próxima solución digital.",
    siteName: "TinchoDev Portfolio",
    images: [
      {
        url: "/og-image.png", // Asegurate de tener una imagen de 1200x630 en public
        width: 1200,
        height: 630,
        alt: "TinchoDev | Software Developer Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TinchoDev | Software Developer",
    description: "Software Developer apasionado por la tecnología y el desarrollo de productos digitales.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        
        <Toaster richColors position="top-right" />
        
        <MainLayout
          navbar={<Navbar />}
          footer={<Footer />}
        >
          {children}
        </MainLayout>

        {/* Analíticas Umami */}
        <Script 
          src="https://cloud.umami.is/script.js" 
          data-website-id="86e54cb8-ec95-4a27-b256-a8a19324d9c2" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}