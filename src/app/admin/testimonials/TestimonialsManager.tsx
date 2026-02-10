"use client";

import { useState, useTransition } from "react";
import { 
  CheckCircle2, 
  Trash2, 
  User, 
  MessageSquareQuote, 
  Clock, 
  Check, 
  X,
  Star
} from "lucide-react";
import Button from "@/components/Button";
import { Testimonial } from "@/types/testimonial";
import { approveTestimonial, deleteTestimonial, toggleFeaturedTestimonial } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Extendemos el tipo localmente para incluir 'featured' y evitar errores de TS
type TestimonialWithFeatured = Testimonial & { featured?: boolean };

export default function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<TestimonialWithFeatured[]>(initialTestimonials);
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending');
  const [isPending, startTransition] = useTransition();

  // Helper para detectar nuevos (últimas 24hs)
  const isRecent = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
  };

  // Filtrar en cliente para rapidez
  const displayedItems = testimonials.filter(t => 
    filter === 'pending' ? !t.is_approved : t.is_approved
  );

  // Acción: Aprobar
  const handleApprove = (id: string) => {
    // Optimistic Update: Lo movemos visualmente a aprobados
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_approved: true } : t));
    toast.success("Testimonio aprobado y publicado.");
    
    startTransition(async () => {
      await approveTestimonial(id);
    });
  };

  // Acción: Eliminar
  const handleDelete = (id: string) => {
    if(!confirm("¿Borrar este testimonio permanentemente?")) return;

    setTestimonials(prev => prev.filter(t => t.id !== id));
    toast.success("Testimonio eliminado.");

    startTransition(async () => {
      await deleteTestimonial(id);
    });
  };

  // Acción: Destacar
  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    // Optimistic Update
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: !currentFeatured } : t));
    
    startTransition(async () => {
      await toggleFeaturedTestimonial(id, currentFeatured);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Pestañas de Navegación */}
      <div className="flex p-1 bg-muted/40 rounded-xl w-fit border border-border">
        <button
          onClick={() => setFilter('pending')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
            filter === 'pending' ? "text-foreground bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>Pendientes</span>
          {testimonials.filter(t => !t.is_approved).length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
              {testimonials.filter(t => !t.is_approved).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            filter === 'approved' ? "text-foreground bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>Publicados</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 rounded-full">
            {testimonials.filter(t => t.is_approved).length}
          </span>
        </button>
      </div>

      {/* Lista de Tarjetas */}
      <div className="grid gap-4">
        {displayedItems.length === 0 ? (
          <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No hay testimonios en esta sección.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedItems.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-card border border-border p-5 rounded-xl shadow-sm hover:border-primary/30 transition-colors flex flex-col md:flex-row gap-6"
              >
                
                {/* Columna Izquierda: Autor */}
                <div className="flex md:flex-col items-center md:items-start gap-3 md:w-48 shrink-0">
                  <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden border border-border flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" />
                    ) : (
                      t.name[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role_or_company}</p>
                    <div className="mt-2 inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-secondary border border-border text-foreground/70">
                      {t.relationship}
                    </div>
                  </div>
                </div>

                {/* Columna Central: Contenido */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(t.created_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    
                    {isRecent(t.created_at) && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse">
                        NUEVO
                      </span>
                    )}

                    <span className="mx-1">•</span>
                    <span className="flex text-yellow-500">
                      {"★".repeat(t.rating)}
                      <span className="text-muted/20">{"★".repeat(5 - t.rating)}</span>
                    </span>
                  </div>
                  
                  <div className="relative pl-4 border-l-2 border-primary/20">
                    <MessageSquareQuote className="absolute -left-3 -top-1 h-6 w-6 text-background fill-muted-foreground/20" />
                    <p className="text-sm text-foreground/90 italic leading-relaxed">
                      {t.content}
                    </p>
                  </div>
                </div>

                {/* Columna Derecha: Acciones */}
                <div className="flex flex-row md:flex-col gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4 justify-end md:justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleFeatured(t.id, t.featured || false)}
                    className={cn(
                      "gap-2 w-full md:w-auto",
                      t.featured ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10" : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                    )}
                    title={t.featured ? "Quitar de destacados" : "Destacar en Home"}
                  >
                    <Star className={cn("h-4 w-4", t.featured ? "fill-current" : "")} /> <span className="md:hidden lg:inline">{t.featured ? "Destacado" : "Destacar"}</span>
                  </Button>

                  {!t.is_approved && (
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(t.id)} 
                      className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full md:w-auto"
                    >
                      <Check className="h-4 w-4" /> <span className="md:hidden lg:inline">Aprobar</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(t.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 w-full md:w-auto"
                  >
                    <Trash2 className="h-4 w-4" /> <span className="md:hidden lg:inline">Eliminar</span>
                  </Button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}