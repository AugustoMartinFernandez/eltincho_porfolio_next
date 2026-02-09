"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Pencil, 
  Trash2, 
  Search, 
  Calendar,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { Project } from "@/types/project";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

// Componente para las Migas de Pan (Breadcrumbs)
function Breadcrumbs() {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6 animate-in fade-in slide-in-from-left-2">
      <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
      <span className="mx-2">/</span>
      <span className="text-foreground font-medium">Proyectos</span>
    </nav>
  );
}

// Badge de Estado mejorado
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    in_production: { label: "En Desarrollo", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    launched: { label: "Lanzado", color: "bg-green-500/10 text-green-600 border-green-500/20" },
    maintenance: { label: "Mantenimiento", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    finished: { label: "Finalizado", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  };

  const current = config[status] || config.finished;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider", current.color)}>
      {current.label}
    </span>
  );
}

export default function ProjectList({ initialProjects }: { initialProjects: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  // Aquí podrías agregar lógica de paginación real
  const [projects] = useState(initialProjects);

  // Filtrado simple en cliente
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Header con Título y Buscador */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Proyectos</h1>
          <p className="text-muted-foreground">Administra tu portafolio digital.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar proyecto..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/admin/projects/new">
            <Button className="shrink-0">Nuevo</Button>
          </Link>
        </div>
      </div>

      {/* --- VISTA MOBILE (CARDS) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredProjects.map((project) => (
          <div key={project.id} className="group relative bg-card border border-border rounded-xl p-4 shadow-sm active:scale-[0.99] transition-transform">
            
            {/* Header de la Card: Autor/Fecha y Menú */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
              
              {/* Menú de Acciones (Simulado con Hover/Focus para no complicar con dropdowns JS pesados ahora) */}
              <div className="flex gap-2">
                 <Link href={`/admin/projects/${project.id}/edit`}>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                     <Pencil className="h-4 w-4" />
                   </Button>
                 </Link>
              </div>
            </div>

            {/* Cuerpo: Imagen y Título */}
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden border border-border">
                <img src={project.cover_url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <h3 className="font-bold text-lg leading-tight">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <StatusBadge status={project.status} />
                  {project.visible ? (
                    <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Visible
                    </span>
                  ) : (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> Oculto
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer: Métricas y Link */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">{project.view_count || 0}</span> vistas
                </div>
              </div>
              <Link href={`/projects/${project.slug}`} target="_blank" className="text-primary text-sm font-medium flex items-center gap-1">
                Ver en web <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* --- VISTA DESKTOP (TABLE) --- */}
      <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4">Proyecto</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Visibilidad</th>
              <th className="px-6 py-4 text-right">Métricas</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-16 rounded-md bg-muted overflow-hidden border border-border shrink-0">
                      <img src={project.cover_url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{project.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">/{project.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex justify-center">
                  {project.visible ? (
                    <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                      <Eye className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <EyeOff className="h-4 w-4" />
                    </div>
                  )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-muted-foreground">{project.view_count || 0}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No se encontraron proyectos</h3>
          <p className="text-muted-foreground mb-4">Prueba con otra búsqueda o crea uno nuevo.</p>
          <Link href="/admin/projects/new">
            <Button>Crear Proyecto</Button>
          </Link>
        </div>
      )}

      {/* Paginación Visual (Mock) */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredProjects.length} de {projects.length} resultados
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Anterior</Button>
          <Button variant="outline" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}