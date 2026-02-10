"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Heart, Star, Upload, Loader2, CheckCircle2, X, Mail, AlertCircle } from "lucide-react"; // Importamos nuevos iconos
import { createTestimonial } from "@/lib/actions";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

// ... (Interface WizardProps, Type Step, Role se mantienen igual)
interface WizardProps {
  projects: { id: string; title: string }[];
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'role' | 'details' | 'success';
type Role = 'client' | 'colleague' | 'visitor';

const initialState = {
  message: "",
  success: false,
  errors: {} // Inicializamos errores
};

export default function TestimonialWizard({ projects, isOpen, onClose }: WizardProps) {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [rating, setRating] = useState(5);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState(createTestimonial, initialState);

  if (state.success && step !== 'success') {
    setStep('success');
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleClose = () => {
    setStep('role');
    setRole(null);
    setAvatarPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="absolute inset-0" onClick={handleClose} />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Deja tu huella <span className="text-xl">✍️</span>
              </h3>
              <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                
                {/* PASO 1: ROL (Igual que antes) */}
                {step === 'role' && (
                  <motion.div 
                    key="step-role"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold">¡Hola! ¿Cómo nos conocemos?</h2>
                      <p className="text-muted-foreground">Selecciona la opción para personalizar tu experiencia.</p>
                    </div>
                    <div className="grid gap-3">
                      {/* ... (RoleCards se mantienen igual, ver abajo helper) */}
                      <RoleCard icon={Briefcase} title="Fui su Cliente" desc="Trabajamos juntos en un proyecto." onClick={() => { setRole('client'); setStep('details'); }} />
                      <RoleCard icon={User} title="Somos Colegas" desc="Estudiamos o trabajamos juntos." onClick={() => { setRole('colleague'); setStep('details'); }} />
                      <RoleCard icon={Heart} title="Visitante / Amigo" desc="Me gustó tu trabajo o portfolio." onClick={() => { setRole('visitor'); setStep('details'); }} />
                    </div>
                  </motion.div>
                )}

                {/* PASO 2: FORMULARIO DETALLES (Actualizado con Email) */}
                {step === 'details' && (
                  <motion.div 
                    key="step-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <Button variant="ghost" size="sm" onClick={() => setStep('role')} className="-ml-2 text-muted-foreground">← Volver</Button>
                        <span className="text-sm font-medium text-muted-foreground">
                            {role === 'client' ? 'Cliente' : role === 'colleague' ? 'Colega' : 'Visitante'}
                        </span>
                    </div>

                    <form action={formAction} className="space-y-5">
                      <input type="hidden" name="relationship" value={role || ""} />
                      
                      {/* Avatar */}
                      <div className="flex justify-center mb-2">
                        <div className="relative group cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors flex items-center justify-center">
                                {avatarPreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center space-y-1">
                                      <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                                      <span className="text-[9px] text-muted-foreground block">Subir foto</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>

                      {/* Grid de Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Nombre *</label>
                            <input name="name" required placeholder="Tu nombre" className={cn("w-full p-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm", state.errors?.name ? "border-destructive" : "border-input")} />
                            {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
                        </div>
                        
                        {/* NUEVO: Campo Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                              Correo <span className="text-[10px] font-normal lowercase opacity-70">(Privado)</span> *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <input 
                                name="email" 
                                type="email" 
                                required 
                                placeholder="tu@email.com" 
                                className={cn("w-full p-2.5 pl-9 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm", state.errors?.email ? "border-destructive" : "border-input")} 
                              />
                            </div>
                            {state.errors?.email && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {state.errors.email[0]}</p>}
                        </div>
                      </div>

                      {/* Inputs Condicionales */}
                      {role === 'client' && (
                          <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Empresa / Proyecto</label>
                              <input name="role_or_company" placeholder="Ej: Tech Solutions Inc." className="w-full p-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
                          </div>
                      )}
                      {role === 'colleague' && (
                          <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Rol / Relación</label>
                              <input name="role_or_company" placeholder="Ej: Senior Dev @ Google" className="w-full p-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
                          </div>
                      )}
                      {role === 'visitor' && projects.length > 0 && (
                          <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">¿Algún proyecto favorito?</label>
                              <select name="project_id" className="w-full p-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                                  <option value="">Seleccionar (Opcional)</option>
                                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                              </select>
                          </div>
                      )}

                      {/* Rating y Testimonio */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Tu Mensaje *</label>
                          <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                      <Star className={cn("h-5 w-5 transition-colors", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
                                  </button>
                              ))}
                              <input type="hidden" name="rating" value={rating} />
                          </div>
                        </div>
                        <textarea 
                            name="content" 
                            required 
                            rows={4} 
                            placeholder={role === 'client' ? "Describe cómo fue el proceso de trabajo..." : "¡Me encantó tu portfolio porque..."}
                            className={cn("w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm", state.errors?.content ? "border-destructive" : "border-input")}
                        />
                        {state.errors?.content && <p className="text-xs text-destructive">{state.errors.content[0]}</p>}
                      </div>

                      <div className="pt-2">
                        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Enviar Testimonio"}
                        </Button>
                        {state.message && !state.success && (
                            <p className="text-sm text-destructive text-center mt-2 bg-destructive/10 p-2 rounded-md">{state.message}</p>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* PASO 3: SUCCESS (Igual) */}
                {step === 'success' && (
                  <motion.div key="step-success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">¡Recibido con éxito!</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto">Tu testimonio ha sido enviado y está pendiente de moderación.</p>
                    </div>
                    <Button onClick={handleClose} variant="outline">Cerrar</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Subcomponente RoleCard (El mismo de antes)
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