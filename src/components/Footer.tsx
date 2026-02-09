import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Brand / Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-lg font-bold tracking-tight text-foreground">
              TinchoDev
            </span>
            <p className="text-sm text-muted-foreground">
              © {currentYear} Ingeniería de Software.
            </p>
          </div>

          {/* Links de Navegación Rápida */}
          <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/projects" className="hover:text-primary transition-colors">
              Proyectos
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              Sobre mí
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Redes Sociales */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:contacto@tinchodev.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}