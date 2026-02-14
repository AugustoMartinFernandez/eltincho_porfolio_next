import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MessageSquareHeart } from "lucide-react";
import TestimonialsManager from "./TestimonialsManager";
import { Testimonial } from "@/types/testimonial";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Traer TODOS los testimonios, ordenados por fecha
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  // Casteo seguro de tipos
  const testimonials = (data || []) as unknown as Testimonial[];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessageSquareHeart className="h-8 w-8 text-primary" /> 
          Gestión de Testimonios
        </h1>
        <p className="text-muted-foreground">
          Modera las opiniones recibidas. Solo los aprobados serán visibles públicamente.
        </p>
      </div>

      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  );
}