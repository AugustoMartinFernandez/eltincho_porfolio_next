import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// Corregimos el import para buscarlo en la carpeta correcta de dominios
import ProjectDetail from "@/domains/projects/ProjectDetail"; 
import { Project } from "@/types/project";
import { Metadata } from "next";

// En Next.js 15, params es una Promesa
interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Generar Metadata dinámica para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params antes de usar
  const { slug } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("title, summary, seo_title, seo_description, og_image_url")
    .eq("slug", slug)
    .single();

  if (!project) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  return {
    title: `${project.seo_title || project.title} | TinchoDev`,
    description: project.seo_description || project.summary,
    openGraph: {
      images: project.og_image_url ? [project.og_image_url] : [],
    },
  };
}

// 2. Página Principal
export default async function ProjectDetailPage({ params }: PageProps) {
  // Await params es OBLIGATORIO en Next.js 15
  const { slug } = await params;
  
  // Buscamos el proyecto usando el slug "desempaquetado"
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("visible", true)
    .single();

  // Si hay error o no existe, 404
  if (error || !project) {
    console.error("Error fetching project:", error); // Log para depurar
    notFound();
  }

  // Renderizamos el componente visual
  return <ProjectDetail project={project as unknown as Project} />;
}