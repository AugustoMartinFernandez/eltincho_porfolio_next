import { ArrowRight, Download, Github, Linkedin, Twitter, Youtube, Instagram, Facebook, Mail } from "lucide-react";
import Button from "@/components/Button";
import Link from "next/link";
import { AboutMe } from "@/types/about";

const SocialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail
};

export default function HeroText({ profile }: { profile: AboutMe | null }) {
  const workStatus = profile?.work_status;
  const social_links = profile?.social_links;
  const cv_url = profile?.cv_url;
  const hasSocial = social_links && Object.values(social_links).some(url => !!url);

  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-4">
        {workStatus === 'open_to_work' && (
          <div className="inline-block rounded-lg bg-emerald-500/10 px-3 py-1 text-sm text-emerald-600 border border-emerald-500/20 font-medium">
            Disponible para trabajar
          </div>
        )}
        {workStatus === 'hiring' && (
          <div className="inline-block rounded-lg bg-purple-500/10 px-3 py-1 text-sm text-purple-600 border border-purple-500/20 font-medium">
            Contratando Talento
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter xl:text-7xl/none bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
          Desarrollo Web & <br />
          <span className="text-primary">Soluciones Full Stack.</span>
        </h1>
        <p className="max-w-150 text-muted-foreground md:text-xl leading-relaxed">
          Enfocado en construir aplicaciones modernas, rápidas y escalables. Transformo lógica compleja en experiencias de usuario fluidas.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-auto">
        <Link href="/projects" className="w-auto">
          <Button size="lg" className="w-auto gap-2 px-8">
            Ver Proyectos <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/contact" className="w-auto">
          <Button variant="outline" size="lg" className="w-auto px-8">
            Contactame
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        {/* Redes Sociales Dinámicas */}
        {hasSocial && Object.entries(social_links!).map(([platform, url]) => {
          if (!url) return null;
          const Icon = SocialIcons[platform as keyof typeof SocialIcons];
          if (!Icon) return null;
          
          return (
            <a key={platform} href={url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors p-1">
              <Icon className="h-6 w-6" />
            </a>
          );
        })}

        {/* Separador y CV */}
        {hasSocial && cv_url && <span className="h-4 w-px bg-border mx-2" />}
        
        {cv_url && (
          <a 
            href={cv_url} 
            target="_blank" 
            data-umami-event="Descargar CV"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 p-1"
          >
            Descargar CV <Download className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
