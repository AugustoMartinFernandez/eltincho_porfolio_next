import Link from "next/link";
import {
  Github,
  Linkedin,
  Mail,
  Code2,
  Home,
  User,
  Briefcase,
  MessageSquareHeart,
  Moon,
  Lock,
  Hammer,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  CodeXml,
  Brain,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { WorkStatus, SocialLinks } from "@/types/about";
import { unstable_noStore as noStore } from "next/cache";

const NAV_LINKS = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Sobre Mí", href: "/about", icon: User },
  { name: "Proyectos", href: "/projects", icon: Briefcase },
  { name: "Testimonios", href: "/testimonials", icon: MessageSquareHeart },
  { name: "Contacto", href: "/contact", icon: Mail },
];

const SOCIAL_ICONS: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
};

export default async function Footer() {
  noStore();
  const currentYear = new Date().getFullYear();

  // Cliente Supabase para Server Component (lectura pública)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: profile } = await supabase
    .from("about_me")
    .select("work_status, social_links")
    .single();
  const status = profile?.work_status as WorkStatus | undefined;
  const socialLinks = (profile?.social_links as SocialLinks) || {};

  return (
    <footer className="relative border-t border-border/50 bg-background/60 backdrop-blur-xl pt-16 pb-8">
      {/* Decoración de Gradiente Superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* COLUMNA 1: MARCA & ESTADO */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground w-fit"
            >
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              TinchoDev
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Ingeniería de software centrada en la experiencia de usuario.
              Construyendo el futuro de la web, un commit a la vez.
            </p>

            {/* Live Status Indicator Dinámico */}
            {status === "open_to_work" && (
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

            {status === "hiring" && (
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
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Explorar
            </h3>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 text-sm w-fit"
                  >
                    <Icon className="h-4 w-4 transition-colors group-hover:text-primary" />
                    <span>{link.name}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                  </Link>
                );
              })}
              <Link
                href="/login"
                className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 text-sm w-fit"
                data-umami-event="Security: Admin Link Clicked"
              >
                <Lock className="h-4 w-4 transition-colors group-hover:text-primary" />
                <span>Panel Admin</span>
                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
              </Link>
            </nav>
          </div>

          {/* COLUMNA 3: SOCIAL */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Conectar
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const Icon = SOCIAL_ICONS[platform.toLowerCase()];
                if (!Icon) return null;

                const href =
                  platform === "email" && !url.startsWith("mailto:")
                    ? `mailto:${url}`
                    : url;

                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={platform}
                    className="p-2.5 rounded-full bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}

              {Object.keys(socialLinks).length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No hay redes sociales públicas.
                </p>
              )}
            </div>
          </div>

          {/* COLUMNA 4: TECH STACK DEL PORTFOLIO */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Construido con
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Este sitio fue diseñado y programado desde cero utilizando
              tecnologías modernas:
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
        <div className="relative mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-indigo-500/20 before:to-transparent">
          {/* Copyright & Admin */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear}{" "}
              <span className="text-foreground font-semibold tracking-wide">
                TinchoDev
              </span>
              . Todos los derechos reservados.
            </p>
            <Link
              href="/login"
              className="p-2 -mr-2 text-muted-foreground/20 hover:text-indigo-400 transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
              aria-label="Admin Access"
              data-umami-event="Security: Admin Link Clicked"
            >
              <Lock className="h-3 w-3" />
            </Link>
          </div>

          {/* Frase Obsesiva con Cerebro y Código (Sin martillo ni AR) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-muted-foreground font-mono leading-none py-2 px-4 text-center bg-secondary/10 hover:bg-secondary/20 rounded-full border border-border/30 shadow-sm backdrop-blur-sm transition-colors duration-300">
            <Brain
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-400 fill-pink-400/10 hover:scale-110 transition-transform duration-300"
              strokeWidth={2}
            />
            <span className="whitespace-nowrap">Hecho con más ganas</span>

            <CodeXml
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 opacity-80"
              strokeWidth={2}
            />

            <span className="whitespace-nowrap">que horas de sueño</span>

            <Moon
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 fill-indigo-400/10 drop-shadow-[0_0_5px_rgba(129,140,248,0.3)]"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-2 py-1 rounded-md bg-muted/50 border border-border text-[10px] font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-default">
      {name}
    </span>
  );
}
