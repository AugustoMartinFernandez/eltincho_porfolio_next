"use client";

import { useEffect, useState, useRef } from "react";
import { Quote, Star, BadgeCheck, Calendar } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import { cn } from "@/lib/utils";

interface TestimonialsMarqueeProps {
  items: Testimonial[];
  speed?: "fast" | "normal" | "slow";
  direction?: "left" | "right";
}

export default function TestimonialsMarquee({ 
  items, 
  speed = "slow", 
  direction = "left" 
}: TestimonialsMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setStart(true);
    }
  }, []);

  // Manejador de Scroll para actualizar los puntos en Mobile
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      // Accedemos al wrapper (children[0]) y luego a la primera card (children[0])
      const cardElement = containerRef.current.children[0]?.children[0] as HTMLElement;
      const cardWidth = cardElement?.clientWidth || 0;
      
      if (cardWidth > 0) {
        // Sumamos la mitad del ancho para que el cambio de punto sea más natural
        const index = Math.round(scrollLeft / (cardWidth + 24)); // 24 es el gap (gap-6)
        setActiveIndex(index);
      }
    }
  };

  const speedClass = {
    fast: "20s",
    normal: "40s",
    slow: "80s",
  };

  // ESTRATEGIA HÍBRIDA:
  // Desktop: Marquee si hay suficientes items.
  // Mobile: Siempre Carrusel Manual (Snap).
  const isDesktopMarquee = items.length >= 5;

  return (
    <div className="flex flex-col gap-6 w-full relative z-20">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "scroller max-w-full",
          // --- MOBILE: MANUAL SNAP ---
          "overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth",
          // --- DESKTOP: MARQUEE ---
          // Si activamos marquee, ocultamos scroll y aplicamos máscara
          isDesktopMarquee 
            ? "md:overflow-hidden md:snap-none md:[mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]" 
            : "md:overflow-hidden md:snap-none"
        )}
      >
        <div
          className={cn(
            "flex w-max min-w-full gap-6 py-4",
            // --- ANIMACIÓN SOLO DESKTOP ---
            (start && isDesktopMarquee) && "md:animate-infinite-scroll",
            // Pausa al hover solo en desktop
            isDesktopMarquee && "md:hover:animation-pause",
            // Si es estático en desktop, centramos
            !isDesktopMarquee && "md:justify-center md:w-full md:flex-wrap"
          )}
          style={{
            "--speed": speedClass[speed],
            animationDirection: direction === "right" ? "reverse" : "normal",
          } as React.CSSProperties}
        >
          {/* LISTA PRINCIPAL (Visible en Mobile y Desktop) */}
          {items.map((item, idx) => (
            <MarqueeCard key={`${item.id}-${idx}-origin`} t={item} />
          ))}

          {/* LISTA DUPLICADA (Solo visible en Desktop para el Loop Infinito) */}
          {/* En mobile la ocultamos para no confundir el scroll manual y los puntos */}
          <div 
            aria-hidden="true" 
            className={cn(
              "flex gap-6",
              "hidden", // Oculto por defecto (Mobile)
              isDesktopMarquee && "md:flex" // Visible solo en Desktop Marquee
            )}
          >
            {items.map((item, idx) => (
              <MarqueeCard key={`${item.id}-${idx}-clone`} t={item} />
            ))}
          </div>
        </div>
      </div>

      {/* --- INDICADORES (DOTS) --- */}
      {/* Solo visibles en Mobile o cuando no hay marquee en desktop */}
      <div className={cn(
        "flex justify-center gap-2",
        isDesktopMarquee && "md:hidden" // Si hay marquee, ocultamos los puntos en desktop
      )}>
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              // Scroll suave al hacer click en el punto
              if (containerRef.current) {
                const wrapper = containerRef.current.children[0];
                const card = wrapper?.children[0] as HTMLElement;
                const cardWidth = card?.clientWidth || 0;
                if (cardWidth > 0) {
                   containerRef.current.scrollTo({ left: idx * (cardWidth + 24), behavior: 'smooth' });
                }
              }
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === activeIndex ? "w-6 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
            )}
            aria-label={`Ir al testimonio ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function MarqueeCard({ t }: { t: Testimonial & { featured?: boolean } }) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isFeatured = t.featured === true;
  
  // MAPEO DE ROLES (Traducción BD -> Vista)
  const roleLabels: Record<string, string> = {
    client: "Cliente",
    colleague: "Colega",
    visitor: "Conocido", // Mucho más personal que "Comunidad"
  };

  const label = roleLabels[t.relationship] || "Visitante";

  return (
    <div className={cn(
      "relative shrink-0 rounded-2xl border bg-card p-8 transition-all select-none flex flex-col h-full group",
      "w-[85vw] max-w-[380px] md:w-[450px] md:max-w-none",
      // Estilo condicional para destacados
      isFeatured 
        ? "border-primary/60 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.2)] bg-gradient-to-b from-card to-primary/[0.02]" 
        : "border-border/60 shadow-md hover:shadow-lg hover:border-primary/40"
    )}>
      
      {/* Badge Flotante para Destacados */}
      {isFeatured && (
        <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-30 animate-pulse">
          <Star className="h-3 w-3 fill-current" />
          DESTACADO
        </div>
      )}
      
      {/* HEADER: Avatar e Información */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar con anillo sutil */}
          <div className="h-14 w-14 shrink-0 rounded-full bg-secondary overflow-hidden flex items-center justify-center font-bold text-lg border-2 border-background ring-1 ring-border/30 group-hover:ring-primary/30 transition-all">
            {t.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="text-primary/80">{getInitials(t.name)}</span>
            )}
          </div>
          
          <div className="min-w-0">
            <h4 className="font-bold text-base text-foreground truncate flex items-center gap-2">
              {t.name}
              {t.relationship === 'client' && <BadgeCheck className="h-4 w-4 text-primary fill-primary/10 shrink-0" />}
            </h4>
            <p className="text-sm text-muted-foreground truncate font-medium">
              {t.role_or_company || label}
            </p>
          </div>
        </div>
        
        {/* Icono de Cita (Sutil y elegante) */}
        <Quote className="h-8 w-8 text-primary/10 fill-primary/5 shrink-0" />
      </div>

      {/* RATING (Estrellas Azules) */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            // Uso del color PRIMARY (Azul) para las estrellas
            className={cn("h-5 w-5", i < t.rating ? "text-primary fill-primary" : "text-muted/30 fill-muted/10")} 
          />
        ))}
      </div>

      {/* CONTENT */}
      <blockquote className="text-base text-foreground/90 leading-relaxed mb-8 italic line-clamp-4 min-h-[5.5rem] relative z-10 font-normal">
        &quot;{t.content}&quot;
      </blockquote>

      {/* FOOTER (Limpio, sin borde superior) */}
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground/80">
          <span className={cn("h-1.5 w-1.5 rounded-full", t.relationship === 'client' ? "bg-primary" : "bg-muted-foreground/50")} />
          <span className="uppercase tracking-wider text-[10px]">
            {label}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 opacity-80 font-mono text-[10px]">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(t.created_at).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit", // Año corto (26) es más moderno
            hour: "2-digit",
            minute: "2-digit"
          })} hs
        </div>
      </div>
    </div>
  );
}