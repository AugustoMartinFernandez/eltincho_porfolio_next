import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AboutClientView from "@/app/admin/about/AboutClientView";

export const dynamic = "force-dynamic";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

export default async function AdminAboutPage() {
  const supabase = await createClient();

  // Fetch de todas las tablas necesarias
  const [aboutRes, expRes, eduRes, techRes] = await Promise.all([
    supabase.from("about_me").select("*").single(),
    supabase.from("experience").select("*").order("start_date", { ascending: false }),
    supabase.from("education").select("*").order("start_date", { ascending: false }),
    supabase.from("technologies").select("*").order("category") // <--- Fetch Techs
  ]);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal, stack tecnológico y trayectoria.</p>
      </div>

      <AboutClientView 
        profile={aboutRes.data}
        experiences={expRes.data || []}
        education={eduRes.data || []}
        technologies={techRes.data || []}
      />
    </div>
  );
}