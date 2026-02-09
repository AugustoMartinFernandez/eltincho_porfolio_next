import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { FolderKanban, MessageSquare, Eye } from "lucide-react";

// Helper para crear cliente servidor en Next 15 (App Router)
// Esto lo moveremos a una librería compartida después, pero por ahora lo ponemos aquí para que funcione ya.
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Obtenemos datos reales para el resumen
  const { count: projectCount } = await supabase.from("projects").select("*", { count: "exact", head: true });
  const { count: messageCount } = await supabase.from("contact_messages").select("*", { count: "exact", head: true });
  // Simulamos views por ahora, ya que no implementamos analytics real
  const viewsCount = 1250; 

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control de tu portfolio.</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        
        <StatsCard 
          title="Proyectos Totales" 
          value={projectCount || 0} 
          icon={FolderKanban} 
          description="Proyectos publicados o en borrador"
        />
        
        <StatsCard 
          title="Mensajes Recibidos" 
          value={messageCount || 0} 
          icon={MessageSquare} 
          description="Consultas de contacto"
        />
        
        <StatsCard 
          title="Visitas Totales" 
          value={viewsCount} 
          icon={Eye} 
          description="Visualizaciones estimadas"
        />

      </div>
    </div>
  );
}

// Componente pequeño para las tarjetas de estadísticas
function StatsCard({ title, value, icon: Icon, description }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="pt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}