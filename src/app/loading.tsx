"use client";

import { useState, useEffect } from "react";
import { Loader2, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Loading() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }} // Salida suave
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
      >
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {isOnline ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : (
              <WifiOff className="h-12 w-12 text-destructive animate-bounce" />
            )}
            
            {isOnline && (
              <div className="absolute h-16 w-16 rounded-full border-2 border-primary/10 animate-ping" />
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className={cn(
              "text-sm font-medium tracking-widest uppercase transition-colors",
              isOnline ? "text-foreground/70" : "text-destructive"
            )}>
              {isOnline ? "Cargando..." : "Error de Señal"}
            </p>
            
            {/* Barra de progreso técnica */}
            <div className="h-[2px] w-32 bg-muted overflow-hidden rounded-full">
              <motion.div 
                className={cn("h-full", isOnline ? "bg-primary" : "bg-destructive")}
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "linear" 
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}