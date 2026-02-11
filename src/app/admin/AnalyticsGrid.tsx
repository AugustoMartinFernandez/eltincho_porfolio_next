"use client";

import { MapPin, Smartphone, FileText, Globe, Laptop, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricItem = { x: string; y: number };

export default function AnalyticsGrid({
  topPages,
  topCountries,
  topDevices,
  topReferrers,
  topBrowsers,
  topCities,
}: {
  topPages: MetricItem[];
  topCountries: MetricItem[];
  topDevices: MetricItem[];
  topReferrers: MetricItem[];
  topBrowsers: MetricItem[];
  topCities: MetricItem[];
}) {
  const countryNames = new Intl.DisplayNames(["es"], { type: "region" });

  const tryName = (code: string) => {
    try { return countryNames.of(code); } catch { return code; }
  };

  const renderList = (items: MetricItem[], type: "country" | "text") => {
    if (!items || items.length === 0) return <p className="text-sm text-muted-foreground py-4 italic">Sin datos registrados.</p>;
    
    // Calculamos el máximo para la escala de la barra (100%)
    const maxVal = Math.max(...items.map((i) => i.y));

    return (
      <div className="space-y-3 mt-4">
        {items.map((item) => (
          <div key={item.x} className="relative flex items-center justify-between text-sm group z-0">
            {/* Barra de Fondo (Gráfico) */}
            <div 
              className="absolute inset-y-0 left-0 bg-primary/10 rounded-r-md transition-all duration-500" 
              style={{ width: `${(item.y / maxVal) * 100}%`, zIndex: -1 }} 
            />
            
            <div className="flex items-center gap-2 pl-2 z-10 w-[75%]">
              <span className="font-medium truncate" title={item.x}>
                {type === "country" ? (tryName(item.x)) : item.x}
              </span>
            </div>
            <span className="pr-2 z-10 text-muted-foreground font-mono text-xs">{item.y}</span>
          </div>
        ))}
      </div>
    );
  };

  const Card = ({ title, icon: Icon, data, type }: any) => (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="flex-1">{renderList(data, type)}</div>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      <Card title="Páginas más vistas" icon={FileText} data={topPages} type="text" />
      <Card title="Ubicación Geográfica" icon={MapPin} data={topCountries} type="country" />
      <Card title="Fuentes de Tráfico" icon={Globe} data={topReferrers} type="text" />
      <Card title="Ciudades Principales" icon={Building2} data={topCities} type="text" />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
         <Card title="Sistemas Operativos" icon={Smartphone} data={topDevices} type="text" />
         <Card title="Navegadores" icon={Laptop} data={topBrowsers} type="text" />
      </div>
    </div>
  );
}