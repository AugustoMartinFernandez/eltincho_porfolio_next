"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Lock,
  AlertTriangle,
  ShieldAlert,
  Skull,
  Terminal as TerminalIcon,
  Monitor,
  Wifi,
  Battery,
  Cpu,
  HardDrive,
  Search,
  User,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

// --- CONFIGURACIÓN DE SEGURIDAD ---
const MY_EMAIL = "mff061022@gmail.com";

// Componente de Fondo Animado
const BackgroundElements = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <svg className="absolute w-full h-full opacity-[0.03]">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Solo renderizamos las partículas en el cliente para evitar errores de hidratación */}
      {isMounted && [...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
          animate={{
            y: [null, Math.random() * -100 - 50 + "px"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIntruder, setIsIntruder] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(10); // Actualizado a 10 segundos

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Auto-scroll para la terminal
  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLines]);

  // Función para disparar sonidos (Debés tener estos archivos en /public/sounds/)
  const playSound = (type: "typing" | "alert") => {
    const audio = new Audio(
      type === "typing" ? "/sounds/typing.mp3" : "/sounds/alert.mp3",
    );
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  // Efecto Modo Hacker: Kali Linux Style
  useEffect(() => {
    if (isIntruder) {
      playSound("alert");
      const steps = [
        "kali@tinchodev:~$ sudo nmap -sS stealth_scan",
        "[sudo] password for kali: **********",
        "ANALIZANDO CABECERAS DE RED...",
        `IP_ORIGEN: ${Math.floor(Math.random() * 255)}.168.1.42`,
        "SISTEMA OPERATIVO DETECTADO: INTRUSO",
        "RASTREANDO DIRECCIÓN MAC...",
        "DISPOSITIVO IDENTIFICADO: UBICACIÓN EN CURSO",
        "BLOQUEANDO ACCESO A LA BASE DE DATOS...",
        "GENERANDO REPORTE DE INTRUSIÓN...",
        "ENVIANDO LOGS DE ACTIVIDAD A AUTORIDADES...",
        "CONEXIÓN INTERCEPTADA. PROTOCOLO DE EXPULSIÓN ACTIVO.",
      ];

      let delay = 0;
      steps.forEach((line, index) => {
        delay += Math.random() * 600 + 400;
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, line]);
          setProgress(((index + 1) / steps.length) * 100);
          playSound("typing");
        }, delay);
      });
    }
  }, [isIntruder]);

  // Cronómetro de redirección (10 segundos)
  useEffect(() => {
    if (progress === 100 && countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      router.push("/");
    }
  }, [progress, countdown, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (email.toLowerCase() !== MY_EMAIL.toLowerCase()) {
      setTimeout(() => {
        setLoading(false);
        setIsIntruder(true);
      }, 1500);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Fallo de autenticación. Verifique sus credenciales.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  if (isIntruder) {
    return (
      <div className="fixed inset-0 z-100 bg-[#0f0f0f] text-[#33ff33] font-mono flex flex-col overflow-hidden">
        {/* Barra Superior Kali */}
        <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-2 md:px-4 text-[10px] md:text-[11px] text-gray-400">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 text-blue-400">
              <Monitor className="h-3 w-3" />
              <span className="hidden xs:inline">Kali Desktop</span>
            </div>
            <span>Applications</span>
            <span className="hidden sm:inline">Places</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="flex-1 flex relative flex-col md:flex-row">
          {/* Sidebar / Dock (Oculto en móvil para más espacio) */}
          <div className="hidden md:flex w-12 bg-black/40 border-r border-white/5 flex-col items-center py-4 gap-6">
            <Search className="h-5 w-5 text-gray-500" />
            <Cpu className="h-5 w-5 text-blue-500" />
            <HardDrive className="h-5 w-5 text-gray-500" />
            <User className="h-5 w-5 text-gray-500" />
          </div>

          {/* Terminal Window Central */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-3xl h-full max-h-[600px] md:h-auto rounded-lg bg-[#0c0c0c] border border-[#333] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Barra de Título Ventana */}
              <div className="h-8 bg-[#2d2d2d] flex items-center justify-between px-3 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] md:text-xs text-gray-400 font-sans">
                  kali@tinchodev: ~
                </span>
                <div className="w-12" />
              </div>

              {/* Contenido Terminal */}
              <div className="p-4 flex-1 overflow-y-auto text-xs sm:text-sm md:text-base scrollbar-hide">
                <div className="flex items-center gap-2 mb-4 text-red-500 border-b border-red-900/30 pb-2">
                  <ShieldAlert className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
                  <span className="font-bold uppercase tracking-tighter text-[10px] md:text-sm">
                    Acceso Denegado - Sistema bajo vigilancia
                  </span>
                </div>

                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "mb-1 break-all",
                      line.startsWith(">")
                        ? "text-blue-400"
                        : line.includes("¡ACCESO")
                          ? "text-red-500 font-bold"
                          : "text-gray-300",
                    )}
                  >
                    {line}
                  </motion.div>
                ))}

                {progress < 100 && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {progress === 100 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 text-center p-4 md:p-6 border border-red-900/50 bg-red-950/20 rounded"
                  >
                    <Skull className="h-10 w-10 md:h-12 md:w-12 mx-auto text-red-600 mb-4" />

                    <h3 className="text-white font-bold mb-2 uppercase text-xs md:text-base tracking-tighter">
                      Protocolo de Acción Legal Iniciado
                    </h3>

                    <p className="text-gray-300 text-[10px] md:text-sm mb-4 leading-relaxed">
                      Se ha detectado un intento de acceso por parte de un
                      usuario no identificado. Los registros de actividad,
                      dirección IP y metadatos de su dispositivo
                      <span className="text-red-500 font-bold">
                        {" "}
                        han sido transmitidos con éxito a TinchoDev
                      </span>
                      .
                      <br />
                      <br />
                      Este sistema es privado; se iniciarán acciones legales por
                      intento de intrusión y vulneración informática.
                    </p>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-red-500 uppercase font-bold animate-pulse">
                        Expulsión en curso:
                      </span>
                      <div className="text-3xl md:text-4xl font-black text-red-600">
                        {countdown}s
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* Referencia para auto-scroll */}
                <div ref={terminalEndRef} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
      <BackgroundElements />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-primary/10 p-4 text-primary"
            >
              <Lock className="h-8 w-8" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Admin Dev
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Entrada restringida. Autorización de Nivel 4 requerida.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                htmlFor="email"
              >
                Identificador de Usuario
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="usuario@tinchodev.com"
                required
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                htmlFor="password"
              >
                Clave de Acceso
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-3 border border-destructive/20"
              >
                <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
              isLoading={loading}
            >
              Ejecutar Autenticación
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
            >
              <Home className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
              Abortar y volver a Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
