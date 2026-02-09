import Link from "next/link";
import Image from "next/image"; // Usaremos img normal por ahora si no configuraste dominios en next.config
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Github, Globe, Calendar, Tag } from "lucide-react";
import { Project } from "@/types/project";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import LikeButton from "@/components/LikeButton";

interface ProjectDetailProps {
  project: Project;
  initialLikes: number;
  initialHasLiked: boolean;
}

export default function ProjectDetail({ project, initialLikes, initialHasLiked }: ProjectDetailProps) {
  return (
    <article className="min-h-screen bg-background pb-20">
      
      {/* 1. Hero Header del Proyecto */}
      <div className="relative w-full h-[50vh] min-h-[400px] lg:h-[60vh]">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 bg-muted">
           {/* Nota: En producción usarías <Image> de Next.js configurado */}
           <img 
            src={project.cover_url} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Contenido sobre el Hero */}
        <div className="container relative h-full flex flex-col justify-end pb-12 z-10 mx-auto px-4">
          <Link href="/projects" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Proyectos
          </Link>
          
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              {project.title}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              {project.summary}
            </p>

            {/* Like Button */}
            <div className="pt-2">
              <LikeButton 
                projectId={project.id} 
                initialLikes={initialLikes} 
                initialHasLiked={initialHasLiked} 
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" rel="noreferrer">
                  <Button size="lg" className="gap-2">
                    <Globe className="h-4 w-4" /> Ver Demo en Vivo
                  </Button>
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Github className="h-4 w-4" /> Ver Código
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contenido Principal (Layout 2 columnas) */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
        
        {/* Columna Izquierda: El Markdown (Case Study) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
            <ReactMarkdown>{project.description_md}</ReactMarkdown>
          </div>
        </div>

        {/* Columna Derecha: Metadata Sidebar */}
        <aside className="space-y-8">
          
          {/* Tech Stack */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CodeIcon className="h-5 w-5 text-primary" /> Stack Tecnológico
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <div 
                  key={tech.name} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  {/* Si tuvieras iconos reales, irían aquí */}
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Adicional */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Publicado
              </p>
              <p className="font-medium">
                {new Date(project.published_at || Date.now()).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Compartir</p>
              <div className="flex gap-2">
                 {/* Aquí irían botones de compartir reales */}
                 <Button size="sm" variant="ghost" className="w-full">Copiar Link</Button>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </article>
  );
}

// Icono helper
function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  );
}