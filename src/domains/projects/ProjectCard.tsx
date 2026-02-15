import Link from "next/link";
import { ArrowUpRight, Github, ImageOff } from "lucide-react";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import LikeButton from "@/components/LikeButton";

interface ProjectCardProps {
  project: Project;
  initialLikes?: number;
  initialHasLiked?: boolean;
}

export default function ProjectCard({
  project,
  initialLikes = 0,
  initialHasLiked = false,
}: ProjectCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/50">

      <div className="relative aspect-video w-full overflow-hidden bg-muted group-hover:scale-[1.02] transition-transform duration-500">
        <Link
          href={`/projects/${project.slug}`}
          className="block w-full h-full relative"
        >
          {project.cover_url ? (

            <img
              src={project.cover_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500"
            />
          ) : (

            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/50 gap-2">
              <ImageOff className="h-8 w-8 opacity-50" />
              <span className="font-mono text-xs opacity-70">Sin imagen</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center gap-4 backdrop-blur-[2px]">
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-9 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Ver Detalles
            </span>
          </div>
        </Link>
        <div className="absolute top-3 right-3 z-10">
          <div className="scale-90 shadow-sm backdrop-blur-sm bg-background/80 rounded-full">
            <LikeButton
              projectId={project.id}
              initialLikes={initialLikes}
              initialHasLiked={initialHasLiked}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* Header: Título y Status */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {project.summary}
          </p>
          <p className="text-xs text-primary font-medium md:hidden animate-pulse">
            Toca la imagen para ver detalles
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          {/* Stack (Solo mostramos 3 iconos máx) */}
          <div className="flex -space-x-2">
            {project.tech_stack && project.tech_stack.length > 0 ? (
              <>
                {project.tech_stack.slice(0, 3).map((tech, i) => (
                  <div
                    key={tech.name + i}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border border-background bg-secondary text-xs font-bold text-secondary-foreground ring-2 ring-background uppercase"
                    title={tech.name}
                  >

                    {tech.name[0]}
                  </div>
                ))}
                {project.tech_stack.length > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-background bg-muted text-[10px] font-medium ring-2 ring-background">
                    +{project.tech_stack.length - 3}
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Sin stack
              </span>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="flex gap-1">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                title="Ver Código"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                title="Ver Demo"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const styles: Record<string, string> = {
    in_production: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    launched: "bg-green-500/10 text-green-600 border-green-500/20",
    maintenance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    finished: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  const labels: Record<string, string> = {
    in_production: "En Desarrollo",
    launched: "Lanzado",
    maintenance: "Mantenimiento",
    finished: "Finalizado",
  };

  return (
    <span
      className={cn(
        "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider",
        styles[status] || styles.finished,
      )}
    >
      {labels[status] || status}
    </span>
  );
}
