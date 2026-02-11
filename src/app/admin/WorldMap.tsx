"use client";

import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";

// URL del mapa mundial simplificado
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({ data }: { data: { x: string; y: number }[] }) {
  // Escala de color dinámica
  const colorScale = useMemo(() => {
    // Si no hay datos, devolvemos una función dummy para evitar errores
    if (!data || data.length === 0) return () => "#e2e8f0";

    const values = data.map(d => d.y);
    return scaleQuantile<string>()
      .domain(values)
      .range([
        "#e2e8f0", // Slate-200 (Menos visitas)
        "#cbd5e1", // Slate-300
        "#94a3b8", // Slate-400
        "#60a5fa", // Blue-400
        "#3b82f6", // Blue-500
        "#2563eb", // Blue-600 (Más visitas - Primary aproximado)
      ]);
  }, [data]);

  return (
    <div className="w-full h-[400px] rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden relative">
      <h3 className="text-lg font-semibold mb-4">Audiencia Global</h3>
      
      <div className="h-[320px] w-full">
        <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}>
          <Geographies geography={GEO_URL}>
            {/* Aquí es donde corregimos el tipo explícito para que TypeScript no se queje */}
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                // Buscamos si el país del mapa está en nuestros datos
                // geo.properties.iso_a2 es el código de 2 letras (ej: AR, US)
                const cur = data.find(s => s.x === geo.properties.iso_a2);
                const value = cur ? cur.y : 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    // @ts-ignore - Ignoramos tipado estricto de d3 aquí
                    fill={value ? colorScale(value) : "#f1f5f9"}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#1e293b", outline: "none", cursor: "pointer" }, // Slate-800 on hover
                      pressed: { outline: "none" },
                    }}
                    title={`${geo.properties.name}: ${value}`}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}