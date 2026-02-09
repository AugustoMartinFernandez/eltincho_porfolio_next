import { supabase } from "@/lib/supabaseClient";
import ProjectCard from "@/domains/projects/ProjectCard";
import { Project } from "@/types/project";
import { AlertCircle } from "lucide-react";

// Convertimos el componente en async para hacer fetching del lado del servidor (RSC)
export default async function ProjectsPage() {
  
  // 1. Llamada real a Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('visible', true) // Solo mostrar los visibles
    .order('created_at', { ascending: false }); // Los más nuevos primero

  // 2. Manejo de errores básico
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
          projects.map((project) => (
            // Forzamos el tipado porque Supabase devuelve JSONB como 'any' a veces
            <ProjectCard key={project.id} project={project as unknown as Project} />
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