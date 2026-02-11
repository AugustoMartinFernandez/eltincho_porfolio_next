"use client";

import { motion } from "framer-motion";

export default function HeroVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-70 h-70 -my-5 md:my-0 md:h-auto md:max-w-125 md:aspect-square relative flex items-center justify-center"
      >
        {/* 1. Fondo Atmosférico */}
        <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-transparent to-secondary/20 blur-[60px] rounded-full opacity-60" />

        {/* 2. Estructura Central (Cubo) */}
        <div className="relative w-64 h-64" style={{ perspective: "1000px" }}>
          <motion.div
            className="w-full h-full relative preserve-3d will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border border-primary/40 rounded-3xl bg-primary/5" style={{ transform: "translateZ(40px)" }} />
            <div className="absolute inset-0 border border-primary/40 rounded-3xl bg-primary/5" style={{ transform: "rotateY(90deg) translateZ(40px)" }} />
            <div className="absolute inset-0 border border-primary/40 rounded-3xl bg-primary/5" style={{ transform: "rotateX(90deg) translateZ(40px)" }} />
            
            <motion.div 
              className="absolute inset-20 bg-primary/30 rounded-full blur-xl shadow-[0_0_30px_rgba(var(--primary),0.4)]"
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* 3. Elementos Flotantes */}
        <motion.div
          className="absolute top-[15%] left-[15%] w-12 h-12 border border-secondary/30 bg-card/50 rounded-xl flex items-center justify-center shadow-lg z-20 will-change-transform"
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-2.5 h-2.5 bg-secondary rounded-full opacity-80" />
        </motion.div>

        <motion.div
          className="absolute bottom-[20%] right-[10%] w-16 h-16 border border-primary/30 bg-card/50 rounded-full flex items-center justify-center shadow-xl z-20 will-change-transform"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="w-3 h-3 bg-primary rounded-sm rotate-45 opacity-80" />
        </motion.div>

        <motion.div
          className="absolute top-[10%] right-[25%] w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_currentColor] will-change-transform"
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 4. Líneas de Conexión */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40">
          <motion.line
            x1="30%" y1="30%" x2="50%" y2="50%"
            stroke="currentColor" strokeWidth="1" className="text-secondary" strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.line
            x1="70%" y1="70%" x2="50%" y2="50%"
            stroke="currentColor" strokeWidth="1" className="text-primary"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/3 w-75 md:w-125 h-75 md:h-125 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/3 w-75 md:w-125 h-75 md:h-125 bg-secondary/5 rounded-full blur-3xl" />
    </div>
  );
}
