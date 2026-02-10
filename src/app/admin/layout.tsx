"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Code2,
  User,
  MessageSquareHeart
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import { motion, AnimatePresence } from "framer-motion";

// AGREGAMOS EL LINK "PERFIL" AQUÍ
const adminLinks = [
{ name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Perfil (Sobre mí)", href: "/admin/about", icon: User },
  { name: "Proyectos", href: "/admin/projects", icon: FolderKanban },
  { name: "Testimonios", href: "/admin/testimonials", icon: MessageSquareHeart },
  { name: "Mensajes", href: "/admin/messages", icon: MessageSquare },
];

const menuTransition = { duration: 0.3, ease: "easeInOut" } as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="bg-primary/10 p-1 rounded-md">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span>Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 p-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname === link.href 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* LAYOUT PRINCIPAL */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        
        {/* HEADER MÓVIL PREMIUM */}
        <header 
          className={cn(
            "sticky top-0 z-50 flex h-16 items-center justify-between px-4 md:hidden transition-all duration-300",
            scrolled || isMobileMenuOpen 
              ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm" 
              : "bg-transparent border-transparent"
          )}
        >
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="bg-primary/10 p-1.5 rounded-lg shadow-sm">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in fade-in font-extrabold tracking-tight">
                Admin Panel
              </span>
            </div>
            
            {/* Botón Hamburguesa Sincronizado */}
            <MenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </header>

        {/* MENÚ DESPLEGABLE MÓVIL */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={menuTransition}
              className="fixed inset-x-0 top-16 z-40 bottom-0 bg-background/95 backdrop-blur-md border-b border-border md:hidden p-4 overflow-y-auto"
            >
              <nav className="flex flex-col gap-2 mt-2">
                {adminLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium transition-all active:scale-95",
                        pathname === link.href 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="my-4 border-t border-border/50" />
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-base font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 active:scale-95 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </motion.button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

// Botón con la animación sincronizada
function MenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const topVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 }
  };
  
  const centerVariants = {
    closed: { opacity: 1 },
    open: { opacity: 0 }
  };
  
  const bottomVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 }
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
      aria-label="Toggle Menu"
    >
      <div className="flex flex-col gap-1.5 w-6">
        <motion.span
          variants={topVariants}
          animate={isOpen ? "open" : "closed"}
          transition={menuTransition}
          className="h-0.5 w-full bg-foreground rounded-full origin-center"
        />
        <motion.span
          variants={centerVariants}
          animate={isOpen ? "open" : "closed"}
          transition={menuTransition}
          className="h-0.5 w-full bg-foreground rounded-full"
        />
        <motion.span
          variants={bottomVariants}
          animate={isOpen ? "open" : "closed"}
          transition={menuTransition}
          className="h-0.5 w-full bg-foreground rounded-full origin-center"
        />
      </div>
    </button>
  );
}