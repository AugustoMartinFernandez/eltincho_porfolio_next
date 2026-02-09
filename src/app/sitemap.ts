import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tinchodev.vercel.app";

  // Cliente Supabase dedicado para sitemap (Server Side)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Obtener proyectos visibles
  const { data: projects } = await supabase
    .from("projects")
    .select("slug, created_at")
    .eq("visible", true);

  // 2. Rutas estáticas
  const routes = ["", "/about", "/projects", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // 3. Rutas dinámicas (Proyectos)
  const projectRoutes = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.created_at,
  }));

  return [...routes, ...projectRoutes];
}
