import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. ACTIVAR STRICT MODE
  // Ayuda a detectar bugs y componentes inseguros durante el desarrollo.
  reactStrictMode: true,

  // 2. CONFIGURACIÓN DE IMÁGENES (CRÍTICO)
  // Necesario para que Next.js acepte y optimice las imágenes desde Supabase.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Tu dominio exacto de Supabase (sacado de tus errores anteriores)
        hostname: 'sqrharuwrzxudsdmnrpc.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', // Solo permite acceso a la carpeta pública de storage
      },
    ],
  },
};

export default nextConfig;