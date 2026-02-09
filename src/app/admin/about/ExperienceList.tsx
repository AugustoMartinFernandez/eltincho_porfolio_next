"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Briefcase, Pencil, Save, X, Eye, EyeOff } from "lucide-react";
import Button from "@/components/Button";
import { Experience } from "@/types/about";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ExperienceList({ items }: { items: Experience[] }) {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Experience>>({ 
      company_name: "", role_title: "", start_date: "", end_date: null, description_md: "", visible: true 
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<Experience>>({});

  const handleAdd = async () => {
    if (!newItem.company_name || !newItem.role_title || !newItem.start_date) {
        toast.warning("Completa los campos obligatorios: Rol, Empresa y Fecha Inicio.");
        return;
    }
    
    // Limpiamos string vacíos de fecha para que vayan como null a la DB
    const payload = { 
        ...newItem, 
        end_date: newItem.end_date || null 
    };

    const { error } = await supabase.from("experience").insert([payload]);
    if (error) {
        console.error(error);
        toast.error("No se pudo crear la experiencia");
    } else {
        setNewItem({ company_name: "", role_title: "", start_date: "", end_date: null, description_md: "", visible: true });
        setIsAdding(false);
        router.refresh();
        toast.success("Experiencia guardada");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("experience").update({
      ...editItem,
      end_date: editItem.end_date || null
    }).eq("id", editingId);

    if (error) toast.error("No se pudo actualizar la experiencia");
    else {
        setEditingId(null);
        router.refresh();
        toast.success("Experiencia actualizada");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Estás seguro de eliminar esta experiencia?")) return;
    await supabase.from("experience").delete().eq("id", id);
    router.refresh();
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("experience").update({ visible: !current }).eq("id", id);
    router.refresh();
  };

  const startEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setEditItem({ ...exp, end_date: exp.end_date || "" });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 h-fit">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary"/> Experiencia
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? "Cerrar" : "Agregar"}
        </Button>
      </div>
      
      {/* Formulario de Agregar Nuevo (Colapsable) */}
      {isAdding && (
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-semibold text-primary">Nueva Experiencia</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Rol (ej: Frontend Dev)" value={newItem.role_title} onChange={e => setNewItem({...newItem, role_title: e.target.value})} className="p-2 text-sm border rounded bg-background w-full"/>
              <input placeholder="Empresa" value={newItem.company_name} onChange={e => setNewItem({...newItem, company_name: e.target.value})} className="p-2 text-sm border rounded bg-background w-full"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Inicio</label>
                <input type="date" value={newItem.start_date} onChange={e => setNewItem({...newItem, start_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Fin (Vacío = Actualidad)</label>
                <input type="date" value={newItem.end_date || ""} onChange={e => setNewItem({...newItem, end_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
              </div>
            </div>
            <textarea 
              placeholder="Descripción de responsabilidades (Markdown)..." 
              value={newItem.description_md} 
              onChange={e => setNewItem({...newItem, description_md: e.target.value})} 
              className="w-full p-2 text-sm border rounded bg-background resize-y min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAdd}>Guardar Experiencia</Button>
            </div>
          </div>
      )}

      {/* Lista de Items */}
      <div className="space-y-3">
        {items.length === 0 && !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-4 italic">No hay experiencias registradas.</p>
        )}

        {items.map(exp => (
          <div key={exp.id} className={cn("p-4 rounded-lg border transition-all", editingId === exp.id ? "bg-card border-primary ring-1 ring-primary" : "bg-card border-border hover:border-primary/50")}>
            
            {editingId === exp.id ? (
              /* MODO EDICIÓN */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input value={editItem.role_title} onChange={e => setEditItem({...editItem, role_title: e.target.value})} className="p-2 text-sm border rounded bg-background font-semibold" placeholder="Rol" />
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
                  rows={4} 
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1"/> Cancelar</Button>
                  <Button size="sm" onClick={handleUpdate}><Save className="h-4 w-4 mr-1"/> Actualizar</Button>
                </div>
              </div>
            ) : (
              /* MODO VISUALIZACIÓN */
              <div className="flex justify-between items-start group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground">{exp.role_title}</p>
                    {!exp.visible && <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-500/20">Oculto</span>}
                  </div>
                  <p className="text-xs text-primary font-medium">{exp.company_name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {exp.start_date} — {exp.end_date || "ACTUALIDAD"}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(exp.id, exp.visible)} title={exp.visible ? "Ocultar" : "Mostrar"}>
                    {exp.visible ? <Eye className="h-4 w-4 text-muted-foreground"/> : <EyeOff className="h-4 w-4 text-muted-foreground"/>}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(exp)} title="Editar">
                    <Pencil className="h-4 w-4 text-primary"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} title="Eliminar">
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