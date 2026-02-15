"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { 
  ArrowLeft, Github, Globe, Calendar, Layers, 
  Share2, Linkedin, Twitter, Link as LinkIcon, Check, 
  MessageCircle, X, Copy
} from "lucide-react";
import { Project } from "@/types/project";
import Button from "@/components/Button";
import LikeButton from "@/components/LikeButton";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { incrementProjectShares } from "@/lib/actions";
import ProjectGallery from "@/domains/projects/ProjectGallery";

interface ProjectDetailProps {
  project: Project;
  initialLikes: number;
  initialHasLiked: boolean;
}

export default function ProjectDetail({ project, initialLikes, initialHasLiked }: ProjectDetailProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 500]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0.2]);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <article className="min-h-screen bg-background animate-in fade-in duration-700">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-100 origin-left"
        style={{ scaleX }}
      />
      <header className="relative h-[50vh] md:h-[65vh] lg:h-[75vh] w-full overflow-hidden flex items-start justify-center bg-muted/20">
        <div className="absolute top-6 left-4 md:left-8 z-20">
          <Link 
            href="/projects" 
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-sm font-medium text-white hover:bg-background/40 transition-all hover:pr-5"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver</span>
          </Link>
        </div>
        <motion.div 
          style={{ y, opacity }}
          className="relative w-full h-full"
        >
          {project.cover_url ? (
            <>
              <img 
                src={project.cover_url} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/60" />
            </>
          ) : (
            <div className="w-full h-full bg-secondary/5 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-blue-500/10" />
               <Layers className="w-24 h-24 text-muted-foreground/20" />
            </div>
          )}
        </motion.div>

  </header>
      <main className="relative z-10 -mt-20 md:-mt-32 container mx-auto px-4 pb-20">
        <div className="bg-background rounded-3xl shadow-2xl border border-border/50 p-6 md:p-10 lg:p-16 max-w-5xl mx-auto">
          <div className="space-y-8 border-b border-border pb-10 mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <ProjectTags tags={project.tags} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(project.published_at || Date.now()).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
                {project.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl text-balance">
                {project.summary}
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4">
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex-1 md:flex-none">
                    <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      <Globe className="h-4 w-4" /> Ver Demo
                    </Button>
                  </a>
                )}
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex-1 md:flex-none">
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <Github className="h-4 w-4" /> Código
                    </Button>
                  </a>
                )}
                <div className="flex-none">
                   <LikeButton 
                      projectId={project.id} 
                      initialLikes={initialLikes} 
                      initialHasLiked={initialHasLiked} 
                   />
                </div>
              </div>
              <ShareMenu 
                title={project.title} 
                summary={project.summary} 
                projectId={project.id}
                initialShareCount={project.share_count || 0}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="prose prose-slate dark:prose-invert prose-base md:prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-8
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
                prose-blockquote:border-l-primary prose-blockquote:bg-secondary/30 prose-blockquote:py-1 prose-blockquote:pr-2">
                <ReactMarkdown>{project.description_md}</ReactMarkdown>
              </div>
              <ProjectGallery images={project.gallery_urls} />
            </div>
            <aside className="lg:col-span-4 order-1 lg:order-2 space-y-8">
              <div className="bg-secondary/20 rounded-2xl p-6 border border-border lg:sticky lg:top-24">
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Stack Tecnológico
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.length > 0 ? (
                    project.tech_stack.map((tech) => (
                      <div 
                        key={tech.name}
                        className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground shadow-sm hover:border-primary/40 transition-colors select-none"
                      >
                        {tech.icon_url && (
                          <img src={tech.icon_url} alt="" className="h-4 w-4 object-contain" />
                        )}
                        {tech.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No especificado</span>
                  )}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </article>
  );
}
function ShareMenu({ title, summary, projectId, initialShareCount }: { title: string, summary: string, projectId: string, initialShareCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNativeShare, setIsNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [shareCount, setShareCount] = useState(initialShareCount);
  useEffect(() => {
    setUrl(window.location.href);
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setIsNativeShare(true);
    }
  }, []);

  useEffect(() => {
    setShareCount(initialShareCount);
  }, [projectId]);

  const trackShare = async () => {
    try {
      const result = await incrementProjectShares(projectId);

      if (!result?.success) {
        return false;
      }

      if (typeof result.shareCount === "number") {
        setShareCount(result.shareCount);
      } else {
        setShareCount((prev) => prev + 1);
      }

      return true;
    } catch (error) {
      console.error("Error tracking share:", error);
      return false;
    }
  };
  const handleShare = async () => {
    if (isNativeShare) {
      try {
        await navigator.share({
          title: title,
          text: summary,
          url: url,
        });
        await trackShare();
      } catch (err) {
        console.log("Usuario canceló compartir o error:", err);
      }
    } else {
      setIsOpen(true);
    }
  };
  const handleCopy = async () => {
    try {
      await trackShare();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar", err);
    }
  };
  const handleSocialClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetUrl: string,
  ) => {
    e.preventDefault();
    await trackShare();
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Mira este proyecto: ${title}`);
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;

  return (
    <>
      <div className="flex items-center gap-3 border-l border-border pl-6 ml-auto md:ml-0">
        <div className="flex flex-col items-end">
           <span className="text-xs font-bold text-foreground">{shareCount}</span>
           <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Shares</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleShare}
          className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Compartir</span>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Compartir Proyecto</h3>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a href={linkedinUrl} target="_blank" rel="noreferrer"
                     onClick={(e) => handleSocialClick(e, linkedinUrl)}
                     className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-[#0077b5]/10 hover:text-[#0077b5] transition-colors border border-transparent hover:border-[#0077b5]/20">
                    <Linkedin className="h-6 w-6" />
                    <span className="text-xs font-medium">LinkedIn</span>
                  </a>
                  <a href={twitterUrl} target="_blank" rel="noreferrer"
                     onClick={(e) => handleSocialClick(e, twitterUrl)}
                     className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors border border-transparent hover:border-foreground/20">
                    <Twitter className="h-6 w-6" />
                    <span className="text-xs font-medium">X / Twitter</span>
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer"
                     onClick={(e) => handleSocialClick(e, whatsappUrl)}
                     className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors border border-transparent hover:border-[#25D366]/20">
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </a>
                  <button onClick={handleCopy}
                     className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                    {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                    <span className="text-xs font-medium">{copied ? "Copiado" : "Copiar Link"}</span>
                  </button>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground truncate font-mono">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{url}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ProjectTags({ tags }: { tags?: string[] }) {
  if (Array.isArray(tags) && tags.length > 0) {
    return (
      <>
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20"
            role="listitem"
          >
            {tag}
          </span>
        ))}
      </>
    );
  }

  return (
    <span className="no-tags" aria-label="sin-etiquetas">
      Sin etiquetas
    </span>
  );
}
