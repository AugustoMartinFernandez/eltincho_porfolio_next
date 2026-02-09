import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ProjectForm from "../../ProjectForm"; // Reutilizamos el mismo formulario
import { Project } from "@/types/project";

// Helper de cliente servidor
async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name) => cookieStore.get(name)?.value },
    }
  );
}

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Buscamos el proyecto por ID
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  // 2. Si hay error o no existe, 404
  if (error || !project) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar Proyecto</h1>
        <p className="text-muted-foreground">Modifica los detalles, actualiza el estado o cambia las imágenes.</p>
      </div>
      
      {/* 3. Pasamos el proyecto al formulario. Al recibir "project", el formulario entra en modo EDICIÓN */}
      <ProjectForm project={project as Project} />
    </div>
  );
}