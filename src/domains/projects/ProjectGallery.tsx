"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, ImageIcon, ArrowRight, ChevronLeft, ChevronRight, Play, Pause, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectGallery({ images }: { images?: string[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Lógica de navegación
  const navigate = useCallback((direction: number) => {
    if (!selectedId || !images) return;
    const currentIndex = images.indexOf(selectedId);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex + direction + images.length) % images.length;
    setSelectedId(images[newIndex]);
  }, [selectedId, images]);

  // Slideshow automático (5s)
  useEffect(() => {
    if (!isPlaying || !selectedId) return;
    const timer = setInterval(() => navigate(1), 5000);
    return () => clearInterval(timer);
  }, [isPlaying, selectedId, navigate]);

  // Resetear slideshow al cerrar
  useEffect(() => {
    if (!selectedId) setIsPlaying(false);
  }, [selectedId]);

  // Toggle Fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      lightboxRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Sincronizar estado de fullscreen (por si el usuario usa ESC)
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Navegación por teclado
  useEffect(() => {
    if (!selectedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "Escape") setSelectedId(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, images, navigate]); // Re-bind cuando cambia la imagen seleccionada

  if (!images || images.length === 0) return null;

  return (
    <section className="space-y-6 my-12 pt-8 border-t border-border/40">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <ImageIcon className="h-5 w-5 text-primary" /> Galería
        </h3>
        {/* Indicador visual solo para móvil */}
        <div className="flex md:hidden items-center gap-1 text-xs text-muted-foreground animate-pulse">
          <span>Desliza</span> <ArrowRight className="h-3 w-3" />
        </div>
      </div>
      
      {/* CONTAINER HÍBRIDO: Mobile Snap Scroll + Desktop Bento Grid */}
      <div className="
        flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4
        md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:mx-0 md:px-0
      ">
        {images.map((url, index) => {
          // Lógica Bento: La primera imagen destaca en desktop si hay +3 fotos
          const isFeatured = index === 0 && images.length >= 3;
          
          return (
            <motion.div
              key={url + index}
              layoutId={`img-${url}`}
              onClick={() => setSelectedId(url)}
              className={cn(
                "relative cursor-zoom-in rounded-xl overflow-hidden border border-border bg-muted/30 group shadow-sm transition-all hover:shadow-md",
                // Mobile: 85vw para ver la siguiente foto asomando
                "min-w-[85vw] h-64 snap-center",
                // Desktop: Grid asimétrico
                isFeatured ? "md:col-span-2 md:row-span-2 md:h-[500px]" : "md:col-span-1 md:h-60",
                "md:min-w-0"
              )}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`Galería ${index + 1}`} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                loading="lazy"
              />
              
              {/* Overlay de acción (Solo Desktop) */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                 <div className="bg-background/80 backdrop-blur-md text-foreground p-2 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hidden md:block">
                    <Maximize2 className="w-5 h-5" />
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal (Mantenido intacto) */}
      <AnimatePresence>
        {selectedId && (
          <div 
            ref={lightboxRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8" 
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`img-${selectedId}`}
              className="relative w-full max-w-7xl max-h-[90vh] flex items-center justify-center outline-none"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -10000) navigate(1); // Swipe izquierda -> Siguiente
                else if (swipe > 10000) navigate(-1); // Swipe derecha -> Anterior
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedId} 
                alt="Vista completa" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              />

              {/* Controles de Navegación (Desktop) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                    className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 backdrop-blur-md hidden md:block"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(1); }}
                    className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 backdrop-blur-md hidden md:block"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
              
              {/* Controles Inferiores: Paginación + Slideshow */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 overflow-hidden z-20">
                {isPlaying && (
                  <motion.div 
                    key={selectedId}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-0.5 bg-white/50"
                  />
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                  className="text-white/80 hover:text-white transition-colors"
                  title={isPlaying ? "Pausar Slideshow" : "Iniciar Slideshow (5s)"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                
                <div className="h-4 w-px bg-white/20" />
                
                <span className="text-white text-sm font-medium tabular-nums">
                  {images.indexOf(selectedId) + 1} / {images.length}
                </span>
              </div>

              {/* Tira de Miniaturas */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 max-w-[90vw] overflow-x-auto scrollbar-hide bg-black/20 backdrop-blur-sm rounded-xl border border-white/5 z-20">
                {images.map((img, idx) => (
                  <button
                    key={img}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(img); }}
                    className={cn(
                      "relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      selectedId === img 
                        ? "border-primary scale-110 z-10 shadow-lg" 
                        : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Botón Fullscreen */}
              <button 
                onClick={toggleFullscreen}
                className="absolute -top-12 right-12 md:top-4 md:right-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/10 backdrop-blur-md"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              </button>

              <button 
                onClick={() => setSelectedId(null)}
                className="absolute -top-12 right-0 md:top-4 md:right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/10 backdrop-blur-md"
              >
                <X className="h-8 w-8" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
