"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin } from "lucide-react";
import Button from "@/components/Button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Columna de Texto */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
              Disponible para trabajar
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter sm:text-5xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Ingeniería de Software <br />
              <span className="text-primary">con Propósito.</span>
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
              Diseño y construyo soluciones digitales robustas, escalables y centradas en el usuario. Especializado en arquitectura Full Stack moderna.
            </p>
          </motion.div>

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 min-w-[200px]"
          >
            <Link href="/projects">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Ver Proyectos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contactame
              </Button>
            </Link>
          </motion.div>

          {/* Redes Sociales (Pequeña barra) */}
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="flex items-center gap-4 text-muted-foreground"
          >
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Github className="h-6 w-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
            <span className="h-4 w-px bg-border mx-2"></span>
            <a href="/cv.pdf" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
              Descargar CV <Download className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        {/* Columna Visual / 3D Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 w-full max-w-[500px] aspect-square relative"
        >
          {/* Este es el placeholder para <model-viewer> */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary rounded-3xl border border-border/50 flex items-center justify-center backdrop-blur-sm overflow-hidden group">
            
            {/* Elemento decorativo animado (Grid) */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--foreground) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>
            
            <div className="text-center p-6 space-y-2 relative z-10">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
                <span className="text-2xl font-bold">3D</span>
              </div>
              <p className="font-mono text-sm text-muted-foreground">
                &lt;model-viewer&gt;<br/>
                Asset Pending...
              </p>
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </motion.div>

      </div>

      {/* Background Decorativo Sutil */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl opacity-50" />
    </section>
  );
}