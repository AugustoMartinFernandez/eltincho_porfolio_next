import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Quote, Star, User } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import { cn } from "@/lib/utils";

// Helper para avatar automático si no tienen foto
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default async function TestimonialsWall() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Fetch SOLO aprobados
  const { data: rawTestimonials } = await supabase
    .from("testimonials")
    .select("*, projects(title)") // Join opcional si quieres mostrar "Referente a Proyecto X"
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const testimonials = (rawTestimonials || []) as unknown as Testimonial[];

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-muted/20">
        <p className="text-muted-foreground italic">Aún no hay testimonios públicos. ¡Sé el primero en dejar uno!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((t, i) => (
        <div 
          key={t.id} 
          className="relative bg-card border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
        >
          {/* Icono de cita decorativo */}
          <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10 rotate-180" />

          {/* Header: Avatar + Info */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center shrink-0">
              {t.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.avatar_url} alt={t.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-bold text-muted-foreground text-sm">{getInitials(t.name)}</span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
              <p className="text-xs text-muted-foreground font-medium">
                {t.role_or_company || (t.relationship === 'visitor' ? 'Visitante' : 'Colega')}
              </p>
            </div>
          </div>

          {/* Estrellas */}
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx} 
                className={cn("h-4 w-4", idx < t.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted/20 text-muted")} 
              />
            ))}
          </div>

          {/* Contenido */}
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            &quot;{t.content}&quot;
          </p>

          {/* Badge de Tipo (Opcional, decorativo) */}
          <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
            <span>{t.relationship === 'client' ? 'Cliente Verificado' : t.relationship}</span>
            {t.created_at && <span>{new Date(t.created_at).toLocaleDateString()}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}