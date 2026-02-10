"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Save, Image as ImageIcon, X, Plus, Cpu, Trash2, Upload } from "lucide-react";
import Button from "@/components/Button";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";

// Definimos props: project es opcional (si no viene, es modo CREAR)
export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  // Estado local para el input de tecnologías
  const [newTech, setNewTech] = useState("");

  // Estado del formulario
  const [formData, setFormData] = useState<Partial<Project>>({
    title: project?.title || "",
    slug: project?.slug || "",
    summary: project?.summary || "",
    description_md: project?.description_md || "",
    status: project?.status || "in_production",
    cover_url: project?.cover_url || "",
    demo_url: project?.demo_url || "",
    repo_url: project?.repo_url || "",
    visible: project?.visible || false,
    tech_stack: project?.tech_stack || [],
    tags: project?.tags || [],
    gallery_urls: project?.gallery_urls || [],
  });

  // Cliente Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Manejador de Inputs de Texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador de Toggles (Checkbox)
  const handleToggle = (field: keyof Project) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // --- LÓGICA DE TECNOLOGÍAS ---
  const handleAddTech = () => {
    if (!newTech.trim()) return;
    
    const techObject = { name: newTech.trim() }; // Por ahora solo nombre, sin icono
    
    setFormData((prev) => ({
      ...prev,
      tech_stack: [...(prev.tech_stack || []), techObject]
    }));
    setNewTech(""); // Limpiar input
  };

  const handleRemoveTech = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack?.filter((_, i) => i !== index)
    }));
  };

  const handleKeyDownTech = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evitar submit del form
      handleAddTech();
    }
  };
  // ------------------------------

  // Subida de Imagen a Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage.from('projects').getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, cover_url: data.publicUrl }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  // Subida de Galería (Múltiple)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingGallery(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('projects').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      setFormData((prev) => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), ...newUrls] }));
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Error al subir imágenes a la galería');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_urls: prev.gallery_urls?.filter((_, i) => i !== index)
    }));
  };

  // Guardar (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataToSave = {
        ...formData,
        slug: formData.slug || formData.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        // updated_at ya no es necesario manual si la DB tiene default, pero si lo sacamos:
        // updated_at: new Date().toISOString(),
      };

      let error;
      
      if (project?.id) {
        const { error: updateError } = await supabase
          .from("projects")
          .update(dataToSave)
          .eq("id", project.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("projects")
          .insert([dataToSave]);
        error = insertError;
      }

      if (error) throw error;

      router.push("/admin/projects");
      router.refresh();
      
    } catch (error: any) {
      console.error("Error saving project:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
      
      {/* HEADER STICKY */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md p-4 -mx-4 md:mx-0 md:rounded-xl border-b md:border border-border flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">
          {project ? "Editar Proyecto" : "Nuevo Proyecto"}
        </h2>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {project ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Información Básica */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
              Información Básica
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Título del Proyecto</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: E-commerce Web"
                className="w-full p-2 rounded-md border border-input bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resumen Corto (SEO)</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Una breve descripción que aparecerá en la tarjeta..."
                className="w-full p-2 rounded-md border border-input bg-background h-24 resize-none"
                required
              />
            </div>
          </div>

          {/* Markdown */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
              Caso de Estudio (Markdown)
            </h3>
            <textarea
              name="description_md"
              value={formData.description_md}
              onChange={handleChange}
              placeholder="# Título Principal\n\nCuenta la historia de tu proyecto aquí..."
              className="w-full p-4 rounded-md border border-input bg-background font-mono text-sm h-96"
              required
            />
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          
          {/* Configuración */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Configuración</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-input bg-background"
              >
                <option value="in_production">En Desarrollo</option>
                <option value="launched">Lanzado (Vivo)</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="finished">Finalizado</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-sm font-medium">Visible al público</span>
              <button
                type="button"
                onClick={() => handleToggle("visible")}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  formData.visible ? "bg-primary" : "bg-input"
                )}
              >
                <span className={cn(
                  "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                  formData.visible ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>

          {/* NUEVA SECCIÓN: Tecnologías */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              Tecnologías
            </h3>
            
            <div className="flex gap-2">
              <input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={handleKeyDownTech}
                placeholder="Ej: React, Node.js..."
                className="flex-1 p-2 rounded-md border border-input bg-background text-sm"
              />
              <Button type="button" onClick={handleAddTech} size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.tech_stack?.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Sin tecnologías agregadas.</p>
              )}
              {formData.tech_stack?.map((tech, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium animate-in zoom-in duration-200"
                >
                  {tech.name}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTech(index)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Imagen de Portada */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Imagen de Portada</h3>
            <div className="relative aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors group">
              {formData.cover_url ? (
                <>
                  <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Cambiar imagen</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs">Subir imagen</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* NUEVA SECCIÓN: Galería */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Galería
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {formData.gallery_urls?.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary">
                {uploadingGallery ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-medium">Agregar</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
              </label>
            </div>
          </div>

          {/* Enlaces */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Enlaces</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repositorio (GitHub)</label>
              <input
                name="repo_url"
                value={formData.repo_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Demo en Vivo</label>
              <input
                name="demo_url"
                value={formData.demo_url}
                onChange={handleChange}
                placeholder="https://mi-proyecto.com"
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}