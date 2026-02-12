"use client";

import { useEffect, useState, useRef } from "react";
import { Quote, Star, BadgeCheck, Calendar } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import { cn } from "@/lib/utils";

interface TestimonialsMarqueeProps {
  items: Testimonial[];
  direction?: "left" | "right";
}

export default function TestimonialsMarquee({ 
  items, 
  direction = "left" 
}: TestimonialsMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Activamos la animación solo después de montar para evitar hidratación incorrecta
  useEffect(() => {
    if (containerRef.current) {
      setStart(true);
    }
  }, []);

  // Lógica de Puntos (Dots) para Mobile
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const cardElement = containerRef.current.children[0]?.children[0] as HTMLElement;
      const cardWidth = cardElement?.clientWidth || 0;
      
      if (cardWidth > 0) {
        const index = Math.round(scrollLeft / (cardWidth + 24)); // 24 = gap-6
        setActiveIndex(index);
      }
    }
  };

  // --- LÓGICA SMART MARQUEE ---
  // Si tenemos pocos items, mejor mostrarlos quietos y centrados.
  const isDesktopMarquee = items.length >= 5;

  // Velocidad Constante: Calculamos duración basada en cantidad de items para evitar mareos.
  // Aprox 6 segundos por item para una lectura cómoda.
  const duration = `${items.length * 6}s`;

  return (
    <div className="flex flex-col gap-6 w-full relative z-20">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "scroller max-w-full",
          // MOBILE: Siempre scroll manual con snap
          "overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth",
          // DESKTOP: Ocultamos scroll si es marquee, sino dejamos natural
          isDesktopMarquee 
            ? "md:overflow-hidden md:snap-none md:[mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]" 
            : "md:overflow-hidden md:snap-none"
        )}
      >
        <div
          className={cn(
            "flex w-max min-w-full gap-6 py-4",
            // Solo animamos si hay suficientes items y ya montó el componente
            (start && isDesktopMarquee) && "md:animate-infinite-scroll",
            // Pausa al hover para permitir lectura tranquila
            isDesktopMarquee && "md:hover:animation-pause",
            // Si son pocos, los centramos en pantalla (Modo Escaparate)
            !isDesktopMarquee && "md:justify-center md:w-full md:flex-wrap"
          )}
          style={{
            "--speed": duration, // Variable CSS dinámica
            animationDirection: direction === "right" ? "reverse" : "normal",
          } as React.CSSProperties}
        >
          {/* LISTA ORIGINAL */}
          {items.map((item, idx) => (
            <MarqueeCard key={`${item.id}-${idx}-origin`} t={item} />
          ))}

          {/* LISTA CLONADA (Solo para el loop infinito en Desktop) */}
          {isDesktopMarquee && (
            <div aria-hidden="true" className="hidden md:flex gap-6">
              {items.map((item, idx) => (
                <MarqueeCard key={`${item.id}-${idx}-clone`} t={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INDICADORES MÓVILES (Dots) */}
      {/* Se ocultan en escritorio si el marquee está activo */}
      <div className={cn(
        "flex justify-center gap-2",
        isDesktopMarquee && "md:hidden"
      )}>
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
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
              "h-1.5 rounded-full transition-all duration-300",
              idx === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/20 hover:bg-primary/40"
            )}
            aria-label={`Ver testimonio ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function MarqueeCard({ t }: { t: Testimonial & { featured?: boolean } }) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isFeatured = t.featured === true;
  
  const roleLabels: Record<string, string> = {
    client: "Cliente",
    colleague: "Colega",
    visitor: "Conocido",
  };

  const label = roleLabels[t.relationship] || "Visitante";

  return (
    <div className={cn(
      "relative shrink-0 rounded-2xl border bg-card p-6 md:p-8 transition-all select-none flex flex-col h-full group snap-center",
      // RESPONSIVE SIZING: 
      // Mobile: 85% del ancho para ver 'peek' del siguiente. Desktop: fijo óptimo.
      "w-[85vw] max-w-[350px] md:w-[400px]", 
      isFeatured 
        ? "border-primary/60 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.2)] bg-gradient-to-b from-card to-primary/[0.02]" 
        : "border-border/60 shadow-sm hover:shadow-md hover:border-primary/30"
    )}>
      
      {/* Badge Destacado */}
      {isFeatured && (
        <div className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-30">
          <Star className="h-2.5 w-2.5 fill-current" />
          TOP
        </div>
      )}
      
      {/* Header Compacto */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full bg-secondary overflow-hidden flex items-center justify-center font-bold text-sm md:text-base border border-border group-hover:border-primary/30 transition-colors">
            {t.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="text-primary/70">{getInitials(t.name)}</span>
            )}
          </div>
          
          <div className="min-w-0">
            <h4 className="font-bold text-sm md:text-base text-foreground truncate flex items-center gap-1.5">
              {t.name}
              {t.relationship === 'client' && <BadgeCheck className="h-3.5 w-3.5 text-primary fill-primary/10 shrink-0" />}
            </h4>
            <p className="text-xs text-muted-foreground truncate font-medium">
              {t.role_or_company || label}
            </p>
          </div>
        </div>
        
        <Quote className="h-6 w-6 text-primary/10 fill-primary/5 shrink-0" />
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={cn("h-3.5 w-3.5", i < t.rating ? "text-primary fill-primary" : "text-muted/30 fill-muted/10")} 
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-sm text-foreground/80 leading-relaxed mb-6 italic line-clamp-4 min-h-[4.5rem]">
        &quot;{t.content}&quot;
      </blockquote>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-4 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", t.relationship === 'client' ? "bg-primary" : "bg-muted-foreground/30")} />
          <span className="uppercase tracking-wider opacity-80">{label}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-60">
          <Calendar className="h-3 w-3" />
          {new Date(t.created_at).toLocaleDateString("es-AR", { month: 'short', year: '2-digit' })}
        </div>
      </div>
    </div>
  );
}