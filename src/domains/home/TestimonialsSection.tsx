"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import Button from "@/components/Button";
import TestimonialWizard from "@/domains/testimonials/TestimonialWizard";

// Recibimos los componentes y datos como props para composición
export default function TestimonialsSection({ 
  children, // Aquí vendrá el <TestimonialsWall /> (Server Component)
  projects 
}: { 
  children: React.ReactNode; 
  projects: { id: string; title: string }[]; 
}) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <section className="container mx-auto px-4 py-20 border-t border-border/50">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Lo que dicen sobre mí</h2>
          <p className="text-muted-foreground max-w-lg">
            Testimonios reales de clientes, colegas y visitantes que han interactuado con mi trabajo.
          </p>
        </div>
        
        <Button onClick={() => setIsWizardOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
          <MessageSquarePlus className="h-4 w-4" /> Dejar un Testimonio
        </Button>
      </div>

      {/* Renderizamos el Muro (Server Component hijo) */}
      {children}

      {/* Modal Wizard */}
      <TestimonialWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        projects={projects}
      />
    </section>
  );
}