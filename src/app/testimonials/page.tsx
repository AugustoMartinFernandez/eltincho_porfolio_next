import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Metadata } from "next";
import TestimonialsWall from "@/domains/testimonials/TestimonialsWall";
import TestimonialsPageClient from "./TestimonialsPageClient"; 

export const metadata: Metadata = {
  title: "Testimonios Positivos | TinchoDev",
  description: "Lo que dicen colegas y clientes sobre mi trabajo.",
};
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const cookieStore = await cookies();
  // Cliente de Supabase para Servidor (Lectura)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const [projectsRes] = await Promise.all([
    supabase
    .from("projects")
    .select("id, title")
    .eq("visible", true)
  ]);

  return (
    <div className="min-h-screen bg-background pb-20 pt-10">
      <TestimonialsPageClient projects={projectsRes.data || []}>
        <TestimonialsWall />
      </TestimonialsPageClient>
    </div>
  );
}