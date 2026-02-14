import { MetadataRoute } from "next";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // En sitemap no necesitamos setAll, pero se deja por estructura
        },
      },
    }
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tinchodev.vercel.app";
  const supabase = await createClient();

  // 1. Obtener proyectos visibles de forma segura
  const { data: projects } = await supabase
    .from("projects")
    .select("slug, created_at")
    .eq("visible", true);

  // 2. Rutas estáticas con prioridad
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/testimonials`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // 3. Rutas dinámicas (Proyectos)
  const projectRoutes = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(project.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}