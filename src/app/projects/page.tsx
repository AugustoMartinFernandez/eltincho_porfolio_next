import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Metadata } from "next";
import ProjectCard from "@/domains/projects/ProjectCard";
import { Project } from "@/types/project";
import { AlertCircle } from "lucide-react";

// --- METADATOS PROFESIONALES ---
export const metadata: Metadata = {
  title: "Proyectos y Portafolio | Software Developer",
  description: "Explorá mis proyectos más destacados, soluciones tecnológicas y arquitectura de software.",
};

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
            // Este catch es intencional. Next.js no permite escribir cookies 
            // desde un Server Component, el middleware lo maneja.
          }
        },
      },
    }
  );
}

// Convertimos el componente en async para hacer fetching del lado del servidor (RSC)
export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("portfolio_session")?.value;

  // 0. Instanciamos el cliente moderno
  const supabase = await createClient();
  
  // 1. Llamada real a Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, project_likes(count)') // Traemos el conteo de likes
    .eq('visible', true) // Solo mostrar los visibles
    .order('created_at', { ascending: false }); // Los más nuevos primero

  // 2. Obtener likes del usuario actual (si tiene sesión)
  let userLikedIds: string[] = [];
  if (sessionId) {
    const { data: userLikes } = await supabase
      .from('project_likes')
      .select('project_id')
      .eq('anonymous_id', sessionId);
    
    if (userLikes) {
      userLikedIds = userLikes.map((item: any) => item.project_id);
    }
  }

  // 3. Manejo de errores básico
  if (error) {
    console.error("Error fetching projects:", error);
    return (
      <div className="container mx-auto py-24 text-center text-destructive flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12" />
        <h2 className="text-2xl font-bold">Error cargando proyectos</h2>
        <p>Hubo un problema al conectar con la base de datos.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 space-y-12">
      
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Proyectos Destacados
        </h1>
        <p className="text-muted-foreground text-lg">
          Una colección de soluciones tecnológicas desarrolladas con enfoque en escalabilidad, performance y experiencia de usuario.
        </p>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Validamos que haya proyectos antes de mapear */}
        {projects && projects.length > 0 ? (
          projects.map((project: any) => (
            // Forzamos el tipado porque Supabase devuelve JSONB como 'any' a veces
            <ProjectCard 
              key={project.id} 
              project={project as unknown as Project} 
              initialLikes={project.project_likes?.[0]?.count || 0}
              initialHasLiked={userLikedIds.includes(project.id)}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full py-10 text-center">
            No hay proyectos publicados aún.
          </p>
        )}
      </div>
    </div>
  );
}