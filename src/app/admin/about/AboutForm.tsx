"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Save, Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import Button from "@/components/Button";
import { AboutMe } from "@/types/about";
import { useRouter } from "next/navigation";

export default function AboutForm({ initialData }: { initialData?: AboutMe }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // INICIALIZACIÓN ROBUSTA: Evitamos que social_links sea null/undefined
  const [formData, setFormData] = useState<Partial<AboutMe>>({
    full_name: "",
    title: "",
    short_bio_md: "",
    available_for_work: true,
    ...initialData, // Sobreescribimos con datos reales si existen
    social_links: {
      github: "",
      linkedin: "",
      email: "",
      ...(initialData?.social_links || {}) // Fusionamos con seguridad
    }
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      social_links: { ...formData.social_links, [e.target.name]: e.target.value }
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profile_image_url" | "cv_url") => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const file = e.target.files[0];
    const path = `${field === "cv_url" ? "cv" : "avatar"}/${Date.now()}_${file.name}`;

    try {
      const { error } = await supabase.storage.from("portfolio").upload(path, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
    } catch (err) {
      console.error(err);
      alert("Error subiendo archivo. Verifica que el bucket 'portfolio' sea público.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { ...formData, updated_at: new Date().toISOString() };
    
    // Lógica Upsert inteligente
    const query = formData.id 
      ? supabase.from("about_me").update(payload).eq("id", formData.id)
      : supabase.from("about_me").insert([payload]);

    const { error } = await query;
    setLoading(false);
    
    if (error) {
        console.error(error);
        alert("Error al guardar perfil.");
    } else {
      router.refresh();
      // Feedback visual sutil (podrías usar un Toast aquí)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-xl font-bold">Información Principal</h2>
        <Button type="submit" isLoading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Guardar Cambios
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre Completo</label>
            <input name="full_name" value={formData.full_name || ""} onChange={handleChange} className="w-full p-2 border rounded-md bg-background" />
          </div>
          <div>
            <label className="text-sm font-medium">Título Profesional</label>
            <input name="title" value={formData.title || ""} onChange={handleChange} className="w-full p-2 border rounded-md bg-background" placeholder="Ej: Full Stack Developer" />
          </div>
          <div>
            <label className="text-sm font-medium">Bio (Markdown)</label>
            <textarea name="short_bio_md" value={formData.short_bio_md || ""} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md bg-background font-mono text-sm" placeholder="Breve descripción..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium block mb-1">LinkedIn</label>
                <input name="linkedin" value={formData.social_links?.linkedin || ""} onChange={handleSocialChange} className="w-full p-2 border rounded-md bg-background text-sm" placeholder="URL" />
             </div>
             <div>
                <label className="text-sm font-medium block mb-1">GitHub</label>
                <input name="github" value={formData.social_links?.github || ""} onChange={handleSocialChange} className="w-full p-2 border rounded-md bg-background text-sm" placeholder="URL" />
             </div>
             <div className="col-span-2">
                <label className="text-sm font-medium block mb-1">Email</label>
                <input name="email" value={formData.social_links?.email || ""} onChange={handleSocialChange} className="w-full p-2 border rounded-md bg-background text-sm" placeholder="nombre@ejemplo.com" />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="h-20 w-20 rounded-full bg-muted overflow-hidden border-2 border-primary/20 shrink-0 relative">
              {formData.profile_image_url ? (
                // Usamos img estándar para evitar config por ahora
                <img src={formData.profile_image_url} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">Sin foto</div>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1">Foto de Perfil</label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "profile_image_url")} className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1">Curriculum Vitae (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => handleUpload(e, "cv_url")} className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              {formData.cv_url && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Cargado</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="available" checked={formData.available_for_work || false} onChange={(e) => setFormData({...formData, available_for_work: e.target.checked})} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
            <label htmlFor="available" className="text-sm font-medium cursor-pointer">Mostrar badge "Disponible para trabajar"</label>
          </div>
        </div>
      </div>
    </form>
  );
}