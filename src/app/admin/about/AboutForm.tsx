"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Save, Loader2, Upload, FileText, CheckCircle2, MapPin } from "lucide-react";
import Button from "@/components/Button";
import { AboutMe } from "@/types/about";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AboutForm({ initialData }: { initialData?: AboutMe }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Inicialización defensiva: Si initialData es null, usa defaults.
  const [formData, setFormData] = useState<Partial<AboutMe>>({
    full_name: "",
    title: "",
    short_bio_md: "",
    location: "",
    available_for_work: false,
    work_status: "closed",
    show_experience: true,
    ...initialData,
    social_links: {
      github: "",
      linkedin: "",
      email: "",
      twitter: "",
      ...(initialData?.social_links || {})
    }
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [name]: value }
    }));
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profile_image_url" | "cv_url") => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${field === "cv_url" ? "cv" : "avatar"}_${Date.now()}.${fileExt}`;
    const path = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error al subir archivo. Verifica permisos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. LIMPIEZA DE DATOS (CORRECCIÓN IMPORTANTE):
    // Extraemos el 'id' del objeto formData para NO enviarlo en el cuerpo de la actualización.
    // Esto evita el error 400 de Supabase.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToSave } = formData;

    // Payload limpio con fecha de actualización
    const payload = {
        ...dataToSave,
        updated_at: new Date().toISOString()
    };

    try {
        let error;
        
        // Upsert Lógico: 
        // Si ya tenemos un ID cargado (existe el perfil), hacemos UPDATE sobre ese ID.
        // Si no hay ID (perfil nuevo), hacemos INSERT.
        if (formData.id) {
            const res = await supabase
                .from("about_me")
                .update(payload)
                .eq("id", formData.id);
            error = res.error;
        } else {
            const res = await supabase
                .from("about_me")
                .insert([payload]);
            error = res.error;
        }

        if (error) throw error;

        router.refresh();
        toast.success("Perfil actualizado correctamente");
        
    } catch (err) {
        console.error("Save error details:", err);
        toast.error("Error inesperado. Revisa la consola.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-8 shadow-sm">
      
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
            <h2 className="text-xl font-bold">Perfil Principal</h2>
            <p className="text-sm text-muted-foreground">Información visible en la cabecera del portfolio.</p>
        </div>
        <Button type="submit" isLoading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Guardar
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Datos de Texto (8 cols) */}
        <div className="md:col-span-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Nombre Completo</label>
                <input name="full_name" required value={formData.full_name || ""} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: Martin Fernandez" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Título Profesional</label>
                <input name="title" required value={formData.title || ""} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: Senior Software Engineer" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ubicación</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input name="location" value={formData.location || ""} onChange={handleChange} className="w-full p-2.5 pl-9 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: Buenos Aires, Argentina (GMT-3)" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio (Markdown soportado)</label>
            <textarea name="short_bio_md" value={formData.short_bio_md || ""} onChange={handleChange} rows={5} className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm" placeholder="Escribe un resumen profesional..." />
          </div>
          
          <div className="pt-4 border-t border-border">
             <h3 className="text-sm font-semibold mb-3">Redes Sociales</h3>
             <div className="grid grid-cols-2 gap-4">
                {['linkedin', 'email', 'github', 'instagram', 'facebook', 'tiktok'].map((network) => (
                    <div key={network} className="space-y-1">
                        <label className="text-xs font-medium capitalize text-muted-foreground">{network === 'email' ? 'Gmail / Email' : network}</label>
                        <input 
                            name={network} 
                            value={formData.social_links?.[network as keyof typeof formData.social_links] || ""} 
                            onChange={handleSocialChange} 
                            className="w-full p-2 rounded-md border border-border bg-background text-sm" 
                            placeholder={network === 'email' ? 'correo@ejemplo.com' : 'URL completa...'} 
                        />
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Columna Derecha: Multimedia y Estado (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Avatar Upload */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col items-center gap-4 text-center">
            <div className="h-28 w-28 rounded-full bg-muted border-2 border-dashed border-border overflow-hidden relative group">
              {formData.profile_image_url ? (
                <img src={formData.profile_image_url} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">Subir Foto</div>
              )}
              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Upload className="h-6 w-6 text-white" />
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "profile_image_url")} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div>
                <p className="text-sm font-medium">Foto de Perfil</p>
                <p className="text-xs text-muted-foreground mt-1">Click en la imagen para cambiar</p>
            </div>
          </div>

          {/* CV Upload */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-medium">Curriculum Vitae</p>
                    {formData.cv_url ? (
                        <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Archivo activo</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">Formato PDF</p>
                    )}
                </div>
            </div>
            <input type="file" accept=".pdf" onChange={(e) => handleUpload(e, "cv_url")} className="w-full text-xs text-muted-foreground file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
          </div>
          
          {/* Card de Configuración Pública */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Configuración Pública</h3>
            <div className="space-y-3 divide-y divide-border/50 pt-2">
              <div className="space-y-2">
                <label htmlFor="work_status" className="text-sm font-medium">Estado Laboral</label>
                <select
                  id="work_status"
                  name="work_status"
                  value={formData.work_status || 'closed'}
                  onChange={handleChange} // Asegúrate que handleChange soporte select (HTMLSelectElement)
                  className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                >
                  <option value="closed">Sin búsqueda activa (Oculto)</option>
                  <option value="open_to_work">Disponible para trabajar</option>
                  <option value="hiring">Contratando Talento</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-3 first:pt-0">
                <label htmlFor="show_experience" className="text-sm font-medium cursor-pointer select-none">
                    Mostrar sección de Experiencia
                </label>
                <input 
                    type="checkbox" 
                    id="show_experience"
                    name="show_experience"
                    checked={formData.show_experience || false} 
                    onChange={handleToggle} 
                    className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer accent-primary" 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}