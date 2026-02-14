import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tinchodev.vercel.app";
  
return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",    // Bloqueamos el panel de control
        "/login",     // Bloqueamos el acceso a login
        "/auth/",     // Bloqueamos rutas de autenticación
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}