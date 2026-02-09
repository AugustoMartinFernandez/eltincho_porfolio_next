"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, GraduationCap, Pencil, Save, X, Eye, EyeOff } from "lucide-react";
import Button from "@/components/Button";
import { Education } from "@/types/about";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EducationList({ items }: { items: Education[] }) {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const [newItem, setNewItem] = useState({ institution_name: "", degree_title: "", start_date: "", end_date: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<Education>>({});

  const handleAdd = async () => {
    if (!newItem.institution_name) return;
    await supabase.from("education").insert([{ ...newItem, end_date: newItem.end_date || null }]);
    setNewItem({ institution_name: "", degree_title: "", start_date: "", end_date: "" });
    router.refresh();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await supabase.from("education").update({ ...editItem, end_date: editItem.end_date || null }).eq("id", editingId);
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Eliminar?")) return;
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
      <h2 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary"/> Educación</h2>
      
      <div className="space-y-3">
        {items.map(edu => (
          <div key={edu.id} className={cn("p-4 rounded-lg border transition-all", editingId === edu.id ? "bg-primary/5 border-primary" : "bg-muted/20 border-border")}>
            {editingId === edu.id ? (
              <div className="space-y-3">
                <input value={editItem.degree_title} onChange={e => setEditItem({...editItem, degree_title: e.target.value})} className="w-full p-2 text-sm border rounded bg-background" placeholder="Título" />
                <input value={editItem.institution_name} onChange={e => setEditItem({...editItem, institution_name: e.target.value})} className="w-full p-2 text-sm border rounded bg-background" placeholder="Institución" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={String(editItem.start_date)} onChange={e => setEditItem({...editItem, start_date: e.target.value})} className="p-2 text-sm border rounded bg-background" />
                  <input type="date" value={String(editItem.end_date || "")} onChange={e => setEditItem({...editItem, end_date: e.target.value})} className="p-2 text-sm border rounded bg-background" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1"/> Cancelar</Button>
                  <Button size="sm" onClick={handleUpdate}><Save className="h-4 w-4 mr-1"/> Guardar</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{edu.degree_title}</p>
                    {!edu.visible && <span className="text-[10px] bg-muted-foreground/20 px-1.5 rounded text-muted-foreground">Oculto</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{edu.institution_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{edu.start_date.split("-")[0]} - {edu.end_date ? edu.end_date.split("-")[0] : "Presente"}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(edu.id, edu.visible)} className="h-8 w-8 text-muted-foreground">
                    {edu.visible ? <Eye className="h-3 w-3"/> : <EyeOff className="h-3 w-3"/>}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(edu)} className="h-8 w-8 text-primary hover:bg-primary/10">
                    <Pencil className="h-3 w-3"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3"/>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Agregar Educación</p>
        <input placeholder="Título (Ej: Ing. Sistemas)" value={newItem.degree_title} onChange={e => setNewItem({...newItem, degree_title: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
        <input placeholder="Institución" value={newItem.institution_name} onChange={e => setNewItem({...newItem, institution_name: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={newItem.start_date} onChange={e => setNewItem({...newItem, start_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
          <input type="date" value={newItem.end_date} onChange={e => setNewItem({...newItem, end_date: e.target.value})} className="w-full p-2 text-sm border rounded bg-background"/>
        </div>
        <Button onClick={handleAdd} className="w-full" disabled={!newItem.degree_title}>
          <Plus className="h-4 w-4 mr-2"/> Agregar Educación
        </Button>
      </div>
    </div>
  );
}