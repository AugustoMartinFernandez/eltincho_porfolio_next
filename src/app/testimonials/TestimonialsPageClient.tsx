"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Quote,
  ArrowDown,
  Briefcase,
  Users,
  HeartHandshake,
  PenTool,
} from "lucide-react";
import Button from "@/components/Button";
import TestimonialWizard from "@/domains/testimonials/TestimonialWizard";
import { cn } from "@/lib/utils";

export default function TestimonialsPageClient({
  children,
  projects,
}: {
  children: React.ReactNode;
  projects: { id: string; title: string }[];
}) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [preSelectedRole, setPreSelectedRole] = useState<
    "client" | "colleague" | "visitor" | null
  >(null);

  const handleOpenWizard = (role?: "client" | "colleague" | "visitor") => {
    if (role) setPreSelectedRole(role);
    setIsWizardOpen(true);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background overflow-x-hidden relative">
        <section className="relative pt-16 pb-12 md:pt-32 md:pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140vw] h-[60vw] max-w-[1000px] max-h-[500px] bg-primary/5 rounded-[100%] blur-3xl -z-10 opacity-60" />

          <div className="container px-4 text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-medium text-muted-foreground mb-6">
                <Users className="h-3.5 w-3.5" /> Comunidad & Feedback
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
                El código crea productos.
                <br className="hidden md:block" />
                <span className="text-primary">
                  Las personas construyen confianza.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto text-balance"
            >
              No busco frases bonitas. Busco tu punto de vista. Si en algún
              momento trabajamos juntos, colaboramos o simplemente me conocés,
              tu testimonio puede ayudar a otros a confiar y dar el primer paso.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="pt-8 flex justify-center"
            >
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground/50 animate-bounce">
                <span>Cómo funciona</span>
                <ArrowDown className="h-4 w-4" />
              </div>
            </motion.div>
          </div>
        </section>

        <GuidedPath />

        <section className="py-16 md:py-20 bg-secondary/20 border-y border-border/50">
          <div className="container px-4 max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                ¿Desde dónde escribís?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Elegí la opción que mejor te represente para abrir el formulario
                personalizado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <RoleCard
                icon={Briefcase}
                title="Fui Cliente"
                desc="Contraté tus servicios o trabajamos en un proyecto."
                onClick={() => handleOpenWizard("client")}
              />
              <RoleCard
                icon={Users}
                title="Soy Colega"
                desc="Compartimos equipo, código o universidad."
                onClick={() => handleOpenWizard("colleague")}
              />
              <RoleCard
                icon={HeartHandshake}
                title="Te Conozco"
                desc="Visitante, amigo o seguidor de tu trabajo."
                onClick={() => handleOpenWizard("visitor")}
              />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 container px-4 max-w-6xl mx-auto space-y-10">

          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Lo que dicen otros</h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {children}
        </section>

      </div>

      <TestimonialWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        projects={projects}
        defaultRole={preSelectedRole}
      />
    </>
  );
}

function GuidedPath() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-24 overflow-hidden"
    >
      <div className="container px-4 max-w-4xl mx-auto relative">

        <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

        <motion.div
          className="absolute left-[28px] md:left-1/2 top-0 w-px bg-primary md:-translate-x-1/2 origin-top"
          style={{ height: "100%", scaleY }}
        />

        <div className="space-y-12 md:space-y-32 relative z-10">
          <PathStep
            number={1}
            icon={Sparkles}
            title="No necesitás ser experto"
            desc="No busques palabras perfectas. 3 líneas honestas valen más que 5 párrafos técnicos."
            side="left"
          />
          <PathStep
            number={2}
            icon={ShieldCheck}
            title="Tu privacidad es sagrada"
            desc="Tu email se usa solo para validar que sos una persona real (anti-spam). Nunca se mostrará públicamente."
            side="right"
          />
          <PathStep
            number={3}
            icon={Quote}
            title="Ejemplos reales"
            desc="¿Qué problema resolvimos? ¿Cómo fue la comunicación? Los detalles ayudan a futuros clientes."
            side="left"
          />
        </div>
      </div>
    </section>
  );
}

function PathStep({
  number,
  icon: Icon,
  title,
  desc,
  side,
}: {
  number: number;
  icon: any;
  title: string;
  desc: string;
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "relative flex items-start md:items-center md:justify-between",
        side === "left" ? "flex-row" : "flex-row md:flex-row-reverse",
      )}
    >

      <div className="hidden md:block w-5/12" />

      <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-background border-4 border-primary z-20 shadow-[0_0_0_8px_rgba(var(--background),1)]">
        <Icon className="w-6 h-6 text-primary" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className={cn(
          "ml-6 md:ml-0 flex-1 md:w-5/12 bg-card border border-border p-6 rounded-2xl shadow-sm relative group hover:border-primary/50 transition-colors",
          side === "left" ? "md:mr-auto" : "md:ml-auto",
        )}
      >
        <span className="absolute -top-4 -right-2 text-6xl font-bold text-primary/5 select-none font-mono">
          0{number}
        </span>

        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 relative z-10">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
          {desc}
        </p>
      </motion.div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, desc, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center text-center p-6 md:p-8 rounded-3xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group h-full"
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4 md:mb-6">
        <Icon className="h-7 w-7 md:h-8 md:w-8" />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 flex-1">{desc}</p>

      <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <PenTool className="h-4 w-4" /> Escribir reseña
      </div>
    </motion.button>
  );
}