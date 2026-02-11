"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Briefcase, AlertCircle, Terminal } from "lucide-react";
import Button from "@/components/Button";

export default function NotFound() {
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const startDiagnosis = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 3500);
  };

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-160px)] w-full items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-2xl"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.02, 1],
            rotateZ: [0, 0.5, -0.5, 0]
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative inline-block"
        >
          <h1 className="text-[12rem] md:text-[15rem] font-black text-primary/10 select-none leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="h-24 w-24 text-destructive animate-pulse" />
          </div>
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-2 tracking-tight">
          Punto Final no Encontrado
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto italic">
          &quot;El recurso solicitado no pudo ser localizado en el servidor. Es posible que el enlace esté roto o la ruta haya sido migrada.&quot;
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 group">
              <Home className="h-4 w-4" />
              Retornar al Home
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" className="w-full gap-2">
              <Briefcase className="h-4 w-4" />
              Explorar Mas
            </Button>
          </Link>
        </div>

        {/* Consola de Diagnóstico */}
        <div className="w-full max-w-md mx-auto bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/50" />
              <div className="h-3 w-3 rounded-full bg-amber-500/50" />
              <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">system_terminal.exe</span>
          </div>
          <div className="p-4 font-mono text-xs text-left space-y-1 bg-black/5 dark:bg-black/20">
            <p className="text-primary">{`> STATUS: 404_NOT_FOUND`}</p>
            <p className="text-muted-foreground">{`> ORIGIN_IP: [DETECTED]`}</p>
            {isDiagnosing ? (
              <>
                <p className="text-yellow-500 animate-pulse">{`> RE-ROUTING TO HOME...`}</p>
                <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-primary"
                  />
                </div>
              </>
            ) : (
              <button 
                onClick={startDiagnosis}
                className="flex items-center gap-2 text-primary hover:underline mt-2 cursor-pointer"
              >
                <Terminal className="h-3 w-3" />
                <span>Ejecutar auto-corrección_</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}