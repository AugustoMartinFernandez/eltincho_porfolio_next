"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, GraduationCap, Pencil, Save, X, Eye, EyeOff, Upload, Loader2, FileText } from "lucide-react";
import Button from "@/components/Button";
import { Education } from "@/types/about";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EducationList({ items }: { items: Education[] }) {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Education>>({ 
      institution_name: "", degree_title: "", start_date: "", end_date: null, visible: true, certificate_url: ""
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<Education>>({});
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `cert_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const path = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const setter = target === 'new' ? setNewItem : setEditItem;
      setter(prev => ({ ...prev, certificate_url: data.publicUrl }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error al subir certificado.");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.institution_name || !newItem.degree_title || !newItem.start_date) {
        toast.warning("Completa Institución, Título y Fecha de Inicio.");
        return;
    }
    
    const { error } = await supabase.from("education").insert([{ 
        ...newItem, 
        end_date: newItem.end_date || null 
    }]);

    if (error) toast.error("Error al guardar educación");
    else {
        setNewItem({ institution_name: "", degree_title: "", start_date: "", end_date: null, visible: true, certificate_url: "" });
        setIsAdding(false);
        router.refresh();
        toast.success("Educación guardada correctamente");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("education").update({ 
        ...editItem, 
        end_date: editItem.end_date || null 
    }).eq("id", editingId);
    
    if (error) toast.error("Error al actualizar");
    else {
        setEditingId(null);
        router.refresh();
        toast.success("Educación actualizada correctamente");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Eliminar este registro académico?")) return;
    await supabase.from("education").delete().eq("id", id);
    router.refresh();
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("education").update({ visible: !current }).eq("id", id);
    router.refresh();
  };

  const startEdit = (edu: Education) => {
    setEditingId(edu.id);
    setEditItem({ ...edu, end_date: edu.end_date || "" });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 h-fit">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary"/> Educación
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? "Cerrar" : "Agregar"}
        </Button>
      </div>
      
      {/* Formulario Nuevo */}
      {isAdding && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-semibold text-primary">Nuevo Registro</h3>
            <input placeholder="Título / Certificación" value={newItem.degree_title} onChange={e => setNewItem({...newItem, degree_title: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
            <input placeholder="Institución Educativa" value={newItem.institution_name} onChange={e => setNewItem({...newItem, institution_name: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Inicio</label>
                 <input type="date" value={newItem.start_date} onChange={e => setNewItem({...newItem, start_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Fin (Vacío = En curso)</label>
                 <input type="date" value={newItem.end_date || ""} onChange={e => setNewItem({...newItem, end_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
              </div>
            </div>
            
            {/* Upload Certificado Nuevo */}
            <div className="flex items-center gap-2 text-xs">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                    <span>{newItem.certificate_url ? "Cambiar Certificado" : "Subir Certificado"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'new')} disabled={uploading} />
                </label>
                {newItem.certificate_url && <span className="text-green-600 flex items-center gap-1"><FileText className="h-3 w-3"/> Cargado</span>}
            </div>

            <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAdd}>Guardar</Button>
            </div>
          </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {items.length === 0 && !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-4 italic">No hay educación registrada.</p>
        )}

        {items.map(edu => (
          <div key={edu.id} className={cn("p-4 rounded-lg border transition-all", editingId === edu.id ? "bg-card border-primary ring-1 ring-primary" : "bg-card border-border hover:border-primary/50")}>
            {editingId === edu.id ? (
              <div className="space-y-3">
                <input value={editItem.degree_title} onChange={e => setEditItem({...editItem, degree_title: e.target.value})} className="w-full p-2 text-sm border rounded bg-background font-semibold" placeholder="Título" />
                <input value={editItem.institution_name} onChange={e => setEditItem({...editItem, institution_name: e.target.value})} className="w-full p-2 text-sm border rounded bg-background" placeholder="Institución" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={String(editItem.start_date)} onChange={e => setEditItem({...editItem, start_date: e.target.value})} className="p-2 text-sm border rounded bg-background" />
                  <input type="date" value={String(editItem.end_date || "")} onChange={e => setEditItem({...editItem, end_date: e.target.value})} className="p-2 text-sm border rounded bg-background" />
                </div>
                
                {/* Upload Certificado Edición */}
                <div className="flex items-center gap-2 text-xs pt-1">
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                        <span>{editItem.certificate_url ? "Cambiar Certificado" : "Subir Certificado"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'edit')} disabled={uploading} />
                    </label>
                    {editItem.certificate_url && <span className="text-green-600 flex items-center gap-1"><FileText className="h-3 w-3"/> Existe</span>}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1"/> Cancelar</Button>
                  <Button size="sm" onClick={handleUpdate}><Save className="h-4 w-4 mr-1"/> Actualizar</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground">{edu.degree_title}</p>
                    {!edu.visible && <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-500/20">Oculto</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{edu.institution_name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {edu.start_date.split("-")[0]} - {edu.end_date ? edu.end_date.split("-")[0] : "EN CURSO"}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(edu.id, edu.visible)} title="Alternar visibilidad">
                    {edu.visible ? <Eye className="h-4 w-4 text-muted-foreground"/> : <EyeOff className="h-4 w-4 text-muted-foreground"/>}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(edu)} title="Editar">
                    <Pencil className="h-4 w-4 text-primary"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}