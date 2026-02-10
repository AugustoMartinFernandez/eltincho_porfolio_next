import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, 
  Download, 
  Github, 
  Linkedin, 
  Mail, 
  Terminal, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Building2,
  Instagram,
  Facebook,
  ArrowUpRight,
  MessageSquare,
  Cpu
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import EducationSection from "@/domains/about/EducationSection";
import TechStack from "@/domains/about/TechStack";

// --- CONFIGURACIÓN DE RENDIMIENTO ---
export const dynamic = "force-dynamic"; // Deshabilita caché estático
export const revalidate = 0; // Revalidación inmediata

export const metadata: Metadata = {
  title: "Sobre Mí | Ingeniero de Software",
  description: "Trayectoria profesional, experiencia técnica y educación.",
};

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default async function AboutPage() {
  const supabase = await createClient();

  // 1. Fetch Paralelo Optimizado
  const [aboutRes, expRes, eduRes, techRes] = await Promise.all([
    supabase.from("about_me").select("*").single(),
    supabase.from("experience").select("*").eq("visible", true).order("start_date", { ascending: false }),
    supabase.from("education").select("*").eq("visible", true).order("start_date", { ascending: false }),
    supabase.from("technologies").select("*").eq("visible", true).order("rank")
  ]);

  const profile = aboutRes.data;
  
  // Estado vacío defensivo
  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Perfil no configurado</h1>
        <p className="text-muted-foreground mt-2">Accede al panel de administración para inicializar los datos.</p>
      </div>
    );
  }

  const experiences = expRes.data || [];
  const education = eduRes.data || [];
  const technologies = techRes.data || [];
  const social = profile.social_links || {};

  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-500">
      
      {/* HEADER HERO (Mobile First: Columna | Desktop: Grid Asimétrico) */}
      <div className="container mx-auto px-4 py-12 lg:py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* --- COLUMNA IZQUIERDA: PERFIL STICKY --- */}
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-8">
              
              {/* Tarjeta de Identidad */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                {/* Indicador de Estado */}

                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-background shadow-xl overflow-hidden bg-muted">
                      {profile.profile_image_url ? (
                        <img 
                          src={profile.profile_image_url} 
                          alt={profile.full_name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-secondary text-4xl">👤</div>
                      )}
                    </div>
                  </div>

                  {profile.work_status !== 'closed' && (
                    <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105 select-none cursor-default bg-background/50 backdrop-blur-sm
                      data-[status=open]:bg-emerald-500/10 data-[status=open]:text-emerald-700 data-[status=open]:dark:text-emerald-400 data-[status=open]:border-emerald-500/20
                      data-[status=hiring]:bg-purple-500/10 data-[status=hiring]:text-purple-700 data-[status=hiring]:dark:text-purple-400 data-[status=hiring]:border-purple-500/20"
                      data-status={profile.work_status === 'open_to_work' ? 'open' : 'hiring'}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={cn(
                          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                          profile.work_status === 'open_to_work' ? "bg-emerald-400" : "bg-purple-400"
                        )}></span>
                        <span className={cn(
                          "relative inline-flex rounded-full h-2.5 w-2.5",
                          profile.work_status === 'open_to_work' ? "bg-emerald-500" : "bg-purple-500"
                        )}></span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {profile.work_status === 'open_to_work' ? 'Open to Work' : 'Hiring Talent'}
                      </span>
                    </div>
                  )}
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.full_name}</h1>
                  <p className="text-lg text-primary font-medium mt-1 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    {profile.title}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location || "Remoto"}
                    </span>
                  </div>

                  {/* Redes Sociales */}
                  <div className="mt-6 flex gap-2">
                    {social.linkedin && <SocialLink href={social.linkedin} icon={Linkedin} />}
                    {social.github && <SocialLink href={social.github} icon={Github} />}
                    {social.email && <SocialLink href={`mailto:${social.email}`} icon={Mail} />}
                    {social.instagram && <SocialLink href={social.instagram} icon={Instagram} />}
                    {social.facebook && <SocialLink href={social.facebook} icon={Facebook} />}
                    {social.tiktok && <SocialLink href={social.tiktok} icon={TiktokIcon} />}
                  </div>

                  {/* Descarga CV */}
                  {profile.cv_url && (
                    <div className="mt-8 w-full pt-6 border-t border-border">
                      <a href={profile.cv_url} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full gap-2 shadow-md" size="lg">
                          <Download className="h-4 w-4" /> Descargar CV
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* --- COLUMNA DERECHA: CONTENIDO --- */}
          <main className="lg:col-span-8 xl:col-span-8 space-y-16">
            
            {/* 1. BIO */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border pb-2">Sobre mí</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed bg-card/30 p-6 rounded-2xl border border-border/50">
                <ReactMarkdown>{profile.short_bio_md || "..."}</ReactMarkdown>
              </div>
            </section>

            {/* 2. EXPERIENCIA (Timeline Vertical) */}
            {profile.show_experience && (
              <section className="space-y-8">
                <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Experiencia
                </h2>

                <div className="relative border-l-2 border-border/60 ml-3 md:ml-4 space-y-12 pb-2">
                  {experiences.length > 0 ? experiences.map((exp: any) => (
                    <div key={exp.id} className="relative pl-8 md:pl-10 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-1 h-[18px] w-[18px] rounded-full border-4 border-background bg-muted-foreground/30 group-hover:bg-primary transition-colors z-10" />
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {exp.role_title}
                          </h3>
                          <span className="text-xs font-mono font-medium text-muted-foreground bg-secondary px-2 py-1 rounded w-fit uppercase">
                            {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : "Actualidad"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-base font-semibold text-foreground/80">
                          <Building2 className="h-4 w-4 opacity-70" />
                          {exp.company_name}
                        </div>

                        {exp.description_md && (
                          <div className="mt-2 text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{exp.description_md}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="pl-8 text-muted-foreground italic">No hay experiencia registrada.</p>
                  )}
                </div>
              </section>
            )}

            {/* 3. EDUCACIÓN (Grid Cards) */}
            <section id="education" className="space-y-6 scroll-mt-24">
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Educación
              </h2>

              <EducationSection education={education} />
            </section>

            {/* --- NUEVA SECCIÓN: TECH STACK --- */}
            <section id="tech-stack" className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 scroll-mt-24">
               <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2">
                  <Cpu className="h-5 w-5 text-primary" /> Stack Tecnológico
               </h2>
               <TechStack technologies={technologies} />
            </section>

            {/* 4. CTA CONTACTO */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 md:p-10 shadow-lg">
                
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

                <div className="relative z-10 flex flex-col items-center text-center gap-6">
                  <div className="p-4 bg-background border border-border rounded-full shadow-sm">
                    <MessageSquare className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                      ¿Te interesa mi perfil?
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
                      Estoy abierto a nuevas oportunidades y desafíos técnicos. Si crees que encajo en tu equipo o proyecto, hablemos.
                    </p>
                  </div>

                  <Link href="/contact">
                    <Button size="lg" className="h-12 px-8 rounded-full text-base gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      Contáctame <ArrowUpRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

// Helpers
function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="p-2.5 rounded-lg bg-secondary hover:bg-foreground hover:text-background transition-colors">
      <Icon className="h-5 w-5" />
    </a>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}