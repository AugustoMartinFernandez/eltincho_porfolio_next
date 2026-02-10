"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquarePlus, ShieldCheck, Users, Quote, PenTool } from "lucide-react";
import Button from "@/components/Button";
import TestimonialWizard from "@/domains/testimonials/TestimonialWizard";

export default function TestimonialsPageClient({ 
  children, 
  projects 
}: { 
  children: React.ReactNode; 
  projects: { id: string; title: string }[]; 
}) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 py-12 md:py-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-medium text-muted-foreground mb-4"
          >
            <Users className="h-3.5 w-3.5" /> Comunidad & Feedback
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
          >
            Muro de la <span className="text-primary">Fama</span> 🏆
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Este espacio es para vos. Si hemos trabajado juntos, colaborado en código o simplemente te gusta lo que hago, tu historia me ayuda a crecer.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <Button size="lg" onClick={() => setIsWizardOpen(true)} className="h-14 px-8 rounded-full text-base gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <PenTool className="h-5 w-5" /> Dejar mi Testimonio
            </Button>
          </motion.div>
        </section>

        {/* INSTRUCCIONES / TRUST CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard 
            icon={Quote}
            title="Tu voz importa"
            desc="Ya seas cliente, colega o visitante, tu perspectiva aporta valor real a mi carrera profesional."
          />
          <InfoCard 
            icon={ShieldCheck}
            title="Datos Seguros"
            desc="Tu correo se solicita solo para verificar autenticidad y prevenir spam. Nunca será público."
          />
          <InfoCard 
            icon={MessageSquarePlus}
            title="Proceso Simple"
            desc="Sin registros complejos. Selecciona tu rol, escribe tu experiencia y listo. Toma menos de 2 minutos."
          />
        </section>

        {/* MURO DE TESTIMONIOS (Server Component Inyectado) */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Reseñas Recientes</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          
          {children}
        </section>

      </div>

      {/* Modal Wizard */}
      <TestimonialWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        projects={projects}
      />
    </>
  );
}

function InfoCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-card/50 border border-border/50 p-6 rounded-2xl hover:bg-card hover:border-primary/20 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}