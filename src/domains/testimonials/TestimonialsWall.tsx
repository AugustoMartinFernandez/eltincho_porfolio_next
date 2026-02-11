import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Quote } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import TestimonialsMarquee from "@/domains/testimonials/TestimonialsMarquee";


export default async function TestimonialsWall() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // CONSULTA SINCRONIZADA: Trae aprobados, priorizando destacados
  const { data: rawTestimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_approved", true)
    .order("featured", { ascending: false }) // Destacados primero
    .order("created_at", { ascending: false }); // Luego los más recientes

  const testimonials = (rawTestimonials || []) as unknown as Testimonial[];

  if (testimonials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border/50 bg-muted/20 text-center">
        <div className="bg-background p-4 rounded-full shadow-sm mb-4">
          <Quote className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium">Aún no hay historias públicas.</p>
        <p className="text-sm text-muted-foreground/60">¡Tu experiencia podría ser la primera aquí!</p>
      </div>
    );
  }

  return <TestimonialsMarquee items={testimonials} />;
}