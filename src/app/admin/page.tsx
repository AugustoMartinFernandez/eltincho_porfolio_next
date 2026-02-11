import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { FolderKanban, MessageSquare } from "lucide-react";
import DashboardStats from "./DashboardStats";
import AnalyticsGrid from "@/app/admin/AnalyticsGrid";
import TrafficChart from "./TrafficChart";
import WorldMap from "@/app/admin/WorldMap";

// --- CLIENTE SUPABASE SERVER-SIDE ---
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

// --- FUNCIÓN FETCH DE UMAMI ROBUSTA ---
async function getUmamiData() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const apiKey = process.env.UMAMI_API_KEY;

  // Estructura vacía segura por defecto
  const empty = { 
    chartData: [], 
    totalViews: 0, 
    totalVisitors: 0, 
    topPages: [], 
    topCountries: [], 
    topCities: [], 
    topDevices: [], 
    topReferrers: [], 
    topBrowsers: [] 
  };

  if (!websiteId || !apiKey) return empty;

  const endAt = Date.now();
  const startAt = endAt - (24 * 60 * 60 * 1000); // 24 horas atrás
  const headers = { 'x-umami-api-key': apiKey };
  const base = `https://api.umami.is/v1/websites/${websiteId}`;
  
  const listParams = `startAt=${new Date("2024-01-01").getTime()}&endAt=${endAt}&limit=5`;
  const chartParams = `startAt=${startAt}&endAt=${endAt}&unit=hour`;

  try {
    const [statsRes, pagesRes, countryRes, cityRes, deviceRes, refRes, browserRes] = await Promise.all([
      fetch(`${base}/stats?${chartParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/metrics?type=url&${listParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/metrics?type=country&${listParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/metrics?type=city&${listParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/metrics?type=os&${listParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/metrics?type=referrer&${listParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/metrics?type=browser&${listParams}`, { headers, next: { revalidate: 60 } }),
    ]);

    // 🛡️ BLOQUE DEFENSIVO: Validamos cada respuesta JSON
    const statsData = statsRes.ok ? await statsRes.json() : {};
    
    // Validación explícita: ¿Existe pageviews y es un array? Si no, array vacío.
    const chartData = (statsData && Array.isArray(statsData.pageviews)) ? statsData.pageviews : [];
    
    // Validación explícita: ¿Existe visitors y es un array? Si no, array vacío.
    const visitorsData = (statsData && Array.isArray(statsData.visitors)) ? statsData.visitors : [];

    // Ahora reduce() es seguro porque chartData y visitorsData SIEMPRE son arrays
    const totalViews = chartData.reduce((acc: number, curr: any) => acc + (Number(curr.y) || 0), 0);
    const totalVisitors = visitorsData.reduce((acc: number, curr: any) => acc + (Number(curr.y) || 0), 0);

    return {
      chartData,
      totalViews,
      totalVisitors,
      topPages: pagesRes.ok ? await pagesRes.json() : [], 
      topCountries: countryRes.ok ? await countryRes.json() : [], 
      topCities: cityRes.ok ? await cityRes.json() : [],
      topDevices: deviceRes.ok ? await deviceRes.json() : [],
      topReferrers: refRes.ok ? await refRes.json() : [],
      topBrowsers: browserRes.ok ? await browserRes.json() : [],
    };
  } catch (error) {
    console.error("Umami Fetch Error (Handled):", error);
    return empty; // Retorno seguro en caso de fallo catastrófico
  }
}

// --- COMPONENTE PRINCIPAL ---
export default async function AdminDashboard() {
  const supabase = await createClient();
  const data = await getUmamiData();

  // Obtenemos datos de Supabase para las tarjetas inferiores
  const { count: projectCount } = await supabase.from("projects").select("*", { count: "exact", head: true });
  const { count: messageCount } = await supabase.from("contact_messages").select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Ingeniería</h2>
          <p className="text-muted-foreground">Visión global del sistema y métricas en tiempo real.</p>
        </div>
      </div>

      {/* Métricas Principales (Realtime + Umami) */}
      <Suspense fallback={<div className="h-32 w-full bg-muted/20 animate-pulse rounded-xl" />}>
        <DashboardStats totalViews={data.totalViews} totalVisitors={data.totalVisitors} />
      </Suspense>

      {/* Gráfico de Tráfico */}
      <Suspense fallback={<div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-xl" />}>
        <TrafficChart data={data.chartData} />
      </Suspense>

      {/* Mapa Mundial de Audiencia */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl" />}>
          <WorldMap data={data.topCountries} />
        </Suspense>
      </div>

      {/* Tarjetas de Resumen de Contenido */}
      <div className="grid gap-4 md:grid-cols-2 mt-8">
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
      </div>

      {/* Métricas Detalladas (BI) */}
      <h3 className="text-lg font-medium mt-8">Detalle de Tráfico</h3>
      <Suspense fallback={<div className="h-64 w-full bg-muted/20 animate-pulse rounded-xl" />}>
        <AnalyticsGrid 
          topPages={data.topPages}
          topCountries={data.topCountries}
          topCities={data.topCities}
          topDevices={data.topDevices}
          topReferrers={data.topReferrers}
          topBrowsers={data.topBrowsers}
        />
      </Suspense>
    </div>
  );
}

// --- SUB-COMPONENTE ---
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