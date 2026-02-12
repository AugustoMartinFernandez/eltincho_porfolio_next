"use client";

import { useState, useActionState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTestimonial } from "@/lib/actions";
import Button from "@/components/Button";
import { Upload, User, Star, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  projects: { id: string; title: string }[];
  defaultRole?: "client" | "colleague" | "visitor" | null;
}

const initialState = {
  message: "",
  success: false,
  errors: {}
};

const MAX_CHARS = 500;

export default function TestimonialWizard({ projects, isOpen, onClose, defaultRole }: WizardProps) {
  const [state, formAction, isPending] = useActionState(createTestimonial, initialState);
  
  // --- STATE MANAGEMENT ---
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [rating, setRating] = useState(5);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [relationshipValue, setRelationshipValue] = useState("");
  const [charCount, setCharCount] = useState(0);

  // --- EFFECTS ---

  // 1. Pre-fill Role based on selection
  useEffect(() => {
    if (isOpen && defaultRole) {
      const roleMap: Record<string, string> = {
        client: "Cliente",
        colleague: "Colega",
        visitor: "Visitante / Seguidor"
      };
      setRelationshipValue(roleMap[defaultRole] || "");
    }
  }, [isOpen, defaultRole]);

  // 2. Simulated Progress Bar for UX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      setUploadProgress(10);
      interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 10));
      }, 500);
    } else {
      if (uploadProgress > 0) {
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 500);
      }
    }
    return () => clearInterval(interval);
  }, [isPending]);

  // 3. Auto-close on Success
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  // --- HANDLERS ---

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        // Memory cleanup
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
           URL.revokeObjectURL(avatarPreview);
        }
        // State reset
        setAvatarPreview(null);
        setCompressedFile(null);
        setRating(5);
        setUploadProgress(0);
        setRelationshipValue("");
        setCharCount(0);
    }, 300);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // A. Security & Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Formato no válido. Por favor sube JPG o PNG.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo excede el límite de 10MB.");
      e.target.value = "";
      return;
    }

    // B. Memory Efficient Preview
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
    }
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // C. Tiered Compression Strategy
    setIsCompressing(true);
    
    const baseOptions = { 
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280, 
      fileType: file.type,
      initialQuality: 0.8
    };

    try {
      // Tier 1: WebWorker (Fastest, non-blocking)
      const compressed = await imageCompression(file, { ...baseOptions, useWebWorker: true });
      setCompressedFile(compressed);
      
    } catch (workerError) {
      console.warn("WebWorker compression failed. Falling back to Main Thread.", workerError);
      
      try {
        // Tier 2: Main Thread (Compatibility mode)
        const compressedFallback = await imageCompression(file, { ...baseOptions, useWebWorker: false });
        setCompressedFile(compressedFallback);
        
      } catch (mainThreadError) {
        // Tier 3: Original File (Fault tolerance)
        console.error("All compression attempts failed. Using original file.", mainThreadError);
        setCompressedFile(file);
        // Note: We do NOT show an error toast to the user; we silently degrade gracefully.
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFormAction = (formData: FormData) => {
    if (isCompressing) {
        toast.warning("Optimizando imagen, por favor espera un momento...");
        return;
    }
    if (compressedFile) {
        formData.set("avatar", compressedFile);
    }
    formAction(formData);
  };

  // --- RENDER ---
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
          <div className="absolute inset-0" onClick={handleClose} />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            // 'relative' is CRITICAL here for scroll position calculation
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-muted/20 shrink-0">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Tu Experiencia</h2>
                <p className="text-sm text-muted-foreground">
                  {defaultRole === 'client' ? "Cuéntanos sobre el proyecto." : 
                   defaultRole === 'colleague' ? "¿Cómo fue trabajar juntos?" : 
                   "Comparte tu opinión."}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Container */}
            <div className="p-6 overflow-y-auto custom-scrollbar relative">
              {!state.success ? (
                <form action={handleFormAction} className="space-y-6">
                  {/* Honeypot */}
                  <input type="text" name="website_url" className="hidden" tabIndex={-1} autoComplete="off" />

                  {/* Avatar Field */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="relative group">
                      <div className={cn(
                        "w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all bg-muted relative",
                        avatarPreview ? "border-primary/50" : "border-dashed border-border group-hover:border-primary/50"
                      )}>
                        {avatarPreview ? (
                          <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground/40" />
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10">
                           {isCompressing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-5 w-5 mb-1" />}
                           <input type="file" name="avatar" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Foto de perfil (Opcional)</p>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Nombre Completo</label>
                      <input name="name" required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Email</label>
                      <input name="email" type="email" required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none" placeholder="tu@email.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Rol o Relación</label>
                    <input 
                      name="relationship" 
                      required 
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none" 
                      placeholder="Ej: Cliente, Colega..." 
                      value={relationshipValue}
                      onChange={(e) => setRelationshipValue(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Proyecto (Opcional)</label>
                    <div className="relative">
                        <select name="project_id" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none appearance-none text-muted-foreground">
                        <option value="">Seleccionar proyecto...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                  </div>

                  {/* Textarea with Character Counter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-medium text-foreground/80">Tu Testimonio</label>
                        <span className={cn(
                            "text-xs font-mono transition-colors",
                            charCount >= MAX_CHARS ? "text-destructive font-bold" : "text-muted-foreground"
                        )}>
                            {charCount}/{MAX_CHARS}
                        </span>
                    </div>
                    <textarea 
                        name="content" 
                        required 
                        rows={4} 
                        maxLength={MAX_CHARS}
                        onChange={(e) => setCharCount(e.target.value.length)}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background/50 text-sm resize-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none leading-relaxed" 
                        placeholder="Escribe tu experiencia..." 
                    />
                  </div>

                  {/* Rating System */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Calificación</label>
                    <input type="hidden" name="rating" value={rating} />
                    <div className="flex gap-2 p-2 rounded-full bg-secondary/30">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
                          <Star className={cn("h-6 w-6 transition-colors", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Feedback */}
                  <AnimatePresence>
                    {(uploadProgress > 0 || isPending) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          <span>{uploadProgress < 100 ? "Enviando..." : "Completado"}</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button type="submit" className="w-full h-11" disabled={isPending || isCompressing}>
                    {isPending ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</span> : "Enviar Testimonio"}
                  </Button>

                  {/* Server Feedback Messages */}
                  {state.message && !state.success && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{state.message}</p>
                    </div>
                  )}
                </form>
              ) : (
                /* Success State */
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 animate-in zoom-in" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">¡Recibido!</h3>
                    <p className="text-muted-foreground text-sm">Gracias por tu testimonio.</p>
                  </div>
                  <Button variant="outline" onClick={handleClose} className="mt-4">Cerrar</Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function RoleCard({ icon: Icon, title, desc, onClick }: any) {
    return (
        <button onClick={onClick} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group w-full">
            <div className="p-3 rounded-full bg-secondary group-hover:bg-background group-hover:text-primary transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h4 className="font-bold text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
        </button>
    );
}
