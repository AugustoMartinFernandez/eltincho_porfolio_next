import Hero from "@/domains/home/Hero";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AboutMe } from "@/types/about";
import { Metadata } from "next";

export const revalidate = 0;

// --- METADATOS PROFESIONALES ---
// Como en layout.tsx pusimos un template, este título se renderizará automáticamente como "Inicio | TinchoDev"
export const metadata: Metadata = {
  title: "Inicio",
  description: "Portfolio profesional de Martin Fernandez (TinchoDev). Software Developer especializado en desarrollo web y soluciones tecnológicas escalables.",
};

// --- CLIENTE DE SUPABASE (SINTAXIS MODERNA) ---
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

export default async function Home() {
  // Instanciamos el cliente moderno
  const supabase = await createClient();

  // 1. Fetch de datos en paralelo
  const [profileRes] = await Promise.all([
    supabase.from("about_me").select("*").single(),
  ]);

  const profile = profileRes.data as AboutMe | null;

  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero profile={profile} />
    </div>
  );
}