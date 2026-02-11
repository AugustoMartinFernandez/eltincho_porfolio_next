import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// Corregimos el import para buscarlo en la carpeta correcta de dominios
import ProjectDetail from "@/domains/projects/ProjectDetail"; 
import { Project } from "@/types/project";
import { Metadata } from "next";
import { cookies } from "next/headers";

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
    .select("title, summary, cover_url")
    .eq("slug", slug)
    .eq("visible", true)
    .single();

  if (!project) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  return {
    title: `${project.title} | TinchoDev`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.cover_url ? [project.cover_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: project.cover_url ? [project.cover_url] : [],
    },
  };
}

// 2. Página Principal
export default async function ProjectDetailPage({ params }: PageProps) {
  // Await params es OBLIGATORIO en Next.js 15
  const { slug } = await params;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("portfolio_session")?.value;
  
  // Consulta al proyecto con filtros de visibilidad
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("visible", true)
    .single();

  // Mejora en la depuración: Si hay error o no existe, logueamos el detalle técnico
  if (error || !project) {
    console.error("Error fetching project:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      attemptedSlug: slug
    }); 
    notFound();
  }

  // Fetch de Likes
  const { count: likesCount } = await supabase
    .from("project_likes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", project.id);

  let hasLiked = false;
  if (sessionId) {
    const { data: userLike } = await supabase
      .from("project_likes")
      .select("id")
      .eq("project_id", project.id)
      .eq("anonymous_id", sessionId)
      .single();
    hasLiked = !!userLike;
  }

  // Renderizamos el componente visual
  return <ProjectDetail 
    project={project as unknown as Project} 
    initialLikes={likesCount || 0} 
    initialHasLiked={hasLiked} 
  />;
}