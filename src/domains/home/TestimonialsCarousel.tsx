"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import { cn } from "@/lib/utils";

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play logic
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000); // 6 segundos por slide
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-lg min-h-[320px] flex items-center">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10"
          >
            {/* Columna Avatar */}
            <div className="flex flex-col items-center text-center md:text-left shrink-0 md:w-56">
              <div className="h-24 w-24 rounded-full bg-secondary overflow-hidden border-4 border-background shadow-sm mb-4">
                {current.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.avatar_url} alt={current.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted">
                    <User className="h-10 w-10 opacity-50" />
                  </div>
                )}
              </div>
              <h4 className="font-bold text-lg text-foreground">{current.name}</h4>
              <p className="text-sm text-muted-foreground font-medium">{current.role_or_company}</p>
              
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < current.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
                ))}
              </div>
            </div>

            {/* Columna Contenido */}
            <div className="flex-1 relative pt-2">
              <Quote className="absolute -top-6 -left-4 h-10 w-10 text-primary/10 rotate-180" />
              
              <blockquote className="text-lg md:text-xl italic text-muted-foreground leading-relaxed relative z-10">
                &quot;{current.content}&quot;
              </blockquote>
              
              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {current.relationship === 'client' ? 'Cliente' : current.relationship}
                </span>
                {current.created_at && (
                    <span className="text-xs text-muted-foreground/60">
                        {new Date(current.created_at).toLocaleDateString()}
                    </span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles de Navegación */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="p-2 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/40"
                )}
                aria-label={`Ir a testimonio ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
            className="p-2 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
