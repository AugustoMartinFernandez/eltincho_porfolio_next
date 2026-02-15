"use client";

import { useState } from "react";
import { GraduationCap, Calendar, Eye, X, Award } from "lucide-react";
import { Education } from "@/types/about";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

interface EducationSectionProps {
  education: Education[];
}
export default function EducationSection({ education }: EducationSectionProps) {
  const [selectedCert, setSelectedCert] = useState<Education | null>(null);
  // Helper para formatear fechas (ej: "Mar 2024")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Aseguramos compatibilidad con zonas horarias usando T12:00:00
    const date = new Date(
      dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`,
    );
    const formatted = date.toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
    });
    // Capitalizar primera letra
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {education.length > 0 ? (
          education.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors group flex flex-col h-full"
            >
              <div className="mb-4 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  {edu.certificate_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:text-primary"
                      onClick={() => setSelectedCert(edu)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Certificacion
                    </Button>
                  )}
                </div>
                <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                  {edu.degree_title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  {edu.institution_name}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-border/50 text-xs font-mono text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {formatDate(edu.start_date)} —{" "}
                {edu.end_date ? formatDate(edu.end_date) : "Actualidad"}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground italic col-span-full">
            No hay educación registrada.
          </p>
        )}
      </div>
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedCert(null)}
          />
          <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {selectedCert.degree_title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCert.institution_name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCert(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-auto bg-black/5 dark:bg-white/5 flex items-center justify-center min-h-[300px]">
              <img
                src={selectedCert.certificate_url}
                alt={`Certificado de ${selectedCert.degree_title}`}
                className="max-w-full h-auto rounded-lg shadow-sm object-contain max-h-[70vh]"
              />
            </div>
            <div className="p-3 border-t border-border bg-card flex justify-end">
              <Button onClick={() => setSelectedCert(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
