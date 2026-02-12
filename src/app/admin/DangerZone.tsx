"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, WifiOff, X } from "lucide-react";
import { resetUmamiMetrics } from "@/lib/actions";
import { toast } from "sonner";
import Button from "@/components/Button";

export default function DangerZone() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Check de conectividad en tiempo real
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleReset = async () => {
    if (inputValue !== "BORRAR") return;
    setLoading(true);
    
    try {
        const res = await resetUmamiMetrics();
        if (res.success) {
            toast.success("Métricas reseteadas correctamente");
            setIsOpen(false);
            setInputValue("");
        } else {
            toast.error(res.error || "Error al resetear");
        }
    } catch (err) {
        toast.error("Error de conexión");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-12 rounded-xl border border-destructive/50 bg-destructive/5 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Zona de Peligro
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Esta acción eliminará permanentemente todas las métricas acumuladas en Umami. 
              Esta acción es irreversible.
            </p>
          </div>

          <Button 
            variant="destructive" 
            onClick={() => setIsOpen(true)}
            disabled={!isOnline}
            className="shrink-0 gap-2 shadow-lg shadow-destructive/20"
          >
            {!isOnline ? <WifiOff className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            {!isOnline ? "Sin Conexión" : "Resetear Métricas"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-destructive rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="p-2 rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">¿Estás seguro?</h3>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Para confirmar el borrado masivo de datos, escribe <span className="font-bold text-foreground">BORRAR</span> en el campo de abajo.
                  </p>
                  
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe BORRAR para confirmar"
                    className="w-full p-3 rounded-lg border border-input bg-background focus:border-destructive focus:ring-1 focus:ring-destructive outline-none transition-all font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReset} 
                    disabled={inputValue !== "BORRAR" || loading}
                    isLoading={loading}
                    className="gap-2"
                  >
                    {loading ? "Procesando..." : "Confirmar Borrado"}
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar Decorativa */}
              {loading && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-destructive"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
