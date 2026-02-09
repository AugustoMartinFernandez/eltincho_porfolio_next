import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { 
  Download, 
  Github, 
  Linkedin, 
  Mail, 
  MapPin, 
  Calendar,
  Building2,
  GraduationCap,
  Terminal,
  Briefcase,
  User,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// --- CONFIGURACIÓN ---

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

export const metadata = {
  title: "Perfil Profesional | TinchoDev",
  description: "Ingeniería de software, trayectoria y habilidades.",
};

// --- COMPONENTE PRINCIPAL ---

export default async function AboutPage() {
  const supabase = await createClient();

  // Fetch de datos optimizado
  const [aboutRes, expRes, eduRes] = await Promise.all([
    supabase.from("about_me").select("*").single(),
    supabase.from("experience").select("*").eq("visible", true).order("start_date", { ascending: false }),
    supabase.from("education").select("*").eq("visible", true).order("start_date", { ascending: false })
  ]);

  const profile = aboutRes.data;
  const experiences = expRes.data || [];
  const education = eduRes.data || [];

  if (!profile) return <EmptyProfileState />;

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* --- COLUMNA IZQUIERDA: PERFIL (Sticky en Desktop) --- */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="lg:sticky lg:top-24 space-y-8">
              
              {/* Tarjeta de Perfil */}
              <div className="relative group">
                {/* Foto de Perfil */}
                <div className="w-full aspect-square rounded-3xl overflow-hidden border border-border bg-muted shadow-sm relative">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt={profile.full_name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                      <User className="h-24 w-24 opacity-20" />
                    </div>
                  )}
                  
                  {/* Badge de Estado Superpuesto */}
                  {profile.available_for_work && (
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md border border-border p-3 rounded-xl flex items-center gap-3 shadow-lg">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-bold text-foreground">Disponible para proyectos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos Personales */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.full_name}</h1>
                  <p className="text-lg text-primary font-medium mt-1 flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    {profile.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Argentina (GMT-3)</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <SocialBtn href={profile.social_links?.github} icon={Github} />
                  <SocialBtn href={profile.social_links?.linkedin} icon={Linkedin} />
                  <SocialBtn href={profile.social_links?.email ? `mailto:${profile.social_links.email}` : undefined} icon={Mail} />
                </div>

                {profile.cv_url && (
                  <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="block w-full pt-2">
                    <Button variant="outline" className="w-full gap-2 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 h-11">
                      <Download className="h-4 w-4" /> Descargar CV Completo
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </aside>

          {/* --- COLUMNA DERECHA: CONTENIDO (Scroll) --- */}
          <main className="lg:col-span-8 space-y-16">
            
            {/* 1. BIO / SOBRE MÍ */}
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-2xl font-bold tracking-tight border-b border-border pb-2">Sobre mí</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <ReactMarkdown>{profile.short_bio_md}</ReactMarkdown>
              </div>
            </section>

            {/* 2. EXPERIENCIA */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-2xl font-bold tracking-tight">Experiencia</h2>
                <Briefcase className="text-muted-foreground h-5 w-5" />
              </div>

              <div className="relative border-l-2 border-border/50 ml-3 space-y-12 pb-2">
                {experiences.length > 0 ? experiences.map((exp: any) => (
                  <div key={exp.id} className="relative pl-8 md:pl-10 group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1.5 h-[18px] w-[18px] rounded-full border-4 border-background bg-muted-foreground/30 group-hover:bg-primary transition-colors z-10" />
                    
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {exp.role_title}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded w-fit">
                          {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : "Actualidad"}
                        </span>
                      </div>
                      
                      <div className="text-base font-medium text-foreground/80 flex items-center gap-2">
                        <Building2 className="h-4 w-4 opacity-70" />
                        {exp.company_name}
                      </div>

                      {exp.description_md && (
                        <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none pt-1">
                          <ReactMarkdown>{exp.description_md}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <EmptySectionState message="No hay experiencia registrada aún." />
                )}
              </div>
            </section>

            {/* 3. EDUCACIÓN */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-2xl font-bold tracking-tight">Educación</h2>
                <GraduationCap className="text-muted-foreground h-5 w-5" />
              </div>

              <div className="grid gap-4">
                {education.length > 0 ? education.map((edu: any) => (
                  <div 
                    key={edu.id} 
                    className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {edu.degree_title}
                        </h3>
                        <p className="text-muted-foreground font-medium mt-1">
                          {edu.institution_name}
                        </p>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {new Date(edu.start_date).getFullYear()} 
                        {edu.end_date && ` - ${new Date(edu.end_date).getFullYear()}`}
                      </div>
                    </div>
                  </div>
                )) : (
                  <EmptySectionState message="No hay educación registrada aún." />
                )}
              </div>
            </section>

            {/* FOOTER CTA */}
            <div className="bg-primary/5 rounded-2xl p-8 text-center space-y-4 border border-primary/10">
              <h3 className="text-xl font-bold">¿Te interesa mi perfil?</h3>
              <p className="text-muted-foreground">Estoy abierto a nuevas oportunidades y desafíos técnicos.</p>
              <div className="flex justify-center gap-4">
                <a href="/contact">
                  <Button size="lg" className="gap-2">
                    Contáctame <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function SocialBtn({ href, icon: Icon }: { href?: string; icon: any }) {
  if (!href) return null;
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

function EmptyProfileState() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <Terminal className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Perfil en Construcción</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        El perfil aún no ha sido inicializado. Accede al admin para cargar tus datos.
      </p>
      <a href="/admin/about">
        <Button variant="outline">Ir al Admin</Button>
      </a>
    </div>
  );
}

function EmptySectionState({ message }: { message: string }) {
  return (
    <div className="p-6 rounded-xl border border-dashed border-border text-center">
      <p className="text-muted-foreground italic text-sm">{message}</p>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}