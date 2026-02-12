"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Briefcase, GraduationCap, Cpu, Plus, Pencil, Trash2, 
  X, Save, Loader2, Eye, EyeOff, Upload, Calendar, FileText 
} from "lucide-react";
import { AboutMe, Experience, Education, Technology, TechCategory, TechRank } from "@/types/about";
import AboutForm from "./AboutForm";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { 
  createExperience, updateExperience, deleteExperience,
  createEducation, updateEducation, deleteEducation,
  createTechnology, updateTechnology, deleteTechnology
} from "@/lib/actions";
import TechStack from "@/domains/about/TechStack";

// --- TIPOS ---
type TabType = "profile" | "experience" | "education" | "technologies";

interface Props {
  profile: AboutMe;
  experiences: Experience[];
  education: Education[];
  technologies: Technology[];
}

// --- COMPONENTE PRINCIPAL ---
export default function AboutClientView({ profile, experiences, education, technologies }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Exclude<TabType, "profile"> | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (type: Exclude<TabType, "profile">, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setModalType(null);
  };

  // Configuración de Pestañas
  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "experience", label: "Experiencia", icon: Briefcase },
    { id: "education", label: "Educación", icon: GraduationCap },
    { id: "technologies", label: "Stack Tech", icon: Cpu },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. NAVEGACIÓN DE PESTAÑAS (Cyberpunk Style) */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                isActive 
                  ? "text-primary shadow-[0_0_15px_rgba(var(--primary),0.15)] bg-background border border-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "animate-pulse")} />
              <span className="relative z-10">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/5 rounded-lg -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. CONTENIDO DINÁMICO */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "profile" && <AboutForm initialData={profile} />}
            
            {activeTab === "experience" && (
              <ListView 
                items={experiences} 
                type="experience" 
                onAdd={() => openModal("experience")}
                onEdit={(item) => openModal("experience", item)}
              />
            )}

            {activeTab === "education" && (
              <ListView 
                items={education} 
                type="education" 
                onAdd={() => openModal("education")}
                onEdit={(item) => openModal("education", item)}
              />
            )}

            {activeTab === "technologies" && (
              <ListView 
                items={technologies} 
                type="technologies" 
                onAdd={() => openModal("technologies")}
                onEdit={(item) => openModal("technologies", item)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. MODAL DE EDICIÓN */}
      <AnimatePresence>
        {isModalOpen && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {editingItem ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                  {editingItem ? "Editar" : "Agregar"} {modalType === 'experience' ? 'Experiencia' : modalType === 'education' ? 'Educación' : 'Tecnología'}
                </h3>
                <button onClick={closeModal} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {modalType === "experience" && <ExperienceForm item={editingItem} onClose={closeModal} />}
                {modalType === "education" && <EducationForm item={editingItem} onClose={closeModal} />}
                {modalType === "technologies" && <TechnologyForm item={editingItem} onClose={closeModal} />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTE DE LISTA GENÉRICO ---
function ListView({ items, type, onAdd, onEdit }: { items: any[], type: string, onAdd: () => void, onEdit: (item: any) => void }) {
  
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este elemento?")) return;
    
    let res;
    if (type === "experience") res = await deleteExperience(id);
    else if (type === "education") res = await deleteEducation(id);
    else if (type === "technologies") res = await deleteTechnology(id);

    if (res?.success) toast.success("Elemento eliminado");
    else toast.error("Error al eliminar");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Agregar Nuevo
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No hay elementos registrados.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all shadow-sm">
              <div className="flex items-center gap-4">
                {/* Icono o Imagen según tipo */}
                {type === "technologies" && item.icon_url && (
                  <div className="h-10 w-10 rounded-lg bg-muted p-1.5 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon_url} alt="" className="w-full h-full object-contain" />
                  </div>
                )}
                
                <div>
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    {type === "experience" ? item.role_title : type === "education" ? item.degree_title : item.name}
                    {!item.visible && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded border border-yellow-500/20">Oculto</span>}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {type === "experience" ? item.company_name : type === "education" ? item.institution_name : item.category}
                  </p>
                  {(type === "experience" || type === "education") && (
                    <p className="text-xs text-muted-foreground/70 font-mono mt-1">
                      {item.start_date} — {item.current ? "Actualidad" : (item.end_date || "Presente")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- FORMULARIOS ESPECÍFICOS ---

function ExperienceForm({ item, onClose }: { item?: Experience, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isCurrent, setIsCurrent] = useState(item?.current || false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (item) res = await updateExperience(item.id, formData);
    else res = await createExperience(formData);

    setLoading(false);
    if (res.success) {
      toast.success(item ? "Experiencia actualizada" : "Experiencia creada");
      onClose();
    } else {
      toast.error(res.error || "Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rol / Título</label>
          <input name="role_title" defaultValue={item?.role_title} required className="w-full p-2 rounded-md border bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Empresa</label>
          <input name="company_name" defaultValue={item?.company_name} required className="w-full p-2 rounded-md border bg-background" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha Inicio</label>
          <input type="date" name="start_date" defaultValue={item?.start_date} required className="w-full p-2 rounded-md border bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha Fin</label>
          <input type="date" name="end_date" defaultValue={item?.end_date || ""} disabled={isCurrent} className="w-full p-2 rounded-md border bg-background disabled:opacity-50" />
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" name="current" value="true" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} id="curr_exp" />
            <label htmlFor="curr_exp" className="text-xs text-muted-foreground cursor-pointer">Trabajo actual</label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción (Markdown)</label>
        <textarea name="description_md" defaultValue={item?.description_md} rows={5} className="w-full p-2 rounded-md border bg-background font-mono text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="visible" value="true" defaultChecked={item?.visible ?? true} id="vis_exp" />
        <label htmlFor="vis_exp" className="text-sm">Visible públicamente</label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>Guardar</Button>
      </div>
    </form>
  );
}

function EducationForm({ item, onClose }: { item?: Education, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [certUrl, setCertUrl] = useState(item?.certificate_url || "");
  const [isCurrent, setIsCurrent] = useState(item?.current || false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const path = `cert_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setCertUrl(data.publicUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("certificate_url", certUrl); // Append manual URL

    let res;
    if (item) res = await updateEducation(item.id, formData);
    else res = await createEducation(formData);

    setLoading(false);
    if (res.success) {
      toast.success("Educación guardada");
      onClose();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <input name="degree_title" defaultValue={item?.degree_title} required className="w-full p-2 rounded-md border bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Institución</label>
          <input name="institution_name" defaultValue={item?.institution_name} required className="w-full p-2 rounded-md border bg-background" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha Inicio</label>
          <input type="date" name="start_date" defaultValue={item?.start_date} required className="w-full p-2 rounded-md border bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha Fin</label>
          <input type="date" name="end_date" defaultValue={item?.end_date || ""} disabled={isCurrent} className="w-full p-2 rounded-md border bg-background disabled:opacity-50" />
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" name="current" value="true" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} id="curr_edu" />
            <label htmlFor="curr_edu" className="text-xs text-muted-foreground cursor-pointer">Cursando actualmente</label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Certificado</label>
        <div className="flex items-center gap-4 p-3 border rounded-md bg-muted/20">
          {certUrl ? (
            <a href={certUrl} target="_blank" className="text-xs text-primary underline truncate max-w-[200px]">{certUrl}</a>
          ) : <span className="text-xs text-muted-foreground">Sin certificado</span>}
          <label className="cursor-pointer ml-auto">
            <div className="flex items-center gap-2 text-xs bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/80">
              <Upload className="h-3 w-3" /> Subir
            </div>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="visible" value="true" defaultChecked={item?.visible ?? true} id="vis_edu" />
        <label htmlFor="vis_edu" className="text-sm">Visible públicamente</label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>Guardar</Button>
      </div>
    </form>
  );
}

function TechnologyForm({ item, onClose }: { item?: Technology, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // Estados controlados para Live Preview
  const [name, setName] = useState(item?.name || "");
  const [category, setCategory] = useState<TechCategory>(item?.category || "frontend");
  const [rank, setRank] = useState<TechRank>(item?.rank || "primary");
  const [visible, setVisible] = useState(item?.visible ?? true);
  const [iconUrl, setIconUrl] = useState(item?.icon_url || "");

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const path = `tech_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      setIconUrl(data.publicUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("icon_url", iconUrl);

    let res;
    if (item) res = await updateTechnology(item.id, formData);
    else res = await createTechnology(formData);

    setLoading(false);
    if (res.success) {
      toast.success("Tecnología guardada");
      onClose();
    } else {
      toast.error(res.error);
    }
  };

  // Objeto temporal para la vista previa
  const previewItem: Technology = {
    id: item?.id || "preview-id",
    name: name || "Nombre Tecnología",
    icon_url: iconUrl,
    category,
    rank,
    visible
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre</label>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 rounded-md border bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value as TechCategory)} className="w-full p-2 rounded-md border bg-background">
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="database">Database</option>
            <option value="tool">Herramienta</option>
            <option value="infrastructure">Infraestructura</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nivel (Rank)</label>
          <select name="rank" value={rank} onChange={(e) => setRank(e.target.value as TechRank)} className="w-full p-2 rounded-md border bg-background">
            <option value="primary">Principal (Experto)</option>
            <option value="secondary">Secundario (Intermedio)</option>
            <option value="experimental">Experimental (Básico)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Icono</label>
          <div className="flex items-center gap-3">
            {iconUrl && <img src={iconUrl} alt="" className="h-8 w-8 object-contain bg-muted rounded p-1" />}
            <input type="file" onChange={handleUpload} accept="image/*" className="text-xs" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="visible" value="true" checked={visible} onChange={(e) => setVisible(e.target.checked)} id="vis_tech" />
        <label htmlFor="vis_tech" className="text-sm">Visible públicamente</label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>Guardar</Button>
      </div>
    </form>

      {/* SECCIÓN DE VISTA PREVIA */}
      <div className="border-t border-border pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Eye className="h-3 w-3" /> Vista Previa en Vivo
        </h4>
        <div className="rounded-xl border border-border bg-background/50 p-6">
           <TechStack technologies={[previewItem]} />
        </div>
      </div>
    </div>
  );
}
