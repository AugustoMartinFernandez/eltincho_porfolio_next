"use client";

import { Technology, TechCategory } from "@/types/about";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Definimos el orden y las etiquetas de las categorías
const CATEGORIES: { id: TechCategory; label: string }[] = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Base de Datos' },
  { id: 'infrastructure', label: 'Infraestructura' },
  { id: 'tool', label: 'Herramientas y Lenguajes' },
];

export default function TechStack({ technologies }: { technologies: Technology[] }) {
  
  // Animación del contenedor principal
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemAnim: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="space-y-16">
      {CATEGORIES.map((cat) => {
        // Filtramos las tecnologías de esta categoría
        const catTechs = technologies.filter((t) => t.category === cat.id);
        
        // Si no hay tecnologías en esta categoría, no renderizamos nada
        if (catTechs.length === 0) return null;

        // Separamos por importancia DENTRO de la categoría
        const primaries = catTechs.filter((t) => t.rank === 'primary');
        const secondaries = catTechs.filter((t) => t.rank !== 'primary');

        return (
          <motion.div 
            key={cat.id}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={container}
            className="space-y-6"
          >
            {/* Título de la Categoría */}
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground/90">
                {cat.label}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
            </div>

            {/* 1. Grid de Tecnologías Principales (Cards Premium) */}
            {primaries.length > 0 && (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0">
                {primaries.map((tech) => (
                  <motion.div
                    key={tech.id}
                    variants={itemAnim}
                    className="group relative flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-gradient-to-b from-card/60 to-card/30 p-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 min-w-[140px] w-[140px] shrink-0 snap-center md:w-auto md:min-w-0"
                  >
                    {/* Icon Container */}
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background/50 p-3 shadow-inner ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:bg-background/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={tech.icon_url} 
                        alt={tech.name} 
                        loading="lazy"
                        className="h-full w-full object-contain drop-shadow-sm transition-all duration-300" 
                      />
                    </div>
                    
                    {/* Name */}
                    <span className="text-sm font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                      {tech.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 2. Lista de Tecnologías Secundarias (Modern Pills) */}
            {secondaries.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {secondaries.map((tech) => (
                  <motion.div
                    key={tech.id}
                    variants={itemAnim}
                    className="group flex items-center gap-2.5 rounded-full border border-border/40 bg-secondary/20 px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/20 hover:bg-secondary/40 hover:text-foreground cursor-default"
                  >
                    <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={tech.icon_url} 
                            alt="" 
                            loading="lazy"
                            className="h-full w-full object-contain opacity-70 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100" 
                        />
                    </div>
                    {tech.name}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}