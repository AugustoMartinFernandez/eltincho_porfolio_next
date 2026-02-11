import Hero from "@/domains/home/Hero";
import { createClient } from "@supabase/supabase-js";
import { AboutMe } from "@/types/about";

export const revalidate = 0;
export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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