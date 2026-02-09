import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ProjectList from "./ProjectList";

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

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  
  // Obtenemos los datos ordenados
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, status, visible, created_at, view_count, cover_url")
    .order("created_at", { ascending: false });

  // Renderizamos el componente cliente pasándole los datos iniciales
  return (
    <ProjectList initialProjects={projects || []} />
  );
}