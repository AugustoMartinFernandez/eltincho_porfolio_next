import Hero from "@/domains/home/Hero";
import { createClient } from "@supabase/supabase-js";
import { WorkStatus } from "@/types/about";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase.from("about_me").select("work_status").single();
  const workStatus = profile?.work_status as WorkStatus | undefined;

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Sección Hero */}
      <Hero workStatus={workStatus} />
      
      {/* Aquí irán las siguientes secciones: TechStack, FeaturedProjects, etc. */}
      {/* <TechStack /> */}
      {/* <FeaturedProjects /> */}
    </div>
  );
}