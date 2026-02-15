import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import ProjectCard from "@/domains/projects/ProjectCard";
import { Project } from "@/types/project";

export const metadata: Metadata = {
  title: "Proyectos y Portafolio | Software Developer",
  description:
    "Explora mis proyectos mas destacados, soluciones tecnologicas y arquitectura de software.",
};

const PAGE_SIZE = 3;

interface ProjectsPageProps {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
}

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
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorado en Server Components; middleware refresca la sesion.
          }
        },
      },
    },
  );
}

function parsePageParam(rawPage: string | string[] | undefined) {
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsedPage = Number.parseInt(pageValue || "1", 10);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function pageHref(page: number) {
  return page <= 1 ? "/projects" : `/projects?page=${page}`;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const requestedPage = parsePageParam(resolvedSearchParams.page);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("portfolio_session")?.value;
  const supabase = await createClient();

  const { count: totalProjects, error: totalError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("visible", true);

  if (totalError) {
    console.error("Error fetching projects count:", totalError);
    return (
      <div className="container mx-auto py-24 text-center text-destructive flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12" />
        <h2 className="text-2xl font-bold">Error cargando proyectos</h2>
        <p>Hubo un problema al conectar con la base de datos.</p>
      </div>
    );
  }

  const total = totalProjects || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, project_likes(count)")
    .eq("visible", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

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

  let userLikedIds: string[] = [];
  if (sessionId && projects && projects.length > 0) {
    const projectIds = projects.map((project: any) => project.id);
    const { data: userLikes } = await supabase
      .from("project_likes")
      .select("project_id")
      .eq("anonymous_id", sessionId)
      .in("project_id", projectIds);

    if (userLikes) {
      userLikedIds = userLikes.map((item: any) => item.project_id);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 space-y-12">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Proyectos Destacados
        </h1>
        <p className="text-muted-foreground text-lg">
          Una coleccion de soluciones tecnologicas desarrolladas con enfoque en
          escalabilidad, performance y experiencia de usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project: any) => (
            <ProjectCard
              key={project.id}
              project={project as unknown as Project}
              initialLikes={project.project_likes?.[0]?.count || 0}
              initialHasLiked={userLikedIds.includes(project.id)}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full py-10 text-center">
            No hay proyectos publicados aun.
          </p>
        )}
      </div>

      {total > 0 && (
        <nav
          className="flex items-center justify-between gap-4 border-t border-border pt-6"
          aria-label="Paginacion de proyectos"
        >
          <div className="text-sm text-muted-foreground">
            Pagina {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={pageHref(currentPage - 1)}
                rel="prev"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Anterior
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
              >
                Anterior
              </span>
            )}

            {currentPage < totalPages ? (
              <Link
                href={pageHref(currentPage + 1)}
                rel="next"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Siguiente
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
              >
                Siguiente
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
