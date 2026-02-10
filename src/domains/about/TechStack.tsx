"use client";

import { Technology, TechCategory } from "@/types/about";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Cpu, 
  Layout, 
  Database, 
  Server, 
  Wrench, 
  Code2
} from "lucide-react";

// Mapeo de iconos y colores por categoría para darle identidad visual
const CATEGORY_CONFIG: Record<TechCategory, { label: string; icon: any; color: string }> = {
  frontend: { 
    label: 'Frontend Core', 
    icon: Layout, 
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' 
  },
  backend: { 
    label: 'Backend & API', 
    icon: Server, 
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
  },
  database: { 
    label: 'Persistencia de Datos', 
    icon: Database, 
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' 
  },
  infrastructure: { 
    label: 'DevOps & Cloud', 
    icon: Cpu, 
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' 
  },
  tool: { 
    label: 'Herramientas & DX', 
    icon: Wrench, 
    color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' 
  },
};

// Orden específico para el Grid (Frontend primero y destacado)
const ORDERED_CATEGORIES: TechCategory[] = ['frontend', 'backend', 'database', 'infrastructure', 'tool'];

export default function TechStack({ technologies }: { technologies: Technology[] }) {
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {ORDERED_CATEGORIES.map((catKey, index) => {
        const items = technologies.filter((t) => t.category === catKey);
        if (items.length === 0) return null;

        const config = CATEGORY_CONFIG[catKey];
        const Icon = config.icon;
        
        // Frontend ocupa 2 columnas en desktop para destacar
        const isFeatured = catKey === 'frontend';

        // Separamos primarias de secundarias
        const primaries = items.filter(t => t.rank === 'primary');
        const secondaries = items.filter(t => t.rank !== 'primary');

        return (
          <motion.div
            key={catKey}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8 flex flex-col gap-6 hover:border-primary/20 transition-colors group",
              isFeatured ? "md:col-span-2 bg-gradient-to-br from-card/80 to-primary/5" : ""
            )}
          >
            {/* Header de la Tarjeta */}
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2.5 rounded-xl border", config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {config.label}
              </h3>
            </div>

            {/* Content Container */}
            <div className="space-y-6">
              
              {/* PRIMARY: Grid de Iconos Grandes */}
              {primaries.length > 0 && (
                <div className={cn(
                  "grid gap-4", 
                  isFeatured 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" // Frontend grid
                    : "grid-cols-2 sm:grid-cols-3" // Standard grid
                )}>
                  {primaries.map((tech) => (
                    <div 
                      key={tech.id} 
                      className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-background/40 border border-white/5 hover:bg-background/80 hover:scale-105 hover:shadow-lg transition-all duration-300 group/icon"
                    >
                      <div className="relative h-10 w-10 md:h-12 md:w-12">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={tech.icon_url} 
                          alt={tech.name} 
                          className="h-full w-full object-contain drop-shadow-sm transition-transform group-hover/icon:-translate-y-1"
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground group-hover/icon:text-foreground text-center">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SECONDARY: Lista de Pills (Chips) */}
              {secondaries.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 ml-1 opacity-70">
                    Tecnologías Complementarias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {secondaries.map((tech) => (
                      <span 
                        key={tech.id} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/30 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-default"
                      >
                        {/* Icono pequeño opcional */}
                        {tech.icon_url && (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={tech.icon_url} alt="" className="h-3.5 w-3.5 opacity-60 grayscale hover:grayscale-0" />
                        )}
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Decoración de fondo sutil */}
            <div className={cn(
                "absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br opacity-5 blur-3xl pointer-events-none",
                config.color.split(' ')[0].replace('text-', 'from-')
            )} />
          </motion.div>
        );
      })}
    </div>
  );
}
