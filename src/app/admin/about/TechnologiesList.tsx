"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Cpu, Pencil, Save, X, Eye, EyeOff, Upload, Image as ImageIcon } from "lucide-react";
import Button from "@/components/Button";
import { Technology, TechCategory, TechRank } from "@/types/about";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES: { value: TechCategory; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Base de Datos' },
  { value: 'infrastructure', label: 'Infraestructura' },
  { value: 'tool', label: 'Herramientas' },
];

const RANKS: { value: TechRank; label: string }[] = [
  { value: 'primary', label: 'Principal (Destacado)' },
  { value: 'secondary', label: 'Secundario (Lista)' },
  { value: 'experimental', label: 'Experimental' },
];

export default function TechnologiesList({ items }: { items: Technology[] }) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const defaultNewItem: Partial<Technology> = { 
    name: "", category: 'frontend', rank: 'secondary', visible: true, icon_url: "" 
  };
  const [newItem, setNewItem] = useState<Partial<Technology>>(defaultNewItem);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<Technology>>({});

  // Subida de imagen
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `tech_${Date.now()}.${fileExt}`;
    const path = `tech/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      
      if (isEdit) {
        setEditItem(prev => ({ ...prev, icon_url: data.publicUrl }));
      } else {
        setNewItem(prev => ({ ...prev, icon_url: data.publicUrl }));
      }
      toast.success("Icono subido correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.name || !newItem.icon_url) {
      toast.warning("El nombre y el icono son obligatorios.");
      return;
    }
    
    const { error } = await supabase.from("technologies").insert([newItem]);

    if (error) {
      toast.error("Error al guardar tecnología");
    } else {
      setNewItem(defaultNewItem);
      setIsAdding(false);
      toast.success("Tecnología agregada");
      router.refresh();
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("technologies").update(editItem).eq("id", editingId);
    
    if (error) {
      toast.error("Error al actualizar");
    } else {
      setEditingId(null);
      toast.success("Actualizado correctamente");
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Eliminar esta tecnología?")) return;
    const { error } = await supabase.from("technologies").delete().eq("id", id);
    if (error) toast.error("Error al eliminar");
    else {
      toast.success("Eliminado");
      router.refresh();
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("technologies").update({ visible: !current }).eq("id", id);
    router.refresh();
  };

  const startEdit = (tech: Technology) => {
    setEditingId(tech.id);
    setEditItem(tech);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 h-fit">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary"/> Stack Tecnológico
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? "Cerrar" : "Agregar"}
        </Button>
      </div>
      
      {/* Formulario Nuevo */}
      {isAdding && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-semibold text-primary">Nueva Tecnología</h3>
            
            <div className="flex gap-4 items-start">
              {/* Image Preview / Upload */}
              <div className="relative w-16 h-16 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0 group cursor-pointer">
                {newItem.icon_url ? (
                  <img src={newItem.icon_url} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Upload className="h-4 w-4 text-white" />
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="flex-1 space-y-3">
                 <input 
                    placeholder="Nombre (ej: React)" 
                    value={newItem.name} 
                    onChange={e => setNewItem({...newItem, name: e.target.value})} 
                    className="w-full p-2 text-sm border rounded bg-background"
                 />
                 <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={newItem.category} 
                      onChange={e => setNewItem({...newItem, category: e.target.value as TechCategory})}
                      className="p-2 text-sm border rounded bg-background"
                    >
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <select 
                      value={newItem.rank} 
                      onChange={e => setNewItem({...newItem, rank: e.target.value as TechRank})}
                      className="p-2 text-sm border rounded bg-background"
                    >
                      {RANKS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAdd} disabled={uploading} isLoading={uploading}>Guardar</Button>
            </div>
          </div>
      )}

      {/* Lista Agrupada por Categoría */}
      <div className="space-y-6">
        {CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat.value);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.value} className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border/50 pb-1">{cat.label}</h4>
                <div className="grid gap-2">
                  {catItems.map(tech => (
                    <div key={tech.id} className={cn("p-3 rounded-lg border flex items-center gap-3 transition-all", editingId === tech.id ? "bg-card border-primary ring-1 ring-primary" : "bg-card border-border hover:border-primary/50")}>
                      
                      {editingId === tech.id ? (
                        /* MODO EDICIÓN */
                        <div className="flex-1 flex gap-3 items-center">
                           <div className="relative w-10 h-10 rounded border bg-background flex items-center justify-center overflow-hidden shrink-0 group">
                              <img src={editItem.icon_url} className="w-full h-full object-contain p-1" />
                              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                           <div className="flex-1 grid gap-2">
                              <input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="p-1 text-sm border rounded bg-background" />
                              <div className="flex gap-2">
                                <select value={editItem.category} onChange={e => setEditItem({...editItem, category: e.target.value as TechCategory})} className="p-1 text-xs border rounded bg-background w-full">
                                   {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <select value={editItem.rank} onChange={e => setEditItem({...editItem, rank: e.target.value as TechRank})} className="p-1 text-xs border rounded bg-background w-full">
                                   {RANKS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                              </div>
                           </div>
                           <div className="flex flex-col gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleUpdate}><Save className="h-3 w-3"/></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setEditingId(null)}><X className="h-3 w-3"/></Button>
                           </div>
                        </div>
                      ) : (
                        /* MODO VISTA */
                        <>
                          <div className="w-8 h-8 rounded bg-background/50 p-1 flex items-center justify-center border border-border/30">
                            <img src={tech.icon_url} alt={tech.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{tech.name}</p>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", tech.rank === 'primary' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary text-muted-foreground border-transparent")}>
                                {tech.rank === 'primary' ? 'Principal' : tech.rank}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-60 hover:opacity-100">
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisibility(tech.id, tech.visible)}>
                                {tech.visible ? <Eye className="h-3.5 w-3.5"/> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground"/>}
                             </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(tech)}>
                                <Pencil className="h-3.5 w-3.5"/>
                             </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(tech.id)}>
                                <Trash2 className="h-3.5 w-3.5"/>
                             </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}