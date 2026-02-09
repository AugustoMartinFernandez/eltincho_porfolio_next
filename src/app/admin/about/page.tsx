import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AboutForm from "./AboutForm";
import ExperienceList from "./ExperienceList";
import EducationList from "./EducationList";

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

  // Fetch paralelo de todas las tablas
  const [aboutRes, expRes, eduRes] = await Promise.all([
    supabase.from("about_me").select("*").single(),
    supabase.from("experience").select("*").order("start_date", { ascending: false }),
    supabase.from("education").select("*").order("start_date", { ascending: false })
  ]);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal, experiencia y educación.</p>
      </div>

      {/* 1. Formulario Principal (Singleton) */}
      <AboutForm initialData={aboutRes.data} />

      {/* 2. Grid para Experiencia y Educación */}
      <div className="grid lg:grid-cols-2 gap-8">
        <ExperienceList items={expRes.data || []} />
        <EducationList items={eduRes.data || []} />
      </div>
    </div>
  );
}