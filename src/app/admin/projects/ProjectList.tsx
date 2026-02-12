"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Pencil, 
  Trash2, 
  Search, 
  Calendar,
  BarChart3,
  ExternalLink,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  X
} from "lucide-react";
import { Project } from "@/types/project";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import { deleteProject, bulkDeleteProjects } from "@/lib/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

// Badge de Estado
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrado simple en cliente
  const filteredProjects = initialProjects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE SELECCIÓN ---
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- LÓGICA DE ELIMINACIÓN ---
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proyecto? Esta acción es irreversible.")) return;
    
    setIsDeleting(true);
    const res = await deleteProject(id);
    setIsDeleting(false);

    if (res.success) {
      toast.success("Proyecto eliminado correctamente");
      // Limpiar selección si el borrado estaba seleccionado
      setSelectedIds(prev => prev.filter(i => i !== id));
      router.refresh();
    } else {
      toast.error(res.error || "Error al eliminar proyecto");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} proyectos?`)) return;

    setIsDeleting(true);
    
    // Preparamos el payload con IDs y URLs
    const projectsToDelete = initialProjects
      .filter(p => selectedIds.includes(p.id))
      .map(p => ({ id: p.id, image_url: p.cover_url }));

    const res = await bulkDeleteProjects(projectsToDelete);
    setIsDeleting(false);

    if (res.success) {
      toast.success(`${selectedIds.length} proyectos eliminados`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(res.error || "Error al eliminar proyectos");
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
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
          <div 
            key={project.id} 
            className={cn(
              "group relative bg-card border rounded-xl p-4 shadow-sm transition-all",
              selectedIds.includes(project.id) ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            {/* Checkbox Mobile */}
            <div className="absolute top-4 right-4 z-10">
              <button onClick={() => toggleSelect(project.id)} className="text-muted-foreground hover:text-primary">
                {selectedIds.includes(project.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
              </button>
            </div>

            {/* Header de la Card */}
            <div className="flex justify-between items-start mb-3 pr-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Cuerpo */}
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.cover_url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <h3 className="font-bold text-lg leading-tight">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <StatusBadge status={project.status} />
                </div>
              </div>
            </div>

            {/* Footer: Acciones */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
              <Link href={`/admin/projects/${project.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(project)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* --- VISTA DESKTOP (TABLE) --- */}
      <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4 w-10">
                <button onClick={toggleSelectAll} className="flex items-center hover:text-primary transition-colors">
                  {selectedIds.length === filteredProjects.length && filteredProjects.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4">Proyecto</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Visibilidad</th>
              <th className="px-6 py-4 text-right">Métricas</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProjects.map((project) => (
              <tr 
                key={project.id} 
                className={cn(
                  "hover:bg-muted/30 transition-colors group",
                  selectedIds.includes(project.id) && "bg-primary/5 hover:bg-primary/10"
                )}
              >
                <td className="px-6 py-4">
                  <button onClick={() => toggleSelect(project.id)} className="flex items-center text-muted-foreground hover:text-primary">
                    {selectedIds.includes(project.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-16 rounded-md bg-muted overflow-hidden border border-border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver en vivo">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(project)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      {/* BARRA FLOTANTE DE ACCIONES MASIVAS */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-foreground text-background rounded-full shadow-2xl border border-white/10"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                {selectedIds.length}
              </span>
              <span>seleccionados</span>
            </div>
            
            <div className="h-4 w-px bg-background/20" />
            
            <button 
              onClick={() => setSelectedIds([])}
              className="text-sm text-muted-foreground hover:text-background transition-colors"
            >
              Cancelar
            </button>

            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              isLoading={isDeleting}
              className="h-8 rounded-full px-4 ml-2"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
