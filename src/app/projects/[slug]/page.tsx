import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ProjectDetail from "@/domains/projects/ProjectDetail"; 
import { Project } from "@/types/project";
import { Metadata } from "next";
import { cookies } from "next/headers";

function safeError(error: unknown) {
  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2);
  } catch {
    return String(error);
  }
}

// --- CLIENTE DE SUPABASE (SINTAXIS MODERNA) ---
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Este catch es intencional para Server Components
          }
        },
      },
    }
  );
}

// En Next.js 15, params es una Promesa
interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Generar Metadata dinámica para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient(); // Instancia SSR

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
    title: `${project.title} | Software Developer`, // SEO Estandarizado
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
  const { slug } = await params;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("portfolio_session")?.value;
  
  const supabase = await createClient(); // Instancia SSR
  
  // Consulta al proyecto con filtros de visibilidad
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("visible", true)
    .single();

  if (error || !project) {
    console.error(
      `Error fetching project for slug "${slug}":`,
      safeError(error ?? new Error("unknown error")),
    );
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
