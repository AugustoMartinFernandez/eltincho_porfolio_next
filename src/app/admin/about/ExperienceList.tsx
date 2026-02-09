"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Briefcase, Pencil, X, Save, Eye, EyeOff } from "lucide-react";
import Button from "@/components/Button";
import { Experience } from "@/types/about";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ExperienceList({ items }: { items: Experience[] }) {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  // Estado para nuevo item
  const [newItem, setNewItem] = useState({ company_name: "", role_title: "", start_date: "", end_date: "", description_md: "" });
  
  // Estado para edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<Experience>>({});

  const handleAdd = async () => {
    if (!newItem.company_name || !newItem.role_title) return;
    await supabase.from("experience").insert([{ 
      ...newItem, 
      end_date: newItem.end_date || null 
    }]);
    setNewItem({ company_name: "", role_title: "", start_date: "", end_date: "", description_md: "" });
    router.refresh();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await supabase.from("experience").update({
      ...editItem,
      end_date: editItem.end_date || null
    }).eq("id", editingId);
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Eliminar experiencia?")) return;
    await supabase.from("experience").delete().eq("id", id);
    router.refresh();
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("experience").update({ visible: !current }).eq("id", id);
    router.refresh();
  };

  const startEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setEditItem({ 
      ...exp, 
      end_date: exp.end_date || "" // Manejo para inputs vacíos
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 h-fit">
      <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Experiencia</h2>
      
      {/* Lista de Items */}
      <div className="space-y-3">
        {items.map(exp => (
          <div key={exp.id} className={cn("p-4 rounded-lg border transition-all", editingId === exp.id ? "bg-primary/5 border-primary" : "bg-muted/20 border-border")}>
            
            {editingId === exp.id ? (
              /* MODO EDICIÓN */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input value={editItem.role_title} onChange={e => setEditItem({...editItem, role_title: e.target.value})} className="p-2 text-sm border rounded bg-background" placeholder="Rol" />
                  <input value={editItem.company_name} onChange={e => setEditItem({...editItem, company_name: e.target.value})} className="p-2 text-sm border rounded bg-background" placeholder="Empresa" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={String(editItem.start_date)} onChange={e => setEditItem({...editItem, start_date: e.target.value})} className="p-2 text-sm border rounded bg-background" />
                  <input type="date" value={String(editItem.end_date || "")} onChange={e => setEditItem({...editItem, end_date: e.target.value})} className="p-2 text-sm border rounded bg-background" />
                </div>
                <textarea 
                  value={editItem.description_md || ""} 
                  onChange={e => setEditItem({...editItem, description_md: e.target.value})} 
                  className="w-full p-2 text-sm border rounded bg-background font-mono" 
                  rows={3} 
                  placeholder="Descripción (Markdown)..." 
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1"/> Cancelar</Button>
                  <Button size="sm" onClick={handleUpdate}><Save className="h-4 w-4 mr-1"/> Guardar</Button>
                </div>
              </div>
            ) : (
              /* MODO VISUALIZACIÓN */
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{exp.role_title}</p>
                    {!exp.visible && <span className="text-[10px] bg-muted-foreground/20 px-1.5 rounded text-muted-foreground">Oculto</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{exp.company_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {exp.start_date} — {exp.end_date || "Presente"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(exp.id, exp.visible)} className="h-8 w-8 text-muted-foreground">
                    {exp.visible ? <Eye className="h-3 w-3"/> : <EyeOff className="h-3 w-3"/>}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(exp)} className="h-8 w-8 text-primary hover:bg-primary/10">
                    <Pencil className="h-3 w-3"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3"/>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulario de Agregar Nuevo */}
      <div className="space-y-3 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Agregar Nueva</p>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Rol (ej: Frontend Dev)" value={newItem.role_title} onChange={e => setNewItem({...newItem, role_title: e.target.value})} className="p-2 text-sm border rounded bg-background"/>
          <input placeholder="Empresa" value={newItem.company_name} onChange={e => setNewItem({...newItem, company_name: e.target.value})} className="p-2 text-sm border rounded bg-background"/>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Inicio</label>
            <input type="date" value={newItem.start_date} onChange={e => setNewItem({...newItem, start_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Fin (Dejar vacío si es actual)</label>
            <input type="date" value={newItem.end_date} onChange={e => setNewItem({...newItem, end_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
          </div>
        </div>
        <textarea 
          placeholder="Descripción de tareas (Markdown compatible)" 
          value={newItem.description_md} 
          onChange={e => setNewItem({...newItem, description_md: e.target.value})} 
          className="w-full p-2 text-sm border rounded bg-background resize-y min-h-[80px]"
        />
        <Button onClick={handleAdd} className="w-full" disabled={!newItem.role_title}>
          <Plus className="h-4 w-4 mr-2"/> Agregar Experiencia
        </Button>
      </div>
    </div>
  );
}