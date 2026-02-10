import Hero from "@/domains/home/Hero";
import { createClient } from "@supabase/supabase-js";
import { WorkStatus } from "@/types/about";
import TestimonialsSection from "@/domains/home/TestimonialsSection"; // El wrapper interactivo
import TestimonialsCarousel from "@/domains/home/TestimonialsCarousel"; 
// El carrusel nuevo
import { Testimonial } from "@/types/testimonial";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Fetch de datos en paralelo
  const [profileRes, projectsRes, testimonialsRes] = await Promise.all([
    supabase.from("about_me").select("work_status").single(),
    supabase.from("projects").select("id, title").eq("visible", true), // Para el select del wizard
    supabase.from("testimonials").select("*").eq("is_approved", true).order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(5) // Top 5 (Destacados primero)
  ]);

  const workStatus = profileRes.data?.work_status as WorkStatus | undefined;
  const projectsList = projectsRes.data || [];
  const testimonials = (testimonialsRes.data || []) as unknown as Testimonial[];

  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero workStatus={workStatus} />
      
      {/* Sección de Testimonios con Carrusel */}
      <TestimonialsSection projects={projectsList}>
        <TestimonialsCarousel testimonials={testimonials} />
      </TestimonialsSection>
    </div>
  );
}