import Link from "next/link";
import { Github, Linkedin, Mail, ArrowUpRight, Code2, Heart, Coffee } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { WorkStatus } from "@/types/about";
import { unstable_noStore as noStore } from "next/cache";

export default async function Footer() {
  noStore();
  const currentYear = new Date().getFullYear();

  // Cliente Supabase para Server Component (lectura pública)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase.from("about_me").select("work_status").single();
  const status = profile?.work_status as WorkStatus | undefined;

  return (
    <footer className="relative border-t border-border/50 bg-background/60 backdrop-blur-xl pt-16 pb-8">
      
      {/* Decoración de Gradiente Superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          
          {/* COLUMNA 1: MARCA & ESTADO */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground w-fit">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              TinchoDev
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Ingeniería de software centrada en la experiencia de usuario. Construyendo el futuro de la web, un commit a la vez.
            </p>
            
            {/* Live Status Indicator Dinámico */}
            {status === 'open_to_work' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Disponible para trabajar
                </span>
              </div>
            )}

            {status === 'hiring' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  Contratando Talento
                </span>
              </div>
            )}
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Explorar</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-1 group">
                  Proyectos 
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Trayectoria & Bio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: SOCIAL */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Conectar</h3>
            <div className="flex flex-col gap-3">
              <SocialItem href="https://github.com/AugustoMartinFernandez" icon={Github} label="Github" />
              <SocialItem href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
              <SocialItem href="mailto:hola@tinchodev.com" icon={Mail} label="Email" />
              {/* <SocialItem href="https://twitter.com" icon={Twitter} label="Twitter / X" /> */}
            </div>
          </div>

          {/* COLUMNA 4: TECH STACK DEL PORTFOLIO */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Construido con</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Este sitio fue diseñado y programado desde cero utilizando tecnologías modernas:
            </p>
            <div className="flex flex-wrap gap-2">
              <TechBadge name="Next.js 15" />
              <TechBadge name="TypeScript" />
              <TechBadge name="Tailwind CSS" />
              <TechBadge name="Supabase" />
              <TechBadge name="Framer Motion" />
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} TinchoDev. Todos los derechos reservados.
          </p>
          
<div className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono">
            <span>Codeado con</span>
            {/* El Mate (representado por Coffee pero color ámbar/marrón) */}
            <Coffee className="h-4 w-4 text-amber-700 -mt-0.5" strokeWidth={2.5} />
            <span>y</span>
            {/* El Corazón (rojo pulsante) */}
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>en Argentina 🇦🇷</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Subcomponente para items sociales
function SocialItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
    >
      <div className="p-1.5 rounded-md bg-secondary/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      {label}
    </a>
  );
}

// Subcomponente para badges técnicos
function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-2 py-1 rounded-md bg-muted/50 border border-border text-[10px] font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-default">
      {name}
    </span>
  );
}