import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Metadata } from "next";
import TestimonialsWall from "@/domains/testimonials/TestimonialsWall";
import TestimonialsPageClient from "./TestimonialsPageClient"; 

export const metadata: Metadata = {
  title: "Testimonios | Software Developer",
  description: "Experiencias y referencias de clientes y colegas trabajando conmigo en el desarrollo de software.",
};
export const dynamic = "force-dynamic";

// 1. Cliente de Supabase extraído y actualizado a la sintaxis moderna
async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Este catch es intencional. Next.js no permite escribir cookies 
            // desde un Server Component, el middleware lo maneja.
          }
        },
      },
    }
  );
}

export default async function TestimonialsPage() {
  // 2. Instanciamos el cliente
  const supabase = await createClient();

  // 3. Ejecutamos la consulta con la instancia creada
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